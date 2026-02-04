package com.gotogether.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MapMyIndiaResponseDTO {
    @JsonProperty("copResults")
    private List<MapMyIndiaPlaceDTO> copResults;
    
    @JsonProperty("results")
    private List<MapMyIndiaPlaceDTO> results;
    
    @JsonProperty("responseCode")
    private Integer responseCode;
    
    @JsonProperty("version")
    private String version;
    
    // Helper method to get results from either copResults or results
    public List<MapMyIndiaPlaceDTO> getPlaces() {
        return (copResults != null && !copResults.isEmpty()) ? copResults : results;
    }
}
