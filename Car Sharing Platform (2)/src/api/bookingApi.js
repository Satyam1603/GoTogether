import axios from 'axios';

const BOOKING_API = 'http://localhost:9090/gotogether/bookings';

// Helper function to get authorization headers with bearer token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(BOOKING_API, bookingData, { headers: getAuthHeaders() });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get all bookings
export const getAllBookings = async (searchQuery = null) => {
  try {
    const url = searchQuery ? `${BOOKING_API}?q=${encodeURIComponent(searchQuery)}` : BOOKING_API;
    const response = await axios.get(url);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get single booking by id
export const getBookingById = async (id) => {
  try {
    const response = await axios.get(`${BOOKING_API}/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update booking
export const updateBooking = async (id, bookingData) => {
  try {
    const response = await axios.put(`${BOOKING_API}/${id}`, bookingData, { headers: getAuthHeaders() });
    return response;
  } catch (error) {
    throw error;
  }
};

// Partial update booking
export const partialUpdateBooking = async (id, updates) => {
  try {
    const response = await axios.patch(`${BOOKING_API}/${id}`, updates, { headers: getAuthHeaders() });
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete booking
export const deleteBooking = async (id) => {
  try {
    const response = await axios.delete(`${BOOKING_API}/${id}`, { headers: getAuthHeaders() });
    return response;
  } catch (error) {
    throw error;
  }
};

// Bulk delete bookings
export const bulkDeleteBookings = async (ids) => {
  try {
    const response = await axios.delete(BOOKING_API, {
      params: { ids: ids.join(',') },
      headers: getAuthHeaders()
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Search bookings
export const searchBookings = async (query) => {
  try {
    const response = await axios.get(`${BOOKING_API}/search?q=${encodeURIComponent(query)}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (id, reason = null) => {
  try {
    const payload = reason ? { reason } : {};
    const response = await axios.post(`${BOOKING_API}/${id}/cancel`, payload, { headers: getAuthHeaders() });
    return response;
  } catch (error) {
    throw error;
  }
};

// Confirm booking
export const confirmBooking = async (id) => {
  try {
    const response = await axios.post(`${BOOKING_API}/${id}/confirm`, {}, { headers: getAuthHeaders() });
    return response;
  } catch (error) {
    throw error;
  }
};

// Check in
export const checkIn = async (id) => {
  try {
    const response = await axios.post(`${BOOKING_API}/${id}/checkin`, {}, { headers: getAuthHeaders() });
    return response;
  } catch (error) {
    throw error;
  }
};

// Check out
export const checkOut = async (id) => {
  try {
    const response = await axios.post(`${BOOKING_API}/${id}/checkout`, {}, { headers: getAuthHeaders() });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get bookings for a specific passenger
export const getBookingsByPassenger = async (passengerId) => {
  try {
    const response = await axios.get(`${BOOKING_API}/user/${passengerId}`, { headers: getAuthHeaders() });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get bookings by status
export const getBookingsByStatus = async (status) => {
  try {
    const response = await axios.get(`${BOOKING_API}/status/${status}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Bulk update status
export const bulkUpdateStatus = async (statusUpdateData) => {
  try {
    const response = await axios.patch(`${BOOKING_API}/status`, statusUpdateData, { headers: getAuthHeaders() });
    return response;
  } catch (error) {
    throw error;
  }
};

// Export bookings
export const exportBookings = async (format = 'csv') => {
  try {
    const response = await axios.get(`${BOOKING_API}/export?format=${format}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Import bookings
export const importBookings = async (bookingsList) => {
  try {
    const response = await axios.post(`${BOOKING_API}/import`, bookingsList);
    return response;
  } catch (error) {
    throw error;
  }
};
