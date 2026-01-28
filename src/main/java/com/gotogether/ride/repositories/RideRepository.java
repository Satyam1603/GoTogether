package com.gotogether.ride.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gotogether.ride.entities.Ride;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {

   	List<Ride> findBySourceAndDestinationAndDepartureTimeBetween(String source, String destination, LocalDateTime start, LocalDateTime end);

    List<Ride> findByDriverId(Long driverId);
}