package com.gotogether.booking.service.impl;

import com.gotogether.booking.dto.*;
import com.gotogether.booking.Entity.Booking;
import com.gotogether.booking.Entity.BookingStatus;
import com.gotogether.booking.exception.ResourceNotFoundException;
import com.gotogether.booking.repository.BookingRepository;
import com.gotogether.booking.service.BookingService;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@AllArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        Booking booking = new Booking();
        booking.setRideId(request.getRideId());
        booking.setPassengerId(request.getPassengerId());
        booking.setPassengerSeats(request.getPassengerSeats());
        booking.setPickupPoint(request.getPickupPoint());
        booking.setDropoffPoint(request.getDropoffPoint());
        booking.setTotalAmount(request.getTotalAmount() == null ? BigDecimal.ZERO : request.getTotalAmount());
        LocalDate rd = request.getRideDate();
        if (rd != null) {
            booking.setRideDate(rd.atStartOfDay());
        }
        booking.setStatus(BookingStatus.PENDING);
        booking.setBookedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    @Override
    public BookingResponseDTO getBookingById(Long id) {
        Booking b = bookingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return toResponse(b);
    }

    @Override
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO updateBooking(Long id, UpdateBookingRequestDTO request) {
        Booking b = bookingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        b.setPassengerSeats(request.getPassengerSeats());
        b.setPickupPoint(request.getPickupPoint());
        b.setDropoffPoint(request.getDropoffPoint());
        b.setTotalAmount(request.getTotalAmount());
        LocalDate rd = request.getRideDate();
        if (rd != null) b.setRideDate(rd.atStartOfDay());
        Booking saved = bookingRepository.save(b);
        return toResponse(saved);
    }

    @Override
    public BookingResponseDTO partialUpdateBooking(Long id, UpdateBookingRequestDTO updates) {
        Booking b = bookingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        if (updates.getPassengerSeats() != null) b.setPassengerSeats(updates.getPassengerSeats());
        if (updates.getPickupPoint() != null) b.setPickupPoint(updates.getPickupPoint());
        if (updates.getDropoffPoint() != null) b.setDropoffPoint(updates.getDropoffPoint());
        if (updates.getTotalAmount() != null) b.setTotalAmount(updates.getTotalAmount());
        if (updates.getRideDate() != null) b.setRideDate(updates.getRideDate().atStartOfDay());
        Booking saved = bookingRepository.save(b);
        return toResponse(saved);
    }

    @Override
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Booking not found with id: " + id);
        }
        bookingRepository.deleteById(id);
    }

    @Override
    public void bulkDelete(List<Long> ids) {
        List<Booking> toDelete = bookingRepository.findAllById(ids);
        bookingRepository.deleteAll(toDelete);
    }

    @Override
    public List<BookingResponseDTO> searchBookings(String q) {
        // Simple search stub: if q matches status name return those
        if (q == null || q.isBlank()) return getAllBookings();
        for (BookingStatus st : BookingStatus.values()) {
            if (st.name().equalsIgnoreCase(q.trim())) {
                return bookingRepository.findByStatus(st).stream().map(this::toResponse).collect(Collectors.toList());
            }
        }
        return getAllBookings();
    }

    @Override
    public BookingResponseDTO cancelBooking(Long id, String reason) {
        Booking b = bookingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        b.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(b);
        return toResponse(saved);
    }

    @Override
    public BookingResponseDTO confirmBooking(Long id) {
        Booking b = bookingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        b.setStatus(BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(b);
        return toResponse(saved);
    }

    @Override
    public BookingResponseDTO checkIn(Long id) {
        Booking b = bookingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        b.setStatus(BookingStatus.COMPLETED);
        Booking saved = bookingRepository.save(b);
        return toResponse(saved);
    }

    @Override
    public BookingResponseDTO checkOut(Long id) {
        Booking b = bookingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        b.setStatus(BookingStatus.COMPLETED);
        Booking saved = bookingRepository.save(b);
        return toResponse(saved);
    }

    @Override
    public void bulkUpdateStatus(BulkStatusUpdateDTO dto) {
        List<Booking> list = bookingRepository.findAllById(dto.getIds());
        list.forEach(b -> b.setStatus(dto.getStatus()));
        bookingRepository.saveAll(list);
    }

    @Override
    public int importBookings(List<BookingRequestDTO> bookings) {
        List<Booking> entities = bookings.stream().map(r -> {
            Booking b = new Booking();
            b.setRideId(r.getRideId());
            b.setPassengerId(r.getPassengerId());
            b.setPassengerSeats(r.getPassengerSeats());
            b.setPickupPoint(r.getPickupPoint());
            b.setDropoffPoint(r.getDropoffPoint());
            b.setTotalAmount(r.getTotalAmount() == null ? BigDecimal.ZERO : r.getTotalAmount());
            if (r.getRideDate() != null) b.setRideDate(r.getRideDate().atStartOfDay());
            b.setStatus(BookingStatus.PENDING);
            return b;
        }).collect(Collectors.toList());
        bookingRepository.saveAll(entities);
        return entities.size();
    }

    @Override
    public List<BookingResponseDTO> getBookingsByPassenger(Long passengerId) {
        return bookingRepository.findByPassengerId(passengerId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getBookingsByStatus(String status) {
        if (status == null || status.isBlank()) return getAllBookings();
        for (BookingStatus st : BookingStatus.values()) {
            if (st.name().equalsIgnoreCase(status.trim())) {
                return bookingRepository.findByStatus(st).stream().map(this::toResponse).collect(Collectors.toList());
            }
        }
        return getAllBookings();
    }

    private BookingResponseDTO toResponse(Booking b) {
        return BookingResponseDTO.builder()
                .id(b.getId())
                .rideId(b.getRideId())
                .passengerId(b.getPassengerId())
                .passengerSeats(b.getPassengerSeats())
                .pickupPoint(b.getPickupPoint())
                .dropoffPoint(b.getDropoffPoint())
                .totalAmount(b.getTotalAmount())
                .status(b.getStatus())
                .bookedAt(b.getBookedAt())
                .rideDate(b.getRideDate())
                .build();
    }
}
