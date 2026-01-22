package com.gotogether.user.dto;

import com.gotogether.user.entity.UserRole;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
	
	private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNo;
    private UserRole role;
    private byte[] image;
    private boolean emailVerified;
    private boolean phoneVerified;

}
