import axios from 'axios';

const VEHICLE_API = ' http://localhost:5290/gotogether/vehicle';

// Get all vehicles
export const getVehicles = () =>
  axios.get(VEHICLE_API);

// Get all vehicles for a specific driver
export const getVehiclesByDriver = (driverId) =>
  axios.get(`${VEHICLE_API}/driver/${driverId}`);

// Get vehicle by ID
export const getVehicleById = (id) =>
  axios.get(`${VEHICLE_API}/${id}`);

// Add a new vehicle
export const addVehicle = (vehicleData) =>
  axios.post(VEHICLE_API, vehicleData);

// Update vehicle
export const updateVehicle = (id, vehicleData) =>
  axios.put(`${VEHICLE_API}/${id}`, vehicleData);

// Delete vehicle
export const deleteVehicle = (id) =>
  axios.delete(`${VEHICLE_API}/${id}`);
