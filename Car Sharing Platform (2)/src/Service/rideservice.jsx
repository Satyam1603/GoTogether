// Ride Service - Wrapper around API calls with error handling
import * as rideApi from '../api/rideApi';
import { toast } from 'sonner';

export const rideService = {
  // Publish a new ride
  async publishRide(rideData) {
    try {
      const response = await rideApi.publishRide(rideData);
      toast.success('Ride published successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to publish ride';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // Search rides
  async searchRides(source, destination, date) {
    try {
      const response = await rideApi.searchRides(source, destination, date);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to search rides';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // Get ride details
  async getRideDetails(rideId) {
    try {
      const response = await rideApi.getRideDetails(rideId);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch ride details';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // Update a ride
  async updateRide(rideId, seat) {
    try {
      const response = await rideApi.updateRide(rideId, seat);
      toast.success('Ride updated successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update ride';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },
  async updateRideDetails(rideId, rideData) {
    try {
      const response = await rideApi.updateRideDetails(rideId, rideData);
      toast.success('Ride details updated successfully!');
      return { success: true, data: response.data };
    }
    catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update ride details';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // Cancel a ride
  async cancelRide(rideId) {
    try {
      const response = await rideApi.cancelRide(rideId);
      toast.success('Ride cancelled successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to cancel ride';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // Get driver's rides
  async getDriverRides(driverId) {
    try {
      const response = await rideApi.getDriverRides(driverId);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch driver rides';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // Update seat count
  async updateSeatCount(rideId, action) {
    try {
      const response = await rideApi.updateSeatCount(rideId, action);
      toast.success('Seat count updated!');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update seat count';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // Check ride status
  async checkRideStatus(rideId) {
    try {
      const response = await rideApi.checkRideStatus(rideId);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to check ride status';
      return { success: false, error: errorMsg };
    }
  },
};
