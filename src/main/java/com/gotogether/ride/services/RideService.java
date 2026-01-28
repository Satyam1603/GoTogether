package com.gotogether.ride.services;

import java.time.LocalDate;
import java.util.List;

import com.gotogether.ride.dto.ApiResponse;
import com.gotogether.ride.dto.RideRequestDTO;
import com.gotogether.ride.dto.RideResponseDTO;

public interface RideService {

    com.gotogether.ride.dto.ApiResponse publishRide(RideRequestDTO rideRequestDTO);

    List<RideResponseDTO> searchRides(String source, String destination, LocalDate date);

    RideResponseDTO getRideDetails(Long rideId);

    ApiResponse updateRide(Long rideId, RideRequestDTO rideRequestDTO);

    ApiResponse cancelRide(Long rideId);

    List<RideResponseDTO> getDriverRides(Long driverId);

    ApiResponse updateSeatCount(Long rideId, String action);

    String checkRideStatus(Long rideId);
}