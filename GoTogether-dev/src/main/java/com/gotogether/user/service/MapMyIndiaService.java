package com.gotogether.user.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.gotogether.user.config.MapMyIndiaConfig;
import com.gotogether.user.dto.MapMyIndiaPlaceDTO;
import com.gotogether.user.dto.MapMyIndiaResponseDTO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class MapMyIndiaService {
    
    private final RestTemplate restTemplate;
    private final MapMyIndiaConfig mapMyIndiaConfig;
    
    /**
     * Get place suggestions from MapMyIndia API
     * @param query - Search query (place name, address, etc.)
     * @return List of place suggestions
     */
    public List<MapMyIndiaPlaceDTO> getSuggestedPlaces(String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                log.warn("Empty query parameter received");
                return new ArrayList<>();
            }
            
            // Build the API URL
            String apiUrl = buildMapMyIndiaUrl(query);
            System.out.println("MapMyIndia API URL: " + apiUrl);
            log.info("Calling MapMyIndia API with URL: {}", apiUrl);
            
            // Call MapMyIndia API
//            MapMyIndiaResponseDTO response = restTemplate.getForObject(apiUrl, MapMyIndiaResponseDTO.class);
            try {
                ResponseEntity<MapMyIndiaResponseDTO> responseEntity = 
                    restTemplate.getForEntity(apiUrl, MapMyIndiaResponseDTO.class);
                System.out.println("MapMyIndia API Response Status: " + responseEntity);
                if (responseEntity.getStatusCode().is2xxSuccessful()) {
                    MapMyIndiaResponseDTO response = responseEntity.getBody();
                    if(response != null) {
						List<MapMyIndiaPlaceDTO> places = response.getPlaces();
						if (places != null && !places.isEmpty()) {
							log.info("Received {} results from MapMyIndia API", places.size());
							System.out.println("Received " + places.size() + " results from MapMyIndia API");
							return places;
						} else {
							log.warn("No results received from MapMyIndia API for query: {}", query);
							System.out.println("No results received from MapMyIndia API for query: " + query);
						}
					} else {
						log.warn("No response body received from MapMyIndia API for query: {}", query);
					}
                    // Use response
                } else {
                    log.error("API returned: {} - Body: {}", 
                              responseEntity.getStatusCode(), 
                              responseEntity.getBody());
                    System.out.println("MapMyIndia API returned non-200 status: " + responseEntity.getStatusCode());
                }
            } catch (RestClientException e) {
                // First: log raw response
                ResponseEntity<String> raw = restTemplate.getForEntity(apiUrl, String.class);
                System.out.println("Raw MapMyIndia API Response: " + raw);
                log.error("Raw JSON: {}", raw.getBody());
                throw e;
            }
            return new ArrayList<>();

            
//            if (response == null) {
//                log.warn("No response received from MapMyIndia API for query: {}", query);
//                return new ArrayList<>();
//            }
//            
//            // Get places from either copResults or results (API returns copResults for geocode endpoint)
//            List<MapMyIndiaPlaceDTO> places = response.getPlaces();
//            
//            if (places == null || places.isEmpty()) {
//                log.warn("No results received from MapMyIndia API for query: {}", query);
//                return new ArrayList<>();
//            }
//            
//            log.info("Received {} results from MapMyIndia API", places.size());
//            return places;
            
        } catch (Exception e) {
            log.error("Error while calling MapMyIndia API for query: {}", query, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Build MapMyIndia API URL with query parameters
     * @param query - Search query
     * @return Complete API URL
     */
    private String buildMapMyIndiaUrl(String query) {
        return UriComponentsBuilder
            .fromUriString(mapMyIndiaConfig.getBaseUrl() + "/search/address/geocode")
            .queryParam("address", query)
           
            .queryParam("podFilter", "city")
            .queryParam("access_token", mapMyIndiaConfig.getApiKey())
            .queryParam("region", "IND") 
            .queryParam("itemCount", 10)// Restrict to India
            .build()
            .toUriString();
    }
}
