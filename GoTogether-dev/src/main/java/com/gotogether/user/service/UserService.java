package com.gotogether.user.service;

import com.gotogether.user.dto.*;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
	RegistrationResponseDTO registerNewAccount(RegisterationRequestDTO dto);
    UserResponseDTO getUserDetailsById(Long userId);
    void updateUserProfile(Long userId, UpdateUserRequestDTO updateUserDTO);
    void deleteUserAccount(Long userId);
    void changeUserPassword(Long userId, ChangePasswordRequestDTO changePasswordDTO);
    
    // Auth & Security
    AuthTokenResponseDTO authenticateUser(LoginRequestDTO loginRequestDTO);
    void logoutUser(); // Optional placeholder
    
    // JWT & Refresh Token
    AuthTokenResponseDTO refreshAccessToken(String refreshToken);
    void revokeRefreshToken(String refreshToken);
    void revokeAllRefreshTokensForUser(Long userId);
    
    // Verification
    void sendPhoneVerificationOTP(Long userId);
    void sendEmailVerification(String email);
    void uploadIdentityDocuments(Long userId, IdentityVerificationRequestDTO identityVerificationDTO);
    VerificationStatusDTO getVerificationStatus(Long userId); // Optional

    // New: upload profile image
    void uploadProfileImage(Long userId, MultipartFile file);
    
    // Driver Specific (Only the one that works with your current Entity)
    List<UserResponseDTO> getTopRatedDrivers();
    
    // Preferences
    void updateUserPreferences(Long userId, PreferencesDTO preferencesDTO);
    
    // Redis cache related method
    ResponseDTO verifyPhoneOTP(Long userId, String otpEntered);
    boolean verifyEmailToken(String token);

    // Return all registered users as DTOs
    List<UserResponseDTO> getAllUsers();
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
