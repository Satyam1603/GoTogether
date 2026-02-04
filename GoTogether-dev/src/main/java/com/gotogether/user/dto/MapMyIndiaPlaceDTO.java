package com.gotogether.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class MapMyIndiaPlaceDTO {
    @JsonProperty("houseNumber")
    private String houseNumber;
    
    @JsonProperty("houseName")
    private String houseName;
    
    @JsonProperty("poi")
    private String poi;
    
    @JsonProperty("street")
    private String street;
    
    @JsonProperty("subSubLocality")
    private String subSubLocality;
    
    @JsonProperty("subLocality")
    private String subLocality;
    
    @JsonProperty("locality")
    private String locality;
    
    @JsonProperty("village")
    private String village;
    
    @JsonProperty("subDistrict")
    private String subDistrict;
    
    @JsonProperty("district")
    private String district;
    
    @JsonProperty("city")
    private String city;
    
    @JsonProperty("state")
    private String state;
    
    @JsonProperty("pincode")
    private String pincode;
    
    @JsonProperty("formattedAddress")
    private String formattedAddress;
    
    @JsonProperty("eLoc")
    private String eLoc;
    
    @JsonProperty("geocodeLevel")
    private String geocodeLevel;
    
    @JsonProperty("confidenceScore")
    
    private Double confidenceScore;
}
