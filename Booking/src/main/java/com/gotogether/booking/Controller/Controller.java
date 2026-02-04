package com.gotogether.booking.Controller;

import java.util.List;
import java.util.Map;

import com.gotogether.booking.dto.*;
import com.gotogether.booking.exception.ResourceNotFoundException;
import com.gotogether.booking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/gotogether/bookings")
@CrossOrigin
public class Controller {

    private final BookingService bookingService;

    public Controller(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Create a new booking
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@RequestBody BookingRequestDTO payload) {
        BookingResponseDTO created = bookingService.createBooking(payload);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Get a paginated list of bookings or search by q
    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings(@RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(bookingService.searchBookings(q));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // Get single booking by id
    @GetMapping("/{id}")
    public ResponseEntity<Object> getBookingById(@PathVariable Long id) {
        try {
            BookingResponseDTO dto = bookingService.getBookingById(id);
            return ResponseEntity.ok(dto);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        }
    }

    // Update (replace) booking by id
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> updateBooking(@PathVariable Long id, @RequestBody UpdateBookingRequestDTO payload) {
        return ResponseEntity.ok(bookingService.updateBooking(id, payload));
    }

    // Partial update booking by id (PATCH)
    @PatchMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> partialUpdateBooking(@PathVariable Long id, @RequestBody UpdateBookingRequestDTO updates) {
        return ResponseEntity.ok(bookingService.partialUpdateBooking(id, updates));
    }

    // Delete booking by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    // Bulk delete (accepts list of ids)
    @DeleteMapping
    public ResponseEntity<Void> bulkDelete(@RequestParam List<Long> ids) {
        bookingService.bulkDelete(ids);
        return ResponseEntity.noContent().build();
    }

    // Search bookings by free-text or multiple criteria (example endpoint)
    @GetMapping("/search")
    public ResponseEntity<List<BookingResponseDTO>> searchBookings(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(bookingService.searchBookings(q));
    }

    // Actions: cancel, confirm, check-in, check-out
    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id, @RequestBody(required = false) Map<String, String> reason) {
        String r = reason == null ? null : reason.get("reason");
        return ResponseEntity.ok(bookingService.cancelBooking(id, r));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<BookingResponseDTO> confirmBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.confirmBooking(id));
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<BookingResponseDTO> checkIn(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkIn(id));
    }

    @PostMapping("/{id}/checkout")
    public ResponseEntity<BookingResponseDTO> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkOut(id));
    }

    // Get bookings for a specific passenger (user)
    @GetMapping("/user/{passengerId}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByUser(@PathVariable Long passengerId) {
        return ResponseEntity.ok(bookingService.getBookingsByPassenger(passengerId));
    }

    // Get bookings by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
    }

    // Bulk update status (e.g., mark many bookings as cancelled)
    @PatchMapping("/status")
    public ResponseEntity<Void> bulkUpdateStatus(@RequestBody BulkStatusUpdateDTO body) {
        bookingService.bulkUpdateStatus(body);
        return ResponseEntity.ok().build();
    }

    // Export bookings (CSV/Excel) - returns a download link or file stream in a real implementation
    @GetMapping("/export")
    public ResponseEntity<Map<String, String>> exportBookings(@RequestParam(required = false) String format) {
        // Stub - return a fake link
        return ResponseEntity.ok(Map.of("message", "exportBookings not implemented", "format", format == null ? "csv" : format));
    }

    // Import bookings (bulk create) - stub
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importBookings(@RequestBody List<BookingRequestDTO> bookings) {
        int count = bookingService.importBookings(bookings);
        return ResponseEntity.accepted().body(Map.of("imported", count));
    }

    // Health / quick info
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of("status", "OK", "service", "booking-controller"));
    }

}
