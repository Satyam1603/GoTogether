import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Clock, Users, CreditCard, BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import bookingService from '../Service/bookingservice';
import { updateSeatCount } from '../api/rideApi';
import { useEffect } from 'react';

export function BookingDialog({ trip, open, onClose, onBookingSuccess }) {
  const { user, token } = useAuth();
  const [seats, setSeats] = useState(1);
  const [pickupPoint, setPickupPoint] = useState('');
  const [dropoffPoint, setDropoffPoint] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Force update when auth state changes
  const [authCheckTime, setAuthCheckTime] = useState(0);

  useEffect(() => {
    // Re-check auth when component mounts or when dialog opens
    setAuthCheckTime(Date.now());
    
    // Listen for storage changes (logout from other tabs or windows)
    const handleStorageChange = () => {
      setAuthCheckTime(Date.now());
      console.log('Storage changed, re-checking auth');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [open]);

  if (!trip) return null;

  // Check if user is authenticated by verifying token in localStorage
  const storedToken = localStorage.getItem('accessToken');
  const isAuthenticated = !!(user && user.id && (token || storedToken));

  console.log('BookingDialog Auth Check:', { user, token, storedToken, isAuthenticated, authCheckTime });

  // Prevent booking if user is not logged in or no token
  if (!isAuthenticated) {
    console.log('User not authenticated, showing login required dialog');
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to book a ride
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Please log in to your account to complete your booking.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const totalPrice = seats * trip.pricePerSeat;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    if (!pickupPoint) newErrors.pickupPoint = 'Pickup point is required';
    if (!dropoffPoint) newErrors.dropoffPoint = 'Dropoff point is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verify authentication before submitting
    const storedToken = localStorage.getItem('accessToken');
    if (!user || !user.id || !storedToken) {
      toast.error('Your session has expired. Please log in again to book a ride');
      onClose();
      return;
    }
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Prepare booking data according to backend BookingRequestDTO
      const bookingData = {
        rideId: trip.id,
        passengerId: user?.id || user?.userId, // Get ID from logged-in user
        passengerSeats: seats,
        pickupPoint: pickupPoint,
        dropoffPoint: dropoffPoint,
        totalAmount: totalPrice,
        rideDate: trip.date // ISO date string from trip
      };

      const result = await bookingService.createBooking(bookingData);
      
      if (result.success) {
        // Update the ride's available seats count
        try {
          await updateSeatCount(trip.id, seats);
          console.log('Seat count updated for ride:', trip.id);
        } catch (seatError) {
          console.error('Failed to update seat count:', seatError);
        }

        // Reset form
        setFullName('');
        setEmail('');
        setPhone('');
        setCardNumber('');
        setSeats(1);
        setPickupPoint('');
        setDropoffPoint('');
        setErrors({});
        
        // Call the callback to refresh trips list
        if (onBookingSuccess) {
          onBookingSuccess();
        }
        
        // Close dialog
        onClose();
      }
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-screen flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle>Book Your Ride</DialogTitle>
          <DialogDescription>
            Complete your booking details below
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-4">
          {/* Trip Preview */}
          <div className="p-3 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <div className="w-0.5 h-12 bg-gray-300"></div>
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="mb-3">
                  <div className="text-sm text-gray-600">{trip.departureTime}</div>
                  <div>{trip.origin}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{trip.arrivalTime}</div>
                  <div>{trip.destination}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{formatDate(trip.date)}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {trip.duration}
                </div>
              </div>
            </div>

            {/* Driver Info */}
            <div className="flex items-center gap-3 pt-3 border-t">
              <Avatar className="h-10 w-10">
                <AvatarImage src={trip.driver.avatar} alt={trip.driver.name} />
                <AvatarFallback>{trip.driver.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span>{trip.driver.name}</span>
                  {trip.driver.verified && (
                    <BadgeCheck className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {trip.vehicle.color} {trip.vehicle.make} {trip.vehicle.model}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="seats" className="flex items-center gap-2 mb-1 text-sm">
                <Users className="h-4 w-4" />
                Number of Seats
              </Label>
              <Select value={seats.toString()} onValueChange={(value) => setSeats(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: trip.availableSeats }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} seat{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pickup" className="flex items-center gap-2 mb-1 text-sm">
                <MapPin className="h-4 w-4" />
                Pick-up Point
              </Label>
              <Select value={pickupPoint} onValueChange={setPickupPoint}>
                <SelectTrigger className={errors.pickupPoint ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select pick-up location" />
                </SelectTrigger>
                <SelectContent>
                  {trip.pickupPoints.map((point) => (
                    <SelectItem key={point} value={point}>
                      {point}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pickupPoint && <p className="text-red-500 text-sm mt-1">{errors.pickupPoint}</p>}
            </div>

            <div>
              <Label htmlFor="dropoff" className="flex items-center gap-2 mb-1 text-sm">
                <MapPin className="h-4 w-4" />
                Drop-off Point
              </Label>
              <Select value={dropoffPoint} onValueChange={setDropoffPoint}>
                <SelectTrigger className={errors.dropoffPoint ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select drop-off location" />
                </SelectTrigger>
                <SelectContent>
                  {trip.dropoffPoints.map((point) => (
                    <SelectItem key={point} value={point}>
                      {point}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dropoffPoint && <p className="text-red-500 text-sm mt-1">{errors.dropoffPoint}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`mt-1 ${errors.fullName ? 'border-red-500' : ''}`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="card" className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4" />
                Card Number
              </Label>
              <Input
                id="card"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className={`mt-1 ${errors.cardNumber ? 'border-red-500' : ''}`}
              />
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Price per seat:</span>
              <span>${trip.pricePerSeat}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of seats:</span>
              <span>{seats}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t">
              <span>Total:</span>
              <span className="text-blue-600">${totalPrice}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-shrink-0 sticky bottom-0 bg-white pt-2 border-t">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1 text-sm"
              disabled={isSubmitting || !isAuthenticated}
            >
              {!isAuthenticated ? 'Please Login to Book' : isSubmitting ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
