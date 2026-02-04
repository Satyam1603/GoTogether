package com.gotogether.ride.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gotogether.ride.custom_exception.ResourceNotFoundException;
import com.gotogether.ride.dto.ApiResponse;
import com.gotogether.ride.dto.RideRequestDTO;
import com.gotogether.ride.dto.RideResponseDTO;
import com.gotogether.ride.entities.Ride;
import com.gotogether.ride.entities.RideStatus;
import com.gotogether.ride.repositories.RideRepository;

import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class RideServiceImpl implements RideService {

    private final RideRepository rideRepository;
    private final ModelMapper modelMapper;

    @Override
    public ApiResponse publishRide(RideRequestDTO rideRequestDTO) {
        if (rideRequestDTO == null) {
            throw new ResourceNotFoundException("Ride request data is missing");
        }
        Ride ride = modelMapper.map(rideRequestDTO, Ride.class);
        ride.setStatus(RideStatus.SCHEDULED);
        ride.setAvailableSeats(ride.getTotalSeats());
        rideRepository.save(ride);
        return new ApiResponse("Ride published successfully", "SUCCESS");
    }

    @Override
    public List<RideResponseDTO> searchRides(String source, String destination, LocalDate date) {
        if (source == null || destination == null || date == null) {
            throw new ResourceNotFoundException("Search parameters are missing");
        }
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        List<Ride> rides = rideRepository.findBySourceAndDestinationAndDepartureTimeBetween(source, destination, startOfDay, endOfDay);
        return rides.stream()
                    .map(ride -> modelMapper.map(ride, RideResponseDTO.class))
                    .collect(Collectors.toList());
    }

    @Override
    public RideResponseDTO getRideDetails(Long rideId) {
        Ride ride = getRideDetailsEntity(rideId);
        return modelMapper.map(ride, RideResponseDTO.class);
    }

    @Override
    public ApiResponse updateRide(Long rideId, RideRequestDTO rideRequestDTO) {
        if (rideId == null || rideRequestDTO == null) {
            throw new ResourceNotFoundException("Ride ID or Ride request data is missing");
        }
        Ride ride = getRideDetailsEntity(rideId);
        modelMapper.map(rideRequestDTO, ride);
        rideRepository.save(ride);
        return new ApiResponse("Ride updated successfully", "SUCCESS");
    }

    @Override
    public ApiResponse cancelRide(Long rideId) {
        if (rideId == null) {
            throw new ResourceNotFoundException("Ride ID is missing");
        }
        Ride ride = getRideDetailsEntity(rideId);
        ride.setStatus(RideStatus.CANCELLED);
        rideRepository.save(ride);
        return new ApiResponse("Ride cancelled successfully", "SUCCESS");
    }

    @Override
    public List<RideResponseDTO> getDriverRides(Long driverId) {
        if (driverId == null) {
            throw new ResourceNotFoundException("Driver ID is missing");
        }
        List<Ride> rides = rideRepository.findByDriverId(driverId);
        if (rides.isEmpty()) {
            throw new ResourceNotFoundException("No rides found for the driver");
        }
        return rides.stream()
                    .map(ride -> modelMapper.map(ride, RideResponseDTO.class))
                    .collect(Collectors.toList());
    }

    @Override
    public ApiResponse updateSeatCount(Long rideId, String action) {
        Ride ride = getRideDetailsEntity(rideId);
        if ("book".equalsIgnoreCase(action)) {
            if (ride.getAvailableSeats() > 0) {
                ride.setAvailableSeats(ride.getAvailableSeats() - 1);
            } else {
                throw new ResourceNotFoundException("No available seats");
            }
        } else if ("cancel".equalsIgnoreCase(action)) {
            ride.setAvailableSeats(ride.getAvailableSeats() + 1);
        }
        rideRepository.save(ride);
        return new ApiResponse("Seat count updated successfully", "SUCCESS");
    }

    @Override
    public String checkRideStatus(Long rideId) {
        Ride ride = getRideDetailsEntity(rideId);
        return ride.getStatus().toString();
    }

    private Ride getRideDetailsEntity(Long rideId) {
        Optional<Ride> ride = rideRepository.findById(rideId);
        return ride.orElseThrow(() -> new ResourceNotFoundException("Ride not found"));
    }

	@Override
	public List<RideResponseDTO> getallRides() {
		List<Ride> rides = rideRepository.findAll();
		if (rides.isEmpty()) {
			throw new ResourceNotFoundException("No rides found");
		}
		return rides.stream()
					.map(ride -> modelMapper.map(ride, RideResponseDTO.class))
					.collect(Collectors.toList());
		
	}

    @Override
    public ApiResponse updateSeatsAfterBooking(Long rideId, int seats) {
        if (seats <= 0) {
            return new ApiResponse("Invalid seats value", "FAILED");
        }
        Ride ride = getRideDetailsEntity(rideId);
        if (ride.getAvailableSeats() < seats) {
            throw new ResourceNotFoundException("Not enough available seats");
        }
        ride.setAvailableSeats(ride.getAvailableSeats() - seats);
        rideRepository.save(ride);
        return new ApiResponse("Seats updated after booking", "SUCCESS");
    }
    @Override
    public ApiResponse updateSeatsAfterCancel(Long rideId, int seats) {
        if (seats <= 0) {
            return new ApiResponse("Invalid seats value", "FAILED");
        }
        Ride ride = getRideDetailsEntity(rideId);
        if (ride.getAvailableSeats() < seats) {
            throw new ResourceNotFoundException("Not enough available seats");
        }
        ride.setAvailableSeats(ride.getAvailableSeats() + seats);
        rideRepository.save(ride);
        return new ApiResponse("Seats updated after cancel", "SUCCESS");
    }  
}