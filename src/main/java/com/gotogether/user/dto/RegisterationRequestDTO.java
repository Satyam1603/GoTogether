package com.gotogether.user.dto;

import com.gotogether.user.entity.PaymentType;
import com.gotogether.user.entity.UserRole;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterationRequestDTO {
	private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String confirmPassword;
    private String phoneNo;
    private UserRole role; 

    // Driver Specific Info Only filled if role is DRIVER
    @jakarta.validation.constraints.NotBlank(message = "License Number is required")
    private String licenseNo;
    private int drivingExperience;

    // Passenger Specific Info Only filled if role is PASSENGER
    private PaymentType paymentMethod;
}
