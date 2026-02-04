import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, Car as CarIcon, Plus, X, Music, Cigarette, Dog, MessageCircle, Wifi, Phone, Wind, Shield, AlertCircle, Info, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { rideService } from '../Service/rideservice';
import { Description } from '@radix-ui/react-dialog';
import { useEffect } from 'react';
import * as vehicleApi from '../api/vehicleApi';

export function PostRide({ onNavigate, user, onRidePosted }) {
  const [formData, setFormData] = useState({
    vehicleId: '',
    source: '',
    destination: '',
    date: '',
    departureTime: '',
    arrivalTime: '',
    farePerSeat: '',
    totalSeats: '1',
    description: '',
  });

  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const [vehicleData, setVehicleData] = useState({
    vehicleMake: '',
    vehicleModel: '',
    vehicleColor: '',
    vehicleYear: '',
  });

  const [pickupPoints, setPickupPoints] = useState(['']);
  const [dropoffPoints, setDropoffPoints] = useState(['']);
  
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  
  const [amenities, setAmenities] = useState({
    airConditioning: false,
    wifi: false,
    music: false,
    phoneCharger: false,
  });

  // Fetch vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingVehicles(true);
        const response = await vehicleApi.getVehiclesByDriver(user.id);
        setVehicles(response.data || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast.error('Failed to load your vehicles');
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, [user?.id]);

  const [preferences, setPreferences] = useState({
    music: false,
    smoking: false,
    pets: false,
    chatty: 'moderate',
  });

  const [agreements, setAgreements] = useState({
    termsAccepted: false,
    insuranceUnderstood: false,
    safetyGuidelines: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Fetch place suggestions from backend
  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/places?address=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuggestions(data);
      } else if (data.suggestedLocations && Array.isArray(data.suggestedLocations)) {
        setSuggestions(data.suggestedLocations);
      } else {
        setSuggestions([]);
      }
    } catch (e) {
      console.error('Error fetching suggestions:', e);
      setSuggestions([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if it's a vehicle field
    if (['vehicleMake', 'vehicleModel', 'vehicleColor', 'vehicleYear'].includes(name)) {
      setVehicleData({
        ...vehicleData,
        [name]: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // const handlePickupPointChange = (index, value) => {
  //   const newPickupPoints = [...pickupPoints];
  //   newPickupPoints[index] = value;
  //   setPickupPoints(newPickupPoints);
  // };

  // const addPickupPoint = () => {
  //   setPickupPoints([...pickupPoints, '']);
  // };

  // const removePickupPoint = (index) => {
  //   if (pickupPoints.length > 1) {
  //     setPickupPoints(pickupPoints.filter((_, i) => i !== index));
  //   }
  // };

  // const handleDropoffPointChange = (index, value) => {
  //   const newDropoffPoints = [...dropoffPoints];
  //   newDropoffPoints[index] = value;
  //   setDropoffPoints(newDropoffPoints);
  // };

  // const addDropoffPoint = () => {
  //   setDropoffPoints([...dropoffPoints, '']);
  // };

  // const removeDropoffPoint = (index) => {
  //   if (dropoffPoints.length > 1) {
  //     setDropoffPoints(dropoffPoints.filter((_, i) => i !== index));
  //   }
  // };

  const handlePickupPointChange = (index, value) => {
    const newPickupPoints = [...pickupPoints];
    newPickupPoints[index] = value;
    setPickupPoints(newPickupPoints);
  };

  const addPickupPoint = () => {
    setPickupPoints([...pickupPoints, '']);
  };

  const removePickupPoint = (index) => {
    if (pickupPoints.length > 1) {
      setPickupPoints(pickupPoints.filter((_, i) => i !== index));
    }
  };

  const handleDropoffPointChange = (index, value) => {
    const newDropoffPoints = [...dropoffPoints];
    newDropoffPoints[index] = value;
    setDropoffPoints(newDropoffPoints);
  };

  const addDropoffPoint = () => {
    setDropoffPoints([...dropoffPoints, '']);
  };

  const removeDropoffPoint = (index) => {
    if (dropoffPoints.length > 1) {
      setDropoffPoints(dropoffPoints.filter((_, i) => i !== index));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setAmenities({
      ...amenities,
      [amenity]: !amenities[amenity],
    });
  };

  const handlePreferenceToggle = (preference) => {
    setPreferences({
      ...preferences,
      [preference]: !preferences[preference],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.vehicleId || !formData.source || !formData.destination || !formData.date || !formData.departureTime || !formData.farePerSeat) {
      toast.error('Please fill in all required ride fields');
      return;
    }

    // Filter out empty pickup/dropoff points
    const validPickupPoints = pickupPoints.filter(p => p.trim() !== '');
    const validDropoffPoints = dropoffPoints.filter(p => p.trim() !== '');

    if (validPickupPoints.length === 0 || validDropoffPoints.length === 0) {
      toast.error('Please add at least one pickup and one dropoff point');
      return;
    }

    // Validate agreements
    if (!agreements.termsAccepted || !agreements.insuranceUnderstood || !agreements.safetyGuidelines) {
      toast.error('Please accept all terms and conditions to continue');
      return;
    }

    setIsLoading(true);

    // Combine date and time into LocalDateTime format (ISO 8601)
    const departureDateTime = `${formData.date}T${formData.departureTime}:00`;
    const arrivalDateTime = formData.arrivalTime ? `${formData.date}T${formData.arrivalTime}:00` : null;

    // Prepare ride data for backend - ONLY ride information
    const rideRequestDTO = {
      driverId: user?.id,
      vehicleId: parseInt(formData.vehicleId),
      source: formData.source,
      destination: formData.destination,
      departureTime: departureDateTime,
      arrivalTime: arrivalDateTime,
      farePerSeat: parseFloat(formData.farePerSeat),
      totalSeats: parseInt(formData.totalSeats),
      description: formData.description,
      airConditioning:  amenities.airConditioning,
     chatty: preferences.chatty,
        wifi: amenities.wifi,
        music: amenities.music,
        phoneCharger: amenities.phoneCharger,
      music: preferences.music,
    smoking: preferences.smoking,
    pets: preferences.pets,
     termsAccepted: agreements.termsAccepted,
    insuranceUnderstood: agreements.insuranceUnderstood,
    safetyGuidelines: agreements.safetyGuidelines,
      pickupPoints: validPickupPoints,
      dropoffPoints: validDropoffPoints,
    };

    // Call ride API
    const result = await rideService.publishRide(rideRequestDTO);
    setIsLoading(false);

    if (result.success) {
      // Send vehicle data to vehicle service if needed
      if (vehicleData.vehicleMake || vehicleData.vehicleModel || vehicleData.vehicleColor || vehicleData.vehicleYear) {
        const vehiclePayload = {
          driverId: user?.id,
          vehicleId: parseInt(formData.vehicleId),
          make: vehicleData.vehicleMake,
          model: vehicleData.vehicleModel,
          color: vehicleData.vehicleColor,
          year: vehicleData.vehicleYear ? parseInt(vehicleData.vehicleYear) : null,
        };
        
        // TODO: Call vehicle service here
        // await vehicleService.updateVehicleInfo(vehiclePayload);
        console.log('Vehicle data to be sent:', vehiclePayload);
      }

      // Reset forms
      setFormData({
        vehicleId: '',
        source: '',
        destination: '',
        date: '',
        departureTime: '',
        arrivalTime: '',
        farePerSeat: '',
        totalSeats: '1',
        description: '',
      });
      setVehicleData({
        vehicleMake: '',
        vehicleModel: '',
        vehicleColor: '',
        vehicleYear: '',
      });
      setPickupPoints(['']);
      setDropoffPoints(['']);
      setAmenities({
        airConditioning: false,
        wifi: false,
        music: false,
        phoneCharger: false,
      });
      setPreferences({
        music: false,
        smoking: false,
        pets: false,
        chatty: 'medium',
      });
      setAgreements({
        termsAccepted: false,
        insuranceUnderstood: false,
        safetyGuidelines: false,
      });

      // Call callback to refresh trips list if provided
      if (onRidePosted) {
        onRidePosted();
      }

      // Navigate back home after a delay
      setTimeout(() => {
        onNavigate('home');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-form" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Skip to main form
      </a>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2 transition-all duration-200 mb-8"
          aria-label="Go back to home page"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          <span>Back to Home</span>
        </button>

        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Publish a Ride</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Share your journey and earn money while helping others travel. Complete all required fields marked with an asterisk (*).
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" id="main-form" aria-label="Publish a ride form">
          {/* Trip Details Section */}
          <Card className="p-8 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">1</span>
              Trip Details
            </h2>
            
            <div className="space-y-6">
              {/* Vehicle Selection */}
              <div className="space-y-2">
                <Label htmlFor="vehicleId" className="text-base font-semibold text-gray-900">
                  Select Vehicle <span className="text-red-500" aria-label="required">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-2">Choose which vehicle you'll be using for this ride</p>
                <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <CarIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" aria-hidden="true" />
                  <Select value={formData.vehicleId} onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}>
                    <SelectTrigger className="flex-1 h-full border-none bg-transparent text-sm p-0 focus-visible:ring-0 focus-visible:outline-none" aria-required="true">
                      <SelectValue placeholder="Select your vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.length === 0 ? (
                        <SelectItem disabled value="no-vehicles">
                          {loadingVehicles ? 'Loading vehicles...' : 'No vehicles available'}
                        </SelectItem>
                      ) : (
                        vehicles.map((vehicle) => (
                          <SelectItem 
                            key={vehicle.vehicle_Id} 
                            value={vehicle.vehicle_Id.toString()}
                          >
                            {vehicle.make} {vehicle.model} - {vehicle.color} (Plate: {vehicle.plateNumber})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Origin & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source (Leaving from) */}
                <div className="space-y-2 relative">
                  <Label htmlFor="source" className="text-base font-semibold text-gray-900">
                    Leaving from <span className="text-red-500" aria-label="required">*</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">Enter the city or address where you'll start</p>
                  <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" aria-hidden="true" />
                    <input
                      id="source"
                      name="source"
                      type="text"
                      placeholder="e.g., New York, NY"
                      value={formData.source}
                      onChange={(e) => {
                        setFormData({ ...formData, source: e.target.value });
                        fetchSuggestions(e.target.value, setSourceSuggestions);
                        setShowSourceDropdown(true);
                        setSelectedSource(null);
                      }}
                      onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                      onFocus={() => sourceSuggestions.length > 0 && setShowSourceDropdown(true)}
                      required
                      aria-required="true"
                      aria-describedby="source-help"
                      className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                      autoComplete="off"
                    />
                  </div>
                  
                  {/* Source Suggestions Dropdown */}
                  {showSourceDropdown && sourceSuggestions.length > 0 && (
                    <div
                      className="absolute left-0 top-full mt-1 z-50 w-full bg-white border border-sky-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                      style={{ backgroundColor: '#fff' }}
                    >
                      {sourceSuggestions.map((s, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 cursor-pointer text-sm flex justify-between border-b border-gray-100 last:border-b-0 text-sky-900 bg-white hover:bg-sky-100"
                          style={{ backgroundColor: '#fff' }}
                          onMouseDown={() => {
                            setFormData({ ...formData, source: s.placeName });
                            setSelectedSource(s);
                            setShowSourceDropdown(false);
                          }}
                        >
                          <span>{s.placeName}</span>
                          <span className="text-gray-400 ml-2">{s.state}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Destination (Going to) */}
                <div className="space-y-2 relative">
                  <Label htmlFor="destination" className="text-base font-semibold text-gray-900">
                    Going to <span className="text-red-500" aria-label="required">*</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">Enter the destination city or address</p>
                  <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mr-2" aria-hidden="true" />
                    <input
                      id="destination"
                      name="destination"
                      type="text"
                      placeholder="e.g., Boston, MA"
                      value={formData.destination}
                      onChange={(e) => {
                        setFormData({ ...formData, destination: e.target.value });
                        fetchSuggestions(e.target.value, setDestinationSuggestions);
                        setShowDestinationDropdown(true);
                        setSelectedDestination(null);
                      }}
                      onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
                      onFocus={() => destinationSuggestions.length > 0 && setShowDestinationDropdown(true)}
                      required
                      aria-required="true"
                      aria-describedby="destination-help"
                      className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                      autoComplete="off"
                    />
                  </div>
                  
                  {/* Destination Suggestions Dropdown */}
                  {showDestinationDropdown && destinationSuggestions.length > 0 && (
                    <div
                      className="absolute left-0 top-full mt-1 z-50 w-full bg-white border border-sky-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                      style={{ backgroundColor: '#fff' }}
                    >
                      {destinationSuggestions.map((s, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 cursor-pointer text-sm flex justify-between border-b border-gray-100 last:border-b-0 text-sky-900 bg-white hover:bg-sky-100"
                          style={{ backgroundColor: '#fff' }}
                          onMouseDown={() => {
                            setFormData({ ...formData, destination: s.placeName });
                            setSelectedDestination(s);
                            setShowDestinationDropdown(false);
                          }}
                        >
                          <span>{s.placeName}</span>
                          <span className="text-gray-400 ml-2">{s.state}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-base font-semibold text-gray-900">
                    Date <span className="text-red-500" aria-label="required">*</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">Select your departure date</p>
                  <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" aria-hidden="true" />
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureTime" className="text-base font-semibold text-gray-900">
                    Departure Time <span className="text-red-500" aria-label="required">*</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">What time do you leave?</p>
                  <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" aria-hidden="true" />
                    <Input
                      id="departureTime"
                      name="departureTime"
                      type="time"
                      value={formData.departureTime}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrivalTime" className="text-base font-semibold text-gray-900">
                    Arrival Time (Estimated)
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">When do you expect to arrive?</p>
                  <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" aria-hidden="true" />
                    <Input
                      id="arrivalTime"
                      name="arrivalTime"
                      type="time"
                      value={formData.arrivalTime}
                      onChange={handleChange}
                      className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seats & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="totalSeats" className="text-base font-semibold text-gray-900">
                    Total Seats Available <span className="text-red-500" aria-label="required">*</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">How many seats can you offer?</p>
                  <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <Users className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" aria-hidden="true" />
                    <Select value={formData.totalSeats} onValueChange={(value) => setFormData({ ...formData, totalSeats: value })}>
                      <SelectTrigger className="flex-1 h-full border-none bg-transparent text-sm p-0 focus-visible:ring-0 focus-visible:outline-none" aria-required="true">
                        <SelectValue placeholder="Select number of seats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 seat</SelectItem>
                        <SelectItem value="2">2 seats</SelectItem>
                        <SelectItem value="3">3 seats</SelectItem>
                        <SelectItem value="4">4 seats</SelectItem>
                        <SelectItem value="5">5 seats</SelectItem>
                        <SelectItem value="6">6 seats</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farePerSeat" className="text-base font-semibold text-gray-900">
                    Fare per Seat <span className="text-red-500" aria-label="required">*</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">How much do you want to charge per seat?</p>
                  <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <DollarSign className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" aria-hidden="true" />
                    <Input
                      id="farePerSeat"
                      name="farePerSeat"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="25.50"
                      value={formData.farePerSeat}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      aria-describedby="fare-help"
                      className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-gray-900">
                  Trip Description (Optional)
                </Label>
                <p className="text-sm text-gray-500 mb-2">Add any special details about your trip</p>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="e.g., I'm stopping for lunch at 2 PM, pet-friendly car, please don't smoke..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-base"
                  aria-describedby="description-help"
                />
              </div>
            </div>
          </Card>

          {/* Pickup & Dropoff Points */}
          <Card className="p-8 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">2</span>
              Pickup & Dropoff Points
            </h2>
            
            <div className="space-y-8">
              {/* Pickup Points */}
              <fieldset>
                <legend className="text-base font-semibold text-gray-900 mb-4">
                  Pickup Points <span className="text-red-500" aria-label="required">*</span>
                </legend>
                <p className="text-sm text-gray-600 mb-4">Add all locations where passengers can board your vehicle</p>
                <div className="space-y-3">
                  {pickupPoints.map((point, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="relative flex-1">
                        <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                          <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mr-2" aria-hidden="true" />
                          <Input
                            type="text"
                            placeholder={`Pickup location ${index + 1}`}
                            value={point}
                            onChange={(e) => handlePickupPointChange(index, e.target.value)}
                            aria-label={`Pickup location ${index + 1}`}
                            className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                          />
                        </div>
                      </div>
                      {pickupPoints.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removePickupPoint(index)}
                          className="h-11 hover:bg-red-50 hover:text-red-600 transition-colors"
                          aria-label={`Remove pickup location ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPickupPoint}
                    className="w-full h-11 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all"
                    aria-label="Add another pickup location"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pickup Point
                  </Button>
                </div>
              </fieldset>

              {/* Dropoff Points */}
              <fieldset>
                <legend className="text-base font-semibold text-gray-900 mb-4">
                  Dropoff Points <span className="text-red-500" aria-label="required">*</span>
                </legend>
                <p className="text-sm text-gray-600 mb-4">Add all locations where passengers will be dropped off</p>
                <div className="space-y-3">
                  {dropoffPoints.map((point, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="relative flex-1">
                        <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                          <MapPin className="h-5 w-5 text-red-600 flex-shrink-0 mr-2" aria-hidden="true" />
                          <Input
                            type="text"
                            placeholder={`Dropoff location ${index + 1}`}
                            value={point}
                            onChange={(e) => handleDropoffPointChange(index, e.target.value)}
                            aria-label={`Dropoff location ${index + 1}`}
                            className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                          />
                        </div>
                      </div>
                      {dropoffPoints.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeDropoffPoint(index)}
                          className="h-11 hover:bg-red-50 hover:text-red-600 transition-colors"
                          aria-label={`Remove dropoff location ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDropoffPoint}
                    className="w-full h-11 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all"
                    aria-label="Add another dropoff location"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Dropoff Point
                  </Button>
                </div>
              </fieldset>
            </div>
          </Card>
          <Card className="p-8 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">3</span>
              Vehicle Information (Optional)
            </h2>
            <p className="text-gray-600 mb-6">Add details about the vehicle you'll be using for this ride</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vehicleMake" className="text-base font-semibold text-gray-900">Vehicle Make</Label>
                <p className="text-sm text-gray-500 mb-2">e.g., Honda, Toyota, Ford</p>
                <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <CarIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" aria-hidden="true" />
                  <Input
                    id="vehicleMake"
                    name="vehicleMake"
                    type="text"
                    placeholder="Honda"
                    value={vehicleData.vehicleMake}
                    onChange={handleChange}
                    className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleModel" className="text-base font-semibold text-gray-900">Vehicle Model</Label>
                <p className="text-sm text-gray-500 mb-2">e.g., Accord, Camry, Mustang</p>
                <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <CarIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" aria-hidden="true" />
                  <Input
                    id="vehicleModel"
                    name="vehicleModel"
                    type="text"
                    placeholder="Accord"
                    value={vehicleData.vehicleModel}
                    onChange={handleChange}
                    className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleColor" className="text-base font-semibold text-gray-900">Vehicle Color</Label>
                <p className="text-sm text-gray-500 mb-2">What color is your car?</p>
                <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <CarIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" aria-hidden="true" />
                  <Input
                    id="vehicleColor"
                    name="vehicleColor"
                    type="text"
                    placeholder="Silver"
                    value={vehicleData.vehicleColor}
                    onChange={handleChange}
                    className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleYear" className="text-base font-semibold text-gray-900">Vehicle Year</Label>
                <p className="text-sm text-gray-500 mb-2">What year was your car made?</p>
                <div className="flex items-center h-11 pl-3 bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" aria-hidden="true" />
                  <Input
                    id="vehicleYear"
                    name="vehicleYear"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    placeholder="2022"
                    value={vehicleData.vehicleYear}
                    onChange={handleChange}
                    className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Amenities */}
          <Card className="p-8 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">4</span>
              Vehicle Amenities (Optional)
            </h2>
            <p className="text-gray-600 mb-6">What amenities does your vehicle offer?</p>
            
            <fieldset>
              <legend className="sr-only">Vehicle Amenities</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer">
                  <Checkbox
                    id="airConditioning"
                    checked={amenities.airConditioning}
                    onCheckedChange={() => handleAmenityToggle('airConditioning')}
                    className="h-5 w-5"
                  />
                  <label htmlFor="airConditioning" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                    <Wind className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    <span className="font-medium text-gray-900">Air Conditioning</span>
                  </label>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer">
                  <Checkbox
                    id="wifi"
                    checked={amenities.wifi}
                    onCheckedChange={() => handleAmenityToggle('wifi')}
                    className="h-5 w-5"
                  />
                  <label htmlFor="wifi" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                    <Wifi className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    <span className="font-medium text-gray-900">WiFi</span>
                  </label>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer">
                  <Checkbox
                    id="music"
                    checked={amenities.music}
                    onCheckedChange={() => handleAmenityToggle('music')}
                    className="h-5 w-5"
                  />
                  <label htmlFor="music" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                    <Music className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    <span className="font-medium text-gray-900">Music System</span>
                  </label>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer">
                  <Checkbox
                    id="phoneCharger"
                    checked={amenities.phoneCharger}
                    onCheckedChange={() => handleAmenityToggle('phoneCharger')}
                    className="h-5 w-5"
                  />
                  <label htmlFor="phoneCharger" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                    <Phone className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    <span className="font-medium text-gray-900">Phone Charger</span>
                  </label>
                </div>
              </div>
            </fieldset>
          </Card>

          {/* Preferences */}
          <Card className="p-8 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">5</span>
              Your Preferences (Optional)
            </h2>
            
            <div className="space-y-8">
              {/* Music, Smoking, Pets */}
              <fieldset>
                <legend className="text-base font-semibold text-gray-900 mb-4">Travel Policies</legend>
                <p className="text-sm text-gray-600 mb-4">Let passengers know what you're comfortable with</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer">
                    <Checkbox
                      id="prefMusic"
                      checked={preferences.music}
                      onCheckedChange={() => handlePreferenceToggle('music')}
                      className="h-5 w-5"
                    />
                    <label htmlFor="prefMusic" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                      <Music className="h-6 w-6 text-blue-600" aria-hidden="true" />
                      <span className="font-medium text-gray-900">Music Playing</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer">
                    <Checkbox
                      id="prefSmoking"
                      checked={preferences.smoking}
                      onCheckedChange={() => handlePreferenceToggle('smoking')}
                      className="h-5 w-5"
                    />
                    <label htmlFor="prefSmoking" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                      <Cigarette className="h-6 w-6 text-blue-600" aria-hidden="true" />
                      <span className="font-medium text-gray-900">Smoking Allowed</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer">
                    <Checkbox
                      id="prefPets"
                      checked={preferences.pets}
                      onCheckedChange={() => handlePreferenceToggle('pets')}
                      className="h-5 w-5"
                    />
                    <label htmlFor="prefPets" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                      <Dog className="h-6 w-6 text-blue-600" aria-hidden="true" />
                      <span className="font-medium text-gray-900">Pets Welcome</span>
                    </label>
                  </div>
                </div>
              </fieldset>

              {/* Chatty Level */}
              <fieldset>
                <legend className="text-base font-semibold text-gray-900 mb-4">Communication Preference</legend>
                <p className="text-sm text-gray-600 mb-4">How chatty are you with passengers?</p>
                <RadioGroup value={preferences.chatty} onValueChange={(value) => setPreferences({ ...preferences, chatty: value })}>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all">
                    <RadioGroupItem value="quiet" id="quiet" className="h-5 w-5" />
                    <label htmlFor="quiet" className="cursor-pointer flex-1 text-base font-medium text-gray-900">
                      Quiet - I prefer silence
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all">
                    <RadioGroupItem value="moderate" id="moderate" className="h-5 w-5" />
                    <label htmlFor="moderate" className="cursor-pointer flex-1 text-base font-medium text-gray-900">
                      Moderate - I'm open to chat if others want
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all">
                    <RadioGroupItem value="talkative" id="talkative" className="h-5 w-5" />
                    <label htmlFor="talkative" className="cursor-pointer flex-1 text-base font-medium text-gray-900">
                      Talkative - I love conversation!
                    </label>
                  </div>
                </RadioGroup>
              </fieldset>
            </div>
          </Card>

          {/* Insurance & Safety Information */}
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full flex-shrink-0">
                <Shield className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 6: Insurance & Safety</h2>
                <p className="text-base text-gray-700">Please review this important information before publishing your ride. Your safety and your passengers' safety are our top priorities.</p>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <div className="flex items-start gap-4 mb-4">
                <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Insurance Coverage</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Your personal auto insurance policy is your primary coverage. GoTogether provides supplemental insurance that may apply during active rides, subject to terms and conditions.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1 flex-shrink-0">✓</span>
                      <span>Ensure your vehicle insurance is current and valid</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1 flex-shrink-0">✓</span>
                      <span>Inform your insurance provider that you're offering rideshares</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1 flex-shrink-0">✓</span>
                      <span>GoTogether's supplemental insurance has deductibles and coverage limits</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1 flex-shrink-0">✓</span>
                      <span>Coverage details are available in our full Insurance Policy document</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Safety Guidelines */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Safety Guidelines</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold mt-1 flex-shrink-0">!</span>
                      <span>Verify passenger identities before the trip begins</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold mt-1 flex-shrink-0">!</span>
                      <span>Never share personal contact information publicly</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold mt-1 flex-shrink-0">!</span>
                      <span>Ensure your vehicle is roadworthy with valid registration and inspection</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold mt-1 flex-shrink-0">!</span>
                      <span>Follow all traffic laws and maintain safe driving practices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold mt-1 flex-shrink-0">!</span>
                      <span>Trust your instincts - you have the right to refuse any passenger</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold mt-1 flex-shrink-0">!</span>
                      <span>Use in-app messaging for all trip-related communication</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Agreement Checkboxes */}
            <fieldset className="bg-white rounded-lg p-6 border border-gray-200">
              <legend className="text-lg font-semibold text-gray-900 mb-5">Required Agreements</legend>
              <p className="text-sm text-gray-600 mb-6">You must accept all of these to publish your ride</p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all">
                  <Checkbox
                    id="termsAccepted"
                    checked={agreements.termsAccepted}
                    onCheckedChange={(checked) => setAgreements({ ...agreements, termsAccepted: checked })}
                    className="h-5 w-5 mt-1 flex-shrink-0"
                  />
                  <label htmlFor="termsAccepted" className="cursor-pointer flex-1">
                    <span className="block text-base font-medium text-gray-900 mb-2">I agree to the Terms of Service and Community Guidelines</span>
                    <span className="text-sm text-gray-600">
                      You agree to provide safe, reliable transportation and follow all platform rules.{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">Read full terms</a>
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all">
                  <Checkbox
                    id="insuranceUnderstood"
                    checked={agreements.insuranceUnderstood}
                    onCheckedChange={(checked) => setAgreements({ ...agreements, insuranceUnderstood: checked })}
                    className="h-5 w-5 mt-1 flex-shrink-0"
                  />
                  <label htmlFor="insuranceUnderstood" className="cursor-pointer flex-1">
                    <span className="block text-base font-medium text-gray-900 mb-2">I understand the insurance policy and coverage</span>
                    <span className="text-sm text-gray-600">
                      You confirm that you have valid insurance and understand coverage limitations.{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">View insurance details</a>
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all">
                  <Checkbox
                    id="safetyGuidelines"
                    checked={agreements.safetyGuidelines}
                    onCheckedChange={(checked) => setAgreements({ ...agreements, safetyGuidelines: checked })}
                    className="h-5 w-5 mt-1 flex-shrink-0"
                  />
                  <label htmlFor="safetyGuidelines" className="cursor-pointer flex-1">
                    <span className="block text-base font-medium text-gray-900 mb-2">I have read and will follow all safety guidelines</span>
                    <span className="text-sm text-gray-600">
                      You commit to maintaining high safety standards for all passengers.{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">Safety best practices</a>
                    </span>
                  </label>
                </div>
              </div>
            </fieldset>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 sticky bottom-0 bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('home')}
              className="flex-1 h-12 text-base font-semibold border-2 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              aria-label="Cancel and return to home page"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 text-base font-semibold border-2 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              disabled={isLoading}
              aria-busy={isLoading}
              aria-label={isLoading ? "Publishing your ride" : "Publish your ride"}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block animate-spin">⚙️</span>
                  Publishing...
                </span>
              ) : (
                'Publish Ride'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}