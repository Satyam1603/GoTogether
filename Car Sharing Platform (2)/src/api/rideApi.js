// API calls for Ride endpoints
import axios from 'axios';

const BASE_URL =  'http://localhost:9090';
const RIDE_API = `${BASE_URL}/gotogether/rides`;

// Helper function to get authorization headers with bearer token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Publish a ride
export const publishRide = (rideRequestDTO) =>
  axios.post(RIDE_API, rideRequestDTO, { headers: getAuthHeaders() });

// Search rides by source, destination, and date
export const searchRides = (source, destination, date) =>
  axios.get(RIDE_API, { 
    params: { 
      source, 
      destination, 
      date 
    } 
  });

// Get ride details by ID
export const getRideDetails = (rideId) =>
  axios.get(`${RIDE_API}/${rideId}`);

// Update a ride
export const updateRideDetails = (rideId, rideRequestDTO) =>
  axios.put(`${RIDE_API}/${rideId}`, rideRequestDTO, { headers: getAuthHeaders() });

// Cancel a ride
export const cancelRide = (rideId) =>
  axios.delete(`${RIDE_API}/${rideId}`, { headers: getAuthHeaders() });

// Get all rides for a specific driver
export const getDriverRides = (driverId) =>
  axios.get(`${RIDE_API}/driver/${driverId}`, { headers: getAuthHeaders() });

// Update seat count (increment or decrement)
export const updateSeatCount = (rideId, seat) =>
  axios.get(`${RIDE_API}/${rideId}/updateseat`, { 
    params: { seat },
    headers: getAuthHeaders()
  });
  export const updateSeatCountAfterCancellation = (rideId, seat) =>
  axios.get(`${RIDE_API}/${rideId}/updateseataftercancel`, { 
    params: { seat },
    headers: getAuthHeaders()
  });

// Check ride status
export const checkRideStatus = (rideId) =>
  axios.get(`${RIDE_API}/${rideId}/status`);

// Get all available rides
export const getAllRides = () =>
  axios.get(`${RIDE_API}/getallrides`);

// Get driver profile images
export const getDriverImages = () =>
  axios.get(`${RIDE_API}/users/compact/all`);

// Get all available rides with optional filters
export const getAvailableRides = (filters = {}) => {
  const params = {};
  if (filters.source) params.source = filters.source;
  if (filters.destination) params.destination = filters.destination;
  if (filters.date) params.date = filters.date;
  
  return axios.get(RIDE_API, { params });
};

// Transform backend ride response to frontend format
export const transformRideResponse = (backendRide, driverImagesMap = {}, vehiclesArray = []) => {
    console.log('Transforming ride:', backendRide);
    console.log(`Driver Images Map:`, driverImagesMap);
    console.log(`Vehicles Array:`, vehiclesArray);
    
  const driverId = backendRide.driverId;

  // Find the specific vehicle for this ride
  let vehicleData = { make: 'Unknown', model: 'Unknown', color: 'Unknown', plateNumber: 'N/A', year: 2020 };
  
  if (Array.isArray(vehiclesArray) && vehiclesArray.length > 0) {
    // Look for vehicle by vehicleId if available
    const vehicle = vehiclesArray.find(v => v.vehicle_Id === backendRide.vehicleId || v.id === backendRide.vehicleId);
    if (vehicle) {
      vehicleData = {
        make: vehicle.make || 'Unknown',
        model: vehicle.model || 'Unknown',
        color: vehicle.color || 'Unknown',
        plateNumber: vehicle.plateNumber || 'N/A',
        year: vehicle.year || 2020,
      };
      console.log('Found vehicle for ride:', vehicleData);
    } else {
      console.log('No vehicle found for vehicleId:', backendRide.vehicleId);
    }
  }

  let driverAvatar = backendRide.driverAvatar || 'https://gotogether-user-service.s3.eu-north-1.amazonaws.com/users/688d5e0d-fb75-43c2-8ea2-52288fc4e706-1769969808858-photu.jpg';
  
  // Check if we have S3 URL image for this driver
  if (driverImagesMap[driverId] && driverImagesMap[driverId].imageUrl) {
    driverAvatar = driverImagesMap[driverId].imageUrl;  // Use URL directly, no conversion needed
  }
  console.log('Driver Avatar for driverId', driverId, ':', driverAvatar);
  return {
    id: backendRide.rideId?.toString() || backendRide.id?.toString(),
    driver: {
      id: backendRide.driverId,
      name: driverImagesMap[backendRide.driverId]?.username || 'Driver',
      avatar: driverAvatar,
      rating: backendRide.driverRating || 4.5,
      reviewCount: backendRide.driverReviewCount || 0,
      verified: backendRide.driverVerified || false,
    },
    origin: backendRide.source,
    destination: backendRide.destination,
    date: backendRide.departureTime?.split('T')[0],
    departureTime: backendRide.departureTime?.split('T')[1]?.substring(0, 5) || '00:00',
    arrivalTime: backendRide.arrivalTime?.split('T')[1]?.substring(0, 5) || '00:00',
    duration: calculateDuration(backendRide.departureTime, backendRide.arrivalTime),
    pricePerSeat: backendRide.farePerSeat,
    availableSeats: backendRide.availableSeats,
    totalSeats: backendRide.totalSeats,
    vehicle: {
      make: vehicleData.make,
      model: vehicleData.model,
      color: vehicleData.color,
      year: vehicleData.year,
      plate: vehicleData.plateNumber,
    },
    amenities: [
      backendRide.airConditioning && 'Air Conditioning',
      backendRide.wifi && 'WiFi',
      backendRide.music && 'Music',
      backendRide.phoneCharger && 'Phone Charger',
    ].filter(Boolean),
    preferences: {
      music: backendRide.music || false,
      smoking: backendRide.smoking || false,
      pets: backendRide.pets || false,
      chatty: backendRide.chatty || 'moderate',
    },
    pickupPoints: backendRide.pickupPoints || [],
    dropoffPoints: backendRide.dropoffPoints || [],
    status: backendRide.status || 'SCHEDULED',
  };
};

// Helper function to calculate duration
const calculateDuration = (departureTime, arrivalTime) => {
  if (!departureTime || !arrivalTime) return '0h 0m';
  
  try {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const minutes = Math.round((arrival - departure) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  } catch (e) {
    return '0h 0m';
  }
};
