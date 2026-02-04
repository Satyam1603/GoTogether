package com.gotogether.user.service;


import org.modelmapper.ModelMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import com.gotogether.user.entity.User;
import com.gotogether.user.entity.Driver;
import com.gotogether.user.entity.Passenger;
import com.gotogether.user.entity.UserRole;
import com.gotogether.user.entity.RefreshToken;
import com.gotogether.user.repository.DriverRepository;
import com.gotogether.user.repository.PassengerRepository;
import com.gotogether.user.repository.UserRepository;
import com.gotogether.user.repository.RefreshTokenRepository;
import com.gotogether.user.dto.*; // Imports UserResponseDTO, UpdateUserRequestDTO, etc.
import com.gotogether.user.custom_exception.ResourceNotFoundException;
import com.gotogether.user.custom_exception.JwtAuthenticationException;
import com.gotogether.user.custom_exception.RefreshTokenException;
import com.gotogether.user.util.JwtTokenProvider;
import com.gotogether.user.aws.S3Service;

import lombok.AllArgsConstructor;

import java.io.IOException;

@Service
@Transactional
@AllArgsConstructor
public class UserServiceImpl implements UserService {
	
	private final UserRepository userRepository;
	private final PassengerRepository passengerRepository;
	private final DriverRepository driverRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final ModelMapper mapper;
	private final TwilioService twilioService;
	private final StringRedisTemplate redisTemplate; //docker run --name my-redis -p 6379:6379 -d redis
	//docker exec -it my-redis redis-cli //127.0.0.1:6379> KEYS *
	private final JwtTokenProvider jwtTokenProvider;
	private final S3Service s3Service;
	private final PasswordEncoder passwordEncoder;  // Injected BCryptPasswordEncoder
	
	@Override
    public RegistrationResponseDTO registerNewAccount(RegisterationRequestDTO dto) {
        if(userRepository.existsByEmail(dto.getEmail()) && dto.getEmail() != null) {
            throw new ResourceNotFoundException("Email already exists");
        }
        if(userRepository.existsByPhoneNo(dto.getPhoneNo()) && dto.getPhoneNo() != null) {
			throw new ResourceNotFoundException("Phone number already exists");
		}

        // Map DTO to User Entity
        User user = mapper.map(dto, User.class);
        // Explicitly set role to ensure consistency
        user.setRole(dto.getRole());
        
        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        
        userRepository.save(user);

        // Handle Role Specific Data
        if(dto.getRole() == UserRole.PASSENGER) {
            Passenger passenger = mapper.map(dto, Passenger.class);
            passenger.setPaymentMethod(dto.getPaymentMethod());
            passenger.setUserDetails(user);
            passengerRepository.save(passenger);
        } else if (dto.getRole() == UserRole.DRIVER) {
            Driver driver = mapper.map(dto, Driver.class);
            driver.setDrivingExperience(dto.getDrivingExperience());
            driver.setLicenseNo(dto.getLicenseNo());
            driver.setUserDetails(user);
            driverRepository.save(driver);
        }
        
        // Generate JWT tokens after successful registration
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().toString());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());
        
        // Save refresh token to database
        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setToken(refreshToken);
        refreshTokenEntity.setUserId(user.getId());
        refreshTokenEntity.setExpiryDate(LocalDateTime.now().plusDays(7)); // 7 days expiry
        refreshTokenEntity.setRevoked(false);
        refreshTokenRepository.save(refreshTokenEntity);
        
        // Map user to response DTO
        UserResponseDTO userResponseDTO = mapper.map(user, UserResponseDTO.class);
        
        // Create and return registration response with tokens
        RegistrationResponseDTO registrationResponse = new RegistrationResponseDTO(
                userResponseDTO,
                accessToken,
                refreshToken,
                3600000L  // 1 hour in milliseconds
        );
        registrationResponse.setMessage("Account created successfully");
        registrationResponse.setStatus("SUCCESS");
        
        return registrationResponse;
    }

    @Override
    public UserResponseDTO getUserDetailsById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapper.map(user, UserResponseDTO.class);
    }

    @Override
    public void updateUserProfile(Long userId, UpdateUserRequestDTO updateUserDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Updating fields present in your User.java
        // Note: Ensure UpdateUserRequestDTO has firstName/lastName, NOT just "name"
        user.setFirstName(updateUserDTO.getFirstName()); // Or setFirstName if you changed DTO
        user.setPhoneNo(updateUserDTO.getPhone());
        user.setPreferences(updateUserDTO.getPreferences());
        
        userRepository.save(user);
    }

    @Override
    public void deleteUserAccount(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        userRepository.delete(user);
    }

    @Override
    public void changeUserPassword(Long userId, ChangePasswordRequestDTO changePasswordDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Verify old password matches before changing
        if (!passwordEncoder.matches(changePasswordDTO.getOldPassword(), user.getPassword())) {
            throw new ResourceNotFoundException("Old password is incorrect");
        }
        
        // Encrypt new password before saving
        user.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public AuthTokenResponseDTO authenticateUser(LoginRequestDTO loginRequestDTO) {
        User user = userRepository.findByEmail(loginRequestDTO.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));
        
        // Use PasswordEncoder to compare encrypted password with plain text input
        if (!passwordEncoder.matches(loginRequestDTO.getPassword(), user.getPassword())) {
            throw new ResourceNotFoundException("Invalid email or password");
        }
        
        // Generate JWT tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().toString());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());
        
        // Save refresh token to database
        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setToken(refreshToken);
        refreshTokenEntity.setUserId(user.getId());
        refreshTokenEntity.setExpiryDate(LocalDateTime.now().plusDays(7)); // 7 days expiry
        refreshTokenEntity.setRevoked(false);
        refreshTokenRepository.save(refreshTokenEntity);
        
        return new AuthTokenResponseDTO(
			accessToken,
			refreshToken,
			3600000L, // 1 hour in milliseconds
			user.getId(),
			user.getEmail(),
			user.getRole().toString(),
			user
		);
    }

    @Override
    public void logoutUser() {
        // Stateless JWT logout is usually handled on client-side (deleting the token).
        // Server-side can blacklist the token if needed.
    }
    
    @Override
    public AuthTokenResponseDTO refreshAccessToken(String refreshTokenStr) {
        // Find refresh token in database
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new RefreshTokenException("Refresh token not found"));
        
        // Check if refresh token is valid
        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new RefreshTokenException("Refresh token has expired");
        }
        
        if (refreshToken.getRevoked()) {
            throw new RefreshTokenException("Refresh token has been revoked");
        }
        
        // Get user details
        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Generate new access token
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().toString());
        
        // Optionally generate new refresh token and replace old one
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());
        
        // Revoke old refresh token
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        
        // Save new refresh token
        RefreshToken newRefreshTokenEntity = new RefreshToken();
        newRefreshTokenEntity.setToken(newRefreshToken);
        newRefreshTokenEntity.setUserId(user.getId());
        newRefreshTokenEntity.setExpiryDate(LocalDateTime.now().plusDays(7));
        newRefreshTokenEntity.setRevoked(false);
        refreshTokenRepository.save(newRefreshTokenEntity);
        
        return new AuthTokenResponseDTO(
			newAccessToken,
			newRefreshToken,
			3600000L, // 1 hour in milliseconds
			user.getId(),
			user.getEmail(),
			user.getRole().toString(),
			user
		);
    }
    
    @Override
    public void revokeRefreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new RefreshTokenException("Refresh token not found"));
        
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }
    
    @Override
    public void revokeAllRefreshTokensForUser(Long userId) {
        // Find all active refresh tokens for user and revoke them
        refreshTokenRepository.findByUserId(userId).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Override
    public void sendPhoneVerificationOTP(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        if (user.getPhoneNo() == null || user.getPhoneNo().isEmpty()) {
            throw new ResourceNotFoundException("Phone number not found for user: " + userId);
        }
        
        String otp = generateOTP(); 
        //  Save to Redis (Key: "OTP:1", Value: "123456", Expires: 5 mins)
        String redisKey = "OTP:" + userId;
        redisTemplate.opsForValue().set(redisKey, otp, 5, TimeUnit.MINUTES);
        
        // Ensure getPhoneNo() is used (User.java has phoneNo, not phone)
        try {
         System.out.println("DEBUG: Sending OTP " + otp + " to phone " + user.getPhoneNo());
            twilioService.sendSMS(user.getPhoneNo(), "Your OTP is: " + otp);
        } catch (Exception e) {
            // Log the error but don't throw - OTP is already saved in Redis
            System.err.println("Failed to send SMS for user " + userId + ": " + e.getMessage());
        }
    }
    @Override
    public void sendEmailVerification(String email) {
     User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
     String token = UUID.randomUUID().toString();
     String redisKey = "EMAIL_TOKEN:" + token;
     redisTemplate.opsForValue().set(redisKey, user.getId().toString(),24, TimeUnit.HOURS);
        String verificationLink = "http://localhost:8080/gotogether/users/verify-email-confirm?token=" + token;
        String subject = "Verify your email";
        String body = "Click this link to verify your account: " + verificationLink;
        twilioService.sendEmail(email, subject, body);
    }

    @Override
    public void uploadIdentityDocuments(Long userId, IdentityVerificationRequestDTO identityVerificationDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        // Logic to save document URL to Driver table would go here if you add a field for it
        System.out.println("Identity docs uploaded for: " + user.getId());
    }

    @Override
    public VerificationStatusDTO getVerificationStatus(Long userId) {
        // Return dummy status for now
        VerificationStatusDTO status = new VerificationStatusDTO();
        status.setEmailVerified(true);
        return status;
    }

    @Override
    public List<UserResponseDTO> getTopRatedDrivers() {
        // This works because Driver entity HAS a 'rating' field
        return driverRepository.findAll().stream()
            .sorted((d1, d2) -> {
                // Handle null ratings to avoid crashes
                int r1 = (d1.getRating() == null) ? 0 : d1.getRating();
                int r2 = (d2.getRating() == null) ? 0 : d2.getRating();
                return Integer.compare(r2, r1); // Descending order
            })
            .limit(10)
            .map(driver -> mapper.map(driver.getUserDetails(), UserResponseDTO.class))
            .collect(Collectors.toList());
    }

    @Override
    public void updateUserPreferences(Long userId, PreferencesDTO preferencesDTO) {
        User user = userRepository.findById(userId)
             .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        // Assuming you store preferences as a JSON string or related entity
        // user.setPreferences(preferencesDTO.toString()); 
        userRepository.save(user);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> mapper.map(user, UserResponseDTO.class))
                .collect(Collectors.toList());
    }

    // --- Helper Methods ---
    
    private String generateOTP() {
        return String.valueOf((int)(Math.random() * 900000) + 100000);
    }

    private String generateEmailVerificationToken(String email) {
        return "verify-" + email.hashCode();
    }

	@Override
	public ResponseDTO verifyPhoneOTP(Long userId, String otpEntered) {
		String redisKey = "OTP:" + userId;
        String cachedOtp = redisTemplate.opsForValue().get(redisKey);
        String status = "FAILURE";
        if (cachedOtp != null && cachedOtp.equals(otpEntered)) {
            // Success! Delete OTP so it cannot be used again
            redisTemplate.delete(redisKey);
            
            // Mark user as verified in DB
             User user = userRepository.findById(userId).get();
             user.setPhoneVerified(true);
             userRepository.save(user);
            
            return new ResponseDTO(true,user);
        }
        return new ResponseDTO(false,null);
	}
    
	@Override
	public boolean verifyEmailToken(String token) {
	    String redisKey = "EMAIL_TOKEN:" + token;
	    
	    // 1. Check if token exists in Redis
	    String userIdStr = redisTemplate.opsForValue().get(redisKey);

	    if (userIdStr != null) {
	        Long userId = Long.parseLong(userIdStr);
	        
	        // 2. Mark User as Verified in DB
	         User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
	         user.setEmailVerified(true);
	         userRepository.save(user);

	        // 3. Delete token so it can't be used again
	        redisTemplate.delete(redisKey);
	        return true;
	    }
	    return false;
	}

	@Override
	public void uploadProfileImage(Long userId, MultipartFile file) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("Uploaded file is empty");
		}
		try {
			byte[] bytes = file.getBytes();
			// Upload to S3 and get URL
			String s3Url = s3Service.uploadBytes(bytes, file.getOriginalFilename(), file.getContentType());
			// Store S3 URL in user entity
			user.setImageUrl(s3Url);
			// Optionally: also store bytes for backward compatibility (comment out if not needed)
			// user.setImage(bytes);
			userRepository.save(user);
		} catch (IOException e) {
			throw new RuntimeException("Failed to read uploaded file", e);
		}
	}

}
