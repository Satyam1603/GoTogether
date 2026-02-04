package com.gotogether.ride.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gotogether.ride.client.UserFeignClient;
import com.gotogether.ride.dto.ApiResponse;
import com.gotogether.ride.dto.RideRequestDTO;
import com.gotogether.ride.dto.RideResponseDTO;
import com.gotogether.ride.services.RideService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/gotogether/rides")
@AllArgsConstructor
@CrossOrigin
public class RideController {

    private final RideService rideService;
    private final UserFeignClient userClient;

    @PostMapping
    public ResponseEntity<ApiResponse> publishRide(@RequestBody RideRequestDTO rideRequestDTO) {
    	System.out.println("Received ride publish request: " + rideRequestDTO);
        ApiResponse response = rideService.publishRide(rideRequestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<RideResponseDTO>> searchRides(@RequestParam String source, @RequestParam String destination, @RequestParam String date) {
        LocalDate searchDate = LocalDate.parse(date);
        List<RideResponseDTO> rides = rideService.searchRides(source, destination, searchDate);
        return ResponseEntity.ok(rides);
    }
    @GetMapping("/getallrides")
    public ResponseEntity<List<RideResponseDTO>> GetallRides() {
        
        List<RideResponseDTO> rides = rideService.getallRides();
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/{rideId}")
    public ResponseEntity<RideResponseDTO> getRideDetails(@PathVariable Long rideId) {
        RideResponseDTO ride = rideService.getRideDetails(rideId);
        return ResponseEntity.ok(ride);
    }

    @PutMapping("/{rideId}")
    public ResponseEntity<ApiResponse> updateRide(@PathVariable Long rideId, @RequestBody RideRequestDTO rideRequestDTO) {
        ApiResponse response = rideService.updateRide(rideId, rideRequestDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{rideId}")
    public ResponseEntity<ApiResponse> cancelRide(@PathVariable Long rideId) {
        ApiResponse response = rideService.cancelRide(rideId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<RideResponseDTO>> getDriverRides(@PathVariable Long driverId) {
        List<RideResponseDTO> rides = rideService.getDriverRides(driverId);
        return ResponseEntity.ok(rides);
    }

    @PutMapping("/{rideId}/seats")
    public ResponseEntity<ApiResponse> updateSeatCount(@PathVariable Long rideId, @RequestParam String action) {
        ApiResponse response = rideService.updateSeatCount(rideId, action);
        return ResponseEntity.ok(response);
    }

//    @GetMapping("/{rideId}/status")
//    public ResponseEntity<String> checkRideStatus(@PathVariable Long rideId) {
//        return ResponseEntity.ok(status);
//    }

    // New endpoint to decrement seats after a booking
//    @PatchMapping("/{rideId}/updateseat")
    @GetMapping("/{rideId}/updateseat")
    public ResponseEntity<ApiResponse> bookSeats(@PathVariable Long rideId, @RequestParam(defaultValue = "1") int seat
    		) {
        if (seat <= 0) {
            return ResponseEntity.badRequest().body(new ApiResponse("Invalid seats parameter", "FAILED"));
        }
        ApiResponse response = rideService.updateSeatsAfterBooking(rideId, seat);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{rideId}/updateseataftercancel")
    public ResponseEntity<ApiResponse> bookSeatsAfterCancel(@PathVariable Long rideId, @RequestParam(defaultValue = "1") int seat
    		) {
        if (seat <= 0) {
            return ResponseEntity.badRequest().body(new ApiResponse("Invalid seats parameter", "FAILED"));
        }
        ApiResponse response = rideService.updateSeatsAfterCancel(rideId, seat);
        return ResponseEntity.ok(response);
    }

    // New test endpoint: get compact user info from user-service
    @GetMapping("/users/{userId}/compact")
    public ResponseEntity<com.gotogether.ride.dto.UserCompactDTO> getCompactUserFromUserService(@PathVariable Long userId) {
        com.gotogether.ride.dto.UserCompactDTO dto = userClient.getCompactUser(userId);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    // New test endpoint: get compact user info for multiple users from user-service
    @PostMapping("/users/compact")
    public ResponseEntity<List<com.gotogether.ride.dto.UserCompactDTO>> getCompactUsersFromUserService(@RequestBody List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) return ResponseEntity.badRequest().build();
        List<com.gotogether.ride.dto.UserCompactDTO> dtos = userClient.getCompactUsersBatch(userIds);
        return ResponseEntity.ok(dtos);
    }

    // New test endpoint: get compact info for all users from user-service
    @GetMapping("/users/compact/all")
    public ResponseEntity<List<com.gotogether.ride.dto.UserCompactDTO>> getAllCompactUsersFromUserService() {
        List<com.gotogether.ride.dto.UserCompactDTO> dtos = userClient.getAllCompactUsers();
        return ResponseEntity.ok(dtos);
    }
}