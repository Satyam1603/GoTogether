package com.gotogether.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.gotogether.user.dto.*;
import com.gotogether.user.service.UserService;
import com.gotogether.user.service.PlacesSuggestionService;

import lombok.AllArgsConstructor;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/gotogether/users")
@AllArgsConstructor
@CrossOrigin
public class UserController {

    private final UserService userService;
    private final PlacesSuggestionService placesSuggestionService;

    // ==================== STATIC/LITERAL PATHS (these must come FIRST) ====================
    
    // 1. REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> registerNewUser(@RequestBody RegisterationRequestDTO registerationDTO) {
        RegistrationResponseDTO registrationResponse = userService.registerNewAccount(registerationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(registrationResponse);
    }

    // 6. LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDTO loginRequestDTO) {
        AuthTokenResponseDTO authToken = userService.authenticateUser(loginRequestDTO);
        return ResponseEntity.ok(authToken);
    }
    
    // 6.1 REFRESH ACCESS TOKEN
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshAccessToken(@RequestBody RefreshTokenRequestDTO refreshTokenDTO) {
        AuthTokenResponseDTO newTokens = userService.refreshAccessToken(refreshTokenDTO.getRefreshToken());
        return ResponseEntity.ok(newTokens);
    }
  
    // 7. LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        userService.logoutUser();
        return ResponseEntity.ok("User logged out successfully.");
    }

    // 12. GET TOP RATED DRIVERS
    @GetMapping("/top-rated")
    public ResponseEntity<List<UserResponseDTO>> getTopRatedDrivers() {
        List<UserResponseDTO> topRatedDrivers = userService.getTopRatedDrivers();
        return ResponseEntity.ok(topRatedDrivers);
    }

    // 15. CONFIRM EMAIL VERIFICATION
    @GetMapping("/verify-email-confirm")
    public ResponseEntity<?> confirmEmail(@RequestParam String token) {
        System.out.println("DEBUG: Received Token: " + token);
        boolean isVerified = userService.verifyEmailToken(token);

        if (isVerified) {
            return ResponseEntity.ok("Email verified successfully!now you can close this window.and return to the app.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or Expired Link");
        }
    }

    // 16. PUBLIC - Compact user info for other services (id + S3 image URL)
    @GetMapping(value = "/public/{userId}/compact")
    public ResponseEntity<UserCompactDTO> getPublicCompactUser(@PathVariable Long userId) {
        try {
            UserResponseDTO user = userService.getUserDetailsById(userId);
            if (user == null) return ResponseEntity.notFound().build();
            UserCompactDTO compact = new UserCompactDTO();
            compact.setId(user.getId());
            // Prefer S3 URL if available
            if (user.getImageUrl() != null) {
                compact.setImageUrl(user.getImageUrl());
            } else if (user.getImage() != null) {
                // Fallback to base64 for backward compatibility
                compact.setImageBase64(java.util.Base64.getEncoder().encodeToString(user.getImage()));
            }
            return ResponseEntity.ok(compact);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 16b. PUBLIC BATCH - return list of compact user info for given user IDs
    @PostMapping(value = "/public/compact/batch")
    public ResponseEntity<List<UserCompactDTO>> getPublicCompactUsers(@RequestBody List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<UserCompactDTO> result = new ArrayList<>();
        for (Long id : userIds) {
            try {
                UserResponseDTO user = userService.getUserDetailsById(id);
                if (user == null) continue; // skip missing
                UserCompactDTO compact = new UserCompactDTO();
                compact.setId(user.getId());
                // Prefer S3 URL if available
                if (user.getImageUrl() != null) {
                    compact.setImageUrl(user.getImageUrl());
                } else if (user.getImage() != null) {
                    // Fallback to base64
                    compact.setImageBase64(java.util.Base64.getEncoder().encodeToString(user.getImage()));
                }
                result.add(compact);
            } catch (Exception ex) {
                // skip problematic entries and continue
            }
        }
        return ResponseEntity.ok(result);
    }

    // 16c. PUBLIC - get compact info for all registered users
    @GetMapping(value = "/public/compact/all")
    public ResponseEntity<List<UserCompactDTO>> getAllPublicCompactUsers() {
        try {
            List<UserResponseDTO> allUsers;
            try {
                allUsers = userService.getAllUsers(); // preferred service method if available
            } catch (NoSuchMethodError nsme) {
                // fallback: try to get top rated drivers or return empty list
                allUsers = List.of();
            }
            List<UserCompactDTO> result = new ArrayList<>();
            for (UserResponseDTO user : allUsers) {
                if (user == null) continue;
                UserCompactDTO compact = new UserCompactDTO();
                compact.setId(user.getId());
                compact.setUsername(user.getFirstName() + " " + user.getLastName());
                // Prefer S3 URL if available
                if (user.getImageUrl() != null) {
                    compact.setImageUrl(user.getImageUrl());
                } else if (user.getImage() != null) {
                    // Fallback to base64
                    compact.setImageBase64(java.util.Base64.getEncoder().encodeToString(user.getImage()));
                }
                result.add(compact);
            }
            System.out.println("DEBUG: Returning " + result + " compact users.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ==================== PATH VARIABLE ENDPOINTS (these come AFTER literal paths) ====================

    // 2. GET USER PROFILE
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable Long userId) {
        UserResponseDTO userDto = userService.getUserDetailsById(userId);
        return ResponseEntity.ok(userDto);
    }

    // 3. UPDATE PROFILE
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody UpdateUserRequestDTO updateUserDTO) {
        userService.updateUserProfile(userId, updateUserDTO);
        return ResponseEntity.ok("User profile updated successfully.");
    }
     
    // 4. DELETE ACCOUNT
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        userService.deleteUserAccount(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    // 5. CHANGE PASSWORD
    @PatchMapping("/{userId}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @RequestBody ChangePasswordRequestDTO changePasswordDTO) {
        userService.changeUserPassword(userId, changePasswordDTO);
        return ResponseEntity.ok("Password updated successfully.");
    }
    
    // 6.2 REVOKE REFRESH TOKEN (LOGOUT)
    @PostMapping("/{userId}/revoke-token")
    public ResponseEntity<?> revokeRefreshToken(@PathVariable Long userId, @RequestBody RefreshTokenRequestDTO refreshTokenDTO) {
        userService.revokeRefreshToken(refreshTokenDTO.getRefreshToken());
        return ResponseEntity.ok("Refresh token revoked successfully.");
    }

    // 8. VERIFY PHONE
    @GetMapping("/{userId}/verify-phone")
    public ResponseEntity<?> verifyPhone(@PathVariable Long userId) {
    	try {
    		System.out.println("DEBUG: verifyPhone called for userId: " + userId);
            userService.sendPhoneVerificationOTP(userId);
            return ResponseEntity.ok(new ApiResponse("OTP sent for phone verification.", "SUCCESS"));
    	} catch (Exception e) {
    		System.err.println("Error in verifyPhone: " + e.getMessage());
    		e.printStackTrace();
    		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    			.body(new ApiResponse("Failed to send OTP: " + e.getMessage(), "FAILURE"));
    	}
    }
    

    // 9. VERIFY EMAIL
    @PostMapping("/{userId}/verify-email")
    public ResponseEntity<?> verifyEmail(@PathVariable Long userId) {
        // We first fetch the user to get the email, then call the service
        UserResponseDTO user = userService.getUserDetailsById(userId);
        userService.sendEmailVerification(user.getEmail());
        return ResponseEntity.ok("Verification email sent.");
    }

    // 10. UPLOAD DOCS
    @PostMapping("/{userId}/verify-identity")
    public ResponseEntity<?> verifyIdentity(@PathVariable Long userId, @RequestBody IdentityVerificationRequestDTO identityVerificationDTO) {
        userService.uploadIdentityDocuments(userId, identityVerificationDTO);
        return ResponseEntity.ok("Identity documents uploaded successfully.");
    }

    // New: UPLOAD PROFILE IMAGE
    // Accepts multipart/form-data with key 'file' (matches frontend FormData 'file')
    @PostMapping(path = "/{userId}/upload-image", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadProfileImage(@PathVariable Long userId, @RequestPart("file") MultipartFile file) {
        try {
            // Delegate to service - uploads to S3 and stores URL
            userService.uploadProfileImage(userId, file);
            
            // Fetch updated user to get the image URL
            UserResponseDTO user = userService.getUserDetailsById(userId);
            
            // Return response with S3 URL
            ImageUploadResponseDTO response = new ImageUploadResponseDTO();
            response.setMessage("Profile image uploaded successfully to S3.");
            response.setStatus("SUCCESS");
            response.setImageUrl(user.getImageUrl());
            response.setUserId(userId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("Failed to upload profile image: " + e.getMessage(), "FAILURE"));
        }
    }

    // 11. GET VERIFICATION STATUS
    @GetMapping("/{userId}/verification-status")
    public ResponseEntity<VerificationStatusDTO> getVerificationStatus(@PathVariable Long userId) {
        VerificationStatusDTO status = userService.getVerificationStatus(userId);
        return ResponseEntity.ok(status);
    }

    // 13. UPDATE PREFERENCES
    @PutMapping("/{userId}/preferences")
    public ResponseEntity<?> updatePreferences(@PathVariable Long userId, @RequestBody PreferencesDTO preferencesDTO) {
        userService.updateUserPreferences(userId, preferencesDTO);
        return ResponseEntity.ok("Preferences updated successfully.");
    }
    
    // 14. VERIFY OTP
    @PostMapping("/{userId}/verify-otp")
    public ResponseEntity<?> verifyOTP(@PathVariable Long userId, @RequestParam String otp) {
        // 1. Call the Service method
        ResponseDTO isVerified = userService.verifyPhoneOTP(userId, otp);
        
        // 2. Return appropriate HTTP response based on result
        if (isVerified.isStatus()==true) {
            return ResponseEntity.ok(isVerified);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid OTP. Please try again.");
        }
    }

}
