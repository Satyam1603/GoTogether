package com.gotogether.user.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PlaceSuggestionResponseDTO {
    private String placeName;
    private String fullAddress;
    private String city;
    private String district;
    private String state;
    private String eLoc;
    private String geocodeLevel;
    private Double confidenceScore;
    
    // Static method to convert MapMyIndiaPlaceDTO to PlaceSuggestionResponseDTO
    public static PlaceSuggestionResponseDTO fromMapMyIndiaPlace(MapMyIndiaPlaceDTO place) {
        PlaceSuggestionResponseDTO dto = new PlaceSuggestionResponseDTO();
        
        // Determine place name from available fields
        if (place.getPoi() != null && !place.getPoi().isEmpty()) {
            dto.setPlaceName(place.getPoi());
        } else if (place.getLocality() != null && !place.getLocality().isEmpty()) {
            dto.setPlaceName(place.getLocality());
        } else if (place.getCity() != null && !place.getCity().isEmpty()) {
            dto.setPlaceName(place.getCity());
        } else if (place.getDistrict() != null && !place.getDistrict().isEmpty()) {
            dto.setPlaceName(place.getDistrict());
        } else {
            dto.setPlaceName(place.getFormattedAddress());
        }
        
        dto.setFullAddress(place.getFormattedAddress());
        dto.setCity(place.getCity());
        dto.setDistrict(place.getDistrict());
        dto.setState(place.getState());
        dto.setELoc(place.getELoc());
        dto.setGeocodeLevel(place.getGeocodeLevel());
        dto.setConfidenceScore(place.getConfidenceScore());
        
        return dto;
    }
}
