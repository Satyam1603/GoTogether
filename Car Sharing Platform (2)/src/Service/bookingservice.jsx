import * as bookingApi from '../api/bookingApi';
import { toast } from 'sonner';

export const bookingService = {
  async createBooking(bookingData) {
    try {
      const response = await bookingApi.createBooking(bookingData);
      toast.success('Booking created successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create booking';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async getAllBookings(searchQuery = null) {
    try {
      const response = await bookingApi.getAllBookings(searchQuery);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch bookings';
      console.error('Error fetching bookings:', error);
      return { success: false, error: message };
    }
  },

  async getBookingById(id) {
    try {
      const response = await bookingApi.getBookingById(id);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch booking';
      console.error('Error fetching booking:', error);
      return { success: false, error: message };
    }
  },

  async updateBooking(id, bookingData) {
    try {
      const response = await bookingApi.updateBooking(id, bookingData);
      toast.success('Booking updated successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update booking';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async partialUpdateBooking(id, updates) {
    try {
      const response = await bookingApi.partialUpdateBooking(id, updates);
      toast.success('Booking updated!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update booking';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async deleteBooking(id) {
    try {
      await bookingApi.deleteBooking(id);
      toast.success('Booking deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete booking';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async bulkDeleteBookings(ids) {
    try {
      await bookingApi.bulkDeleteBookings(ids);
      toast.success(`${ids.length} bookings deleted!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete bookings';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async searchBookings(query) {
    try {
      const response = await bookingApi.searchBookings(query);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Search failed';
      console.error('Error searching bookings:', error);
      return { success: false, error: message };
    }
  },

  async cancelBooking(id, reason = null) {
    try {
      const response = await bookingApi.cancelBooking(id, reason);
      toast.success('Booking cancelled successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel booking';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async confirmBooking(id) {
    try {
      const response = await bookingApi.confirmBooking(id);
      toast.success('Booking confirmed!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to confirm booking';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async checkIn(id) {
    try {
      const response = await bookingApi.checkIn(id);
      toast.success('Checked in successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Check-in failed';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async checkOut(id) {
    try {
      const response = await bookingApi.checkOut(id);
      toast.success('Checked out successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Check-out failed';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async getBookingsByPassenger(passengerId) {
    try {
      const response = await bookingApi.getBookingsByPassenger(passengerId);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch passenger bookings';
      console.error('Error fetching passenger bookings:', error);
      return { success: false, error: message };
    }
  },

  async getBookingsByStatus(status) {
    try {
      const response = await bookingApi.getBookingsByStatus(status);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch bookings by status';
      console.error('Error fetching bookings by status:', error);
      return { success: false, error: message };
    }
  },

  async bulkUpdateStatus(statusUpdateData) {
    try {
      const response = await bookingApi.bulkUpdateStatus(statusUpdateData);
      toast.success('Status updated for multiple bookings!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async exportBookings(format = 'csv') {
    try {
      const response = await bookingApi.exportBookings(format);
      toast.success('Export generated!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Export failed';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async importBookings(bookingsList) {
    try {
      const response = await bookingApi.importBookings(bookingsList);
      toast.success(`Imported ${response.data.imported} bookings!`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Import failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }
};

export default bookingService;
