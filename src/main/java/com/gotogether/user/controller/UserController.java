package com.gotogether.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gotogether.user.dto.*;
import com.gotogether.user.service.UserService;

import lombok.AllArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/gotogether/users")
@AllArgsConstructor
public class UserController {

    private final UserService userService;

 // 1. REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> registerNewUser(@RequestBody RegisterationRequestDTO registerationDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerNewAccount(registerationDTO));
    }

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

    // 6. LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDTO loginRequestDTO) {
        String token = userService.authenticateUser(loginRequestDTO);
        return ResponseEntity.ok(token);
    }

    // 7. LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        userService.logoutUser();
        return ResponseEntity.ok("User logged out successfully.");
    }

    // 8. VERIFY PHONE
    @GetMapping("/{userId}/verify-phone")
    public ResponseEntity<?> verifyPhone(@PathVariable Long userId) {
        userService.sendPhoneVerificationOTP(userId);
        return ResponseEntity.ok("OTP sent for phone verification.");
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

    // 11. GET VERIFICATION STATUS
    @GetMapping("/{userId}/verification-status")
    public ResponseEntity<VerificationStatusDTO> getVerificationStatus(@PathVariable Long userId) {
        VerificationStatusDTO status = userService.getVerificationStatus(userId);
        return ResponseEntity.ok(status);
    }

    // 12. GET TOP RATED DRIVERS
    @GetMapping("/top-rated")
    public ResponseEntity<List<UserResponseDTO>> getTopRatedDrivers() {
        List<UserResponseDTO> topRatedDrivers = userService.getTopRatedDrivers();
        return ResponseEntity.ok(topRatedDrivers);
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
        boolean isVerified = userService.verifyPhoneOTP(userId, otp);
        
        // 2. Return appropriate HTTP response based on result
        if (isVerified) {
            return ResponseEntity.ok("Phone number verified successfully!");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid OTP. Please try again.");
        }
    }
    
    // 15. CONFIRM EMAIL VERIFICATION
    @GetMapping("/verify-email-confirm")
    public ResponseEntity<?> confirmEmail(@RequestParam String token) {
    	System.out.println("DEBUG: Received Token: " + token);
        boolean isVerified = userService.verifyEmailToken(token);
        
        if (isVerified) {
            return ResponseEntity.ok("Email verified successfully!");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or Expired Link");
        }
    }
}