package com.gotogether.user.service;


import org.modelmapper.ModelMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import com.gotogether.user.entity.User;
import com.gotogether.user.entity.Driver;
import com.gotogether.user.entity.Passenger;
import com.gotogether.user.entity.UserRole;
import com.gotogether.user.repository.DriverRepository;
import com.gotogether.user.repository.PassengerRepository;
import com.gotogether.user.repository.UserRepository;
import com.gotogether.user.dto.*; // Imports UserResponseDTO, UpdateUserRequestDTO, etc.
import com.gotogether.user.custom_exception.ResourceNotFoundException;

import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class UserServiceImpl implements UserService {
	
	private final UserRepository userRepository;
	private final PassengerRepository passengerRepository;
	private final DriverRepository driverRepository;
	private final ModelMapper mapper;
	private final TwilioService twilioService;
	private final StringRedisTemplate redisTemplate; //docker run --name my-redis -p 6379:6379 -d redis
	//docker exec -it my-redis redis-cli //127.0.0.1:6379> KEYS *
	
	@Override
    public ApiResponse registerNewAccount(RegisterationRequestDTO dto) {
        if(userRepository.existsByEmail(dto.getEmail())) {
            return new ApiResponse("Email already exists", "FAILURE");
        }

        // Map DTO to User Entity
        User user = mapper.map(dto, User.class);
        // Explicitly set role to ensure consistency
        user.setRole(dto.getRole());
        
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
        
        return new ApiResponse("Account created successfully", "SUCCESS");
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
        user.setPassword(changePasswordDTO.getNewPassword());
        userRepository.save(user);
    }

    @Override
    public String authenticateUser(LoginRequestDTO loginRequestDTO) {
        User user = userRepository.findByEmail(loginRequestDTO.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));
        
        if (!user.getPassword().equals(loginRequestDTO.getPassword())) {
            throw new ResourceNotFoundException("Invalid email or password");
        }
        // Return a placeholder or generate a real JWT here
        return "JWT_TOKEN_PLACEHOLDER";
    }

    @Override
    public void logoutUser() {
        // Stateless JWT logout is usually handled on client-side (deleting the token).
        // Server-side can blacklist the token if needed.
    }

    @Override
    public void sendPhoneVerificationOTP(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        String otp = generateOTP(); 
     //  Save to Redis (Key: "OTP:1", Value: "123456", Expires: 5 mins)
        String redisKey = "OTP:" + userId;
        redisTemplate.opsForValue().set(redisKey, otp, 5, TimeUnit.MINUTES);
        // Ensure getPhoneNo() is used (User.java has phoneNo, not phone)
        twilioService.sendSMS(user.getPhoneNo(), "Your OTP is: " + otp);
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

    // --- Helper Methods ---
    
    private String generateOTP() {
        return String.valueOf((int)(Math.random() * 900000) + 100000);
    }

    private String generateEmailVerificationToken(String email) {
        return "verify-" + email.hashCode();
    }

	@Override
	public boolean verifyPhoneOTP(Long userId, String otpEntered) {
		String redisKey = "OTP:" + userId;
        String cachedOtp = redisTemplate.opsForValue().get(redisKey);

        if (cachedOtp != null && cachedOtp.equals(otpEntered)) {
            // Success! Delete OTP so it cannot be used again
            redisTemplate.delete(redisKey);
            
            // Mark user as verified in DB
             User user = userRepository.findById(userId).get();
             user.setPhoneVerified(true);
             userRepository.save(user);
            
            return true;
        }
        return false;
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
    
}