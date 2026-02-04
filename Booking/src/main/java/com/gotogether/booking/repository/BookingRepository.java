package com.gotogether.booking.repository;

import com.gotogether.booking.Entity.Booking;
import com.gotogether.booking.Entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassengerId(Long passengerId);
    List<Booking> findByStatus(BookingStatus status);
}