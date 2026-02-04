package com.gotogether.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gotogether.user.dto.*;
import com.gotogether.user.service.MapMyIndiaService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/places")
@AllArgsConstructor
@CrossOrigin
@Slf4j
public class PlacesController {
    
    private final MapMyIndiaService mapMyIndiaService;
    
    /**
     * Get place suggestions from MapMyIndia API
     * 
     * Examples:
     * - /api/places?address=Pune
     * - /api/places?address=Mumbai
     * - /api/places?address=Delhi
     * 
     * @param address - Search query (place name, address, etc.)
     * @return List of suggested places with details
     */
    @GetMapping
    public ResponseEntity<?> getPlaces(@RequestParam(value = "address", required = true) String address) {
        try {
            log.info("Received place search request with query: {}", address);
            System.out.println("Searching places for query: " + address);
            
            if (address == null || address.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse("Search query cannot be empty", "FAILURE"));
            }
            
            // Call MapMyIndia service
            List<MapMyIndiaPlaceDTO> places = mapMyIndiaService.getSuggestedPlaces(address);
            
            if (places.isEmpty()) {
                log.info("No places found for query: {}", address);
                return ResponseEntity.ok()
                    .body(new ApiResponse("No places found for: " + address, "SUCCESS", (Object) places));
            }
            
            // Convert to response DTOs
            List<PlaceSuggestionResponseDTO> response = places.stream()
                .map(PlaceSuggestionResponseDTO::fromMapMyIndiaPlace)
                .collect(Collectors.toList());
            
            log.info("Successfully retrieved {} places for query: {}", response.size(), address);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error while searching places for query: {}", address, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse("Error searching places: " + e.getMessage(), "FAILURE"));
        }
    }
    
    /**
     * Get place details by eLoc (place ID)
     * 
     * @param eLoc - Unique place identifier (eLoc from MapMyIndia)
     * @return Place details
     */
    @GetMapping("/{eLoc}")
    public ResponseEntity<?> getPlaceDetails(@PathVariable String eLoc) {
        try {
            log.info("Received place details request for eLoc: {}", eLoc);
            
            if (eLoc == null || eLoc.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse("Place ID cannot be empty", "FAILURE"));
            }
            
            // Search for the place by eLoc
            List<MapMyIndiaPlaceDTO> places = mapMyIndiaService.getSuggestedPlaces(eLoc);
            
            if (places.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse("Place not found: " + eLoc, "FAILURE"));
            }
            
            // Return first matching place converted to response DTO
            PlaceSuggestionResponseDTO response = PlaceSuggestionResponseDTO.fromMapMyIndiaPlace(places.get(0));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error while fetching place details for eLoc: {}", eLoc, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse("Error fetching place details: " + e.getMessage(), "FAILURE"));
        }
    }
}
