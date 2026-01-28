package com.gotogether.user.service;

import com.gotogether.user.dto.*;
import java.util.List;

public interface UserService {
	ApiResponse registerNewAccount(RegisterationRequestDTO dto);
    UserResponseDTO getUserDetailsById(Long userId);
    void updateUserProfile(Long userId, UpdateUserRequestDTO updateUserDTO);
    void deleteUserAccount(Long userId);
    void changeUserPassword(Long userId, ChangePasswordRequestDTO changePasswordDTO);
    
    // Auth & Security
    String authenticateUser(LoginRequestDTO loginRequestDTO);
    void logoutUser(); // Optional placeholder
    
    // Verification
    void sendPhoneVerificationOTP(Long userId);
    void sendEmailVerification(String email);
    void uploadIdentityDocuments(Long userId, IdentityVerificationRequestDTO identityVerificationDTO);
    VerificationStatusDTO getVerificationStatus(Long userId); // Optional
    
    // Driver Specific (Only the one that works with your current Entity)
    List<UserResponseDTO> getTopRatedDrivers();
    
    // Preferences
    void updateUserPreferences(Long userId, PreferencesDTO preferencesDTO);
    
    // Redis cache related method
    boolean verifyPhoneOTP(Long userId, String otpEntered);
    boolean verifyEmailToken(String token);
}






/*
 * ApiResponse registerNewAccount(RegisterationRequestDTO dto);
	UserResponseDTO getUserDetailsById(Long userId);
	void updateUserProfile(Long userId, UpdateUserRequestDTO updateUserDTO);
	void deleteUserAccount(Long userId);
	void changeUserPassword(Long userId, ChangePasswordRequestDTO changePasswordDTO);
	String authenticateUser(LoginRequestDTO loginRequestDTO);
	void logoutUser();
	void sendPhoneVerificationOTP(Long userId);
	void sendEmailVerification(Long userId);
	void uploadIdentityDocuments(Long userId, IdentityVerificationRequestDTO identityVerificationDTO);
	VerificationStatusDTO getVerificationStatus(Long userId);
	List<UserResponseDTO> searchUsers(String name, String location, Double rating);
	List<UserResponseDTO> findDriversByCity(String city);
	List<UserResponseDTO> getTopRatedDrivers();
	void updateUserPreferences(Long userId, PreferencesDTO preferencesDTO);
	List<RatingDTO> getUserRatings(Long userId);
	void submitUserRating(Long userId, RatingRequestDTO ratingRequestDTO);
	List<RideHistoryDTO> getUserRideHistory(Long userId);
	void sendEmailVerification(String email);*/
