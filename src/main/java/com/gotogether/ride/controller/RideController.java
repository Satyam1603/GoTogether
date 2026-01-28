package com.gotogether.ride.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gotogether.ride.dto.ApiResponse;
import com.gotogether.ride.dto.RideRequestDTO;
import com.gotogether.ride.dto.RideResponseDTO;
import com.gotogether.ride.services.RideService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/gotogether/rides")
@AllArgsConstructor
public class RideController {

    private final RideService rideService;

    @PostMapping
    public ResponseEntity<ApiResponse> publishRide(@RequestBody RideRequestDTO rideRequestDTO) {
        ApiResponse response = rideService.publishRide(rideRequestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<RideResponseDTO>> searchRides(@RequestParam String source, @RequestParam String destination, @RequestParam String date) {
        LocalDate searchDate = LocalDate.parse(date);
        List<RideResponseDTO> rides = rideService.searchRides(source, destination, searchDate);
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

    @GetMapping("/{rideId}/status")
    public ResponseEntity<String> checkRideStatus(@PathVariable Long rideId) {
        String status = rideService.checkRideStatus(rideId);
        return ResponseEntity.ok(status);
    }
}