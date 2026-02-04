import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';
import * as bookingApi from '../api/bookingApi';
import { updateSeatCountAfterCancellation } from '../api/rideApi';
import { updateSeatCount } from '../api/rideApi';

export function MyBookings({ onNavigate, onBack }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchUserBookings();
  }, [user?.id]);

  const fetchUserBookings = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.getBookingsByPassenger(user.id);
      console.log('Bookings response:', response.data);
      if (response.data && Array.isArray(response.data)) {
        console.log('First booking structure:', response.data[0]);
      }
      setBookings(response.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'awaiting_confirmation':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
      case 'awaiting_confirmation':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleCancelClick = (bookingId) => {
    setCancellingBookingId(bookingId);
    setShowCancelConfirm(true);
    setCancelReason('');
  };

  const confirmCancelBooking = async () => {
    if (!cancellingBookingId) return;

    try {
      // Find the booking to get ride ID and seat count
      const booking = bookings.find(b => b.id === cancellingBookingId);
      if (!booking) return;

      // Cancel the booking
      await bookingApi.cancelBooking(cancellingBookingId, cancelReason || null);
      
      // Increase the ride's available seats (return the seats to the ride)
      try {
        await updateSeatCountAfterCancellation(booking.rideId, booking.passengerSeats);
        console.log(`Returned ${booking.passengerSeats} seats to ride ${booking.rideId}`);
      } catch (seatError) {
        console.error('Failed to update seat count:', seatError);
        // Continue even if seat update fails
      }
      
      // Update bookings list
      setBookings(bookings.map(b => 
        b.id === cancellingBookingId 
          ? { ...b, status: 'CANCELLED' } 
          : b
      ));

      // Close confirmation dialog
      setShowCancelConfirm(false);
      setCancellingBookingId(null);
      setCancelReason('');
      
      // Show success message
      alert('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status?.toLowerCase() === filterStatus.toLowerCase());
  console.log('Filtered Bookings:', filteredBookings);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your ride bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="h-8 w-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-red-900 font-medium">Error Loading Bookings</h3>
                <p className="text-red-700">{error}</p>
                <Button
                  onClick={fetchUserBookings}
                  className="mt-3 bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBookings.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't made any bookings yet. Start by booking a ride!"
                : `No ${filterStatus} bookings found.`}
            </p>
            {filterStatus === 'all' && (
              <Button 
                onClick={() => onNavigate('home')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Browse Available Rides
              </Button>
            )}
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id} 
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Status Badge and Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.rideTitle || `Booking #${booking.id}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Booking ID: {booking.id}
                      </p>
                    </div>
                    <Badge className={`flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status?.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Route Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">From</p>
                        <p className="font-medium text-gray-900">
                          {booking.pickupPoint || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">To</p>
                        <p className="font-medium text-gray-900">
                          {booking.dropoffPoint || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Departure
                      </p>
                      <p className="font-medium text-gray-900 text-sm">
                        {formatDate(booking.rideDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Booked At
                      </p>
                      <p className="font-medium text-gray-900 text-sm">
                        {formatDate(booking.bookedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" /> Price
                      </p>
                      <p className="font-medium text-gray-900 text-sm">
                        ${booking.totalAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <User className="h-4 w-4" /> Seats
                      </p>
                      <p className="font-medium text-gray-900 text-sm">
                        {booking.passengerSeats || '1'}
                      </p>
                    </div>
                  </div>

                  {/* Driver Info */}
                  {booking.driverName && (
                    <div className="p-4 bg-blue-50 rounded-lg mb-4">
                      <div className="flex items-center gap-3">
                        {booking.driverAvatar && (
                          <img 
                            src={booking.driverAvatar} 
                            alt={booking.driverName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm text-gray-600">Driver</p>
                          <p className="font-medium text-gray-900">{booking.driverName}</p>
                          {booking.driverPhone && (
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" /> {booking.driverPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {booking.specialRequests && (
                    <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                      <p className="text-gray-900">{booking.specialRequests}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {booking.status?.toLowerCase() === 'confirmed' && (
                      <>
                        <Button 
                          variant="outline"
                          className="flex-1"
                        >
                          Contact Driver
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleCancelClick(booking.id)}
                        >
                          Cancel Booking
                        </Button>
                      </>
                    )}
                    {booking.status?.toLowerCase() === 'completed' && (
                      <Button 
                        variant="outline"
                        className="flex-1"
                      >
                        Leave Review
                      </Button>
                    )}
                    {booking.status?.toLowerCase() === 'pending' && (
                      <Button 
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleCancelClick(booking.id)}
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination or Load More */}
        {!loading && filteredBookings.length > 5 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              onClick={fetchUserBookings}
            >
              Load More
            </Button>
          </div>
        )}

        {/* Cancel Confirmation Modal 
        {showCancelConfirm && (
          <div className="  fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4">
            <div className="bg-black rounded-xl max-w-md w-full p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Cancel Booking</h2>
              
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Cancellation Reason (Optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us why you're cancelling..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 py-2"
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancellingBookingId(null);
                    setCancelReason('');
                  }}
                >
                  Keep Booking
                </Button>
                <Button
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmCancelBooking}
                >
                  Confirm Cancel
                </Button>
              </div>
            </div>
          </div>
        )} */}
        {showCancelConfirm && (
           
  <div className=" fixed inset-0 bg-black/100 bg-opacity  z-50 flex items-center justify-center p-4">
    <div className="bg-black rounded-xl max-w-md w-full p-8 shadow-xl"  style={{backgroundColor: 'rgba(236, 237, 238, 0.8)',border: '2px solid rgba(197, 195, 195, 0.2)'}}>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Cancel Booking</h2>

      <p className="text-gray-600 mb-6 text-sm">
        Are you sure you want to cancel this booking? This action cannot be undone.
      </p>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-1000 mb-2 block">
          Cancellation Reason (Optional)
        </label>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Tell us why you're cancelling..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm bg-white"
          rows="3"
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 py-2"
          onClick={() => {
            setShowCancelConfirm(false);
            setCancellingBookingId(null);
            setCancelReason('');
          }}
        >
          Keep Booking
        </Button>
        <Button
          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-black border border-red-300"
          onClick={confirmCancelBooking}
        >
          Confirm Cancel
        </Button>
      </div>
    </div>
  </div>
  
)}

      </div>
    </div>
    
  );
}
