package com.gotogether.booking.service;

import com.gotogether.booking.dto.*;

import java.util.List;

public interface BookingService {
    BookingResponseDTO createBooking(BookingRequestDTO request);
    BookingResponseDTO getBookingById(Long id);
    List<BookingResponseDTO> getAllBookings();
    BookingResponseDTO updateBooking(Long id, UpdateBookingRequestDTO request);
    BookingResponseDTO partialUpdateBooking(Long id, UpdateBookingRequestDTO updates);
    void deleteBooking(Long id);
    void bulkDelete(List<Long> ids);
    List<BookingResponseDTO> searchBookings(String q);
    BookingResponseDTO cancelBooking(Long id, String reason);
    BookingResponseDTO confirmBooking(Long id);
    BookingResponseDTO checkIn(Long id);
    BookingResponseDTO checkOut(Long id);
    void bulkUpdateStatus(BulkStatusUpdateDTO dto);
    int importBookings(List<BookingRequestDTO> bookings);

    // Added convenience methods
    List<BookingResponseDTO> getBookingsByPassenger(Long passengerId);
    List<BookingResponseDTO> getBookingsByStatus(String status);
}