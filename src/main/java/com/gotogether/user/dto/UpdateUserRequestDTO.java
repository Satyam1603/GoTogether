package com.gotogether.user.dto;

import lombok.Data;

@Data
public class UpdateUserRequestDTO {
	private String firstName;
	private String lastName;
    private String phone;
    private String preferences;
}