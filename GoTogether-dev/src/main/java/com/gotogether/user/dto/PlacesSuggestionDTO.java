package com.gotogether.user.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PlacesSuggestionDTO {
    private Long id;
    private String placeName;
    private String state;
    private String region;
    private String type;
    private Double latitude;
    private Double longitude;
    private String description;
}
