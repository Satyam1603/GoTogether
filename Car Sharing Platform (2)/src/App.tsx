import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TripCard } from './components/TripCard';
import { FilterSection } from './components/FilterSection';
import { BookingDialog } from './components/BookingDialog';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { PostRide } from './components/PostRide';
import { OfferRide } from './components/OfferRide';
import { UserProfile } from './components/UserProfile';
import { MyBookings } from './components/MyBookings';
import { getAllRides, getDriverImages, transformRideResponse, searchRides } from './api/rideApi';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { getVehicles } from './api/vehicleApi';

export default function App() {
  const { logout, user: authUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [vehicles, setVehicles] = useState([]);
  const user = authUser;  // Use user from AuthContext instead of local state
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('departure');
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [driverImages, setDriverImages] = useState({});
  const [searchParams, setSearchParams] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    instantBooking: false,
    verifiedOnly: false,
  });

  // Fetch driver images
  const fetchDriverImages = useCallback(async () => {
    try {
      const response = await getDriverImages();
      if (response.data && Array.isArray(response.data)) {
        // Convert array to map for quick lookup: { driverId: { id, imageBase64 } }
        const imagesMap = {};
        response.data.forEach(item => {
          imagesMap[item.id] = item;
        });
        setDriverImages(imagesMap);
        console.log('Driver images loaded:', imagesMap);
        return imagesMap; // Return the map for immediate use
      }
    } catch (error) {
      console.error('Error fetching driver images:', error);
      return {};
    }
  }, []);
  const fetchVehhicles = useCallback(async () => {
    try {
       const response = await getVehicles();
        console.log('Vehicles fetched:', response.data);
        setVehicles(response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
  }, []);
  // const fetchDriverImages = async () => {
  //     const response = await getVehicles();
  //     if (response.data && Array.isArray(response.data)) {
  //       // Convert array to map for quick lookup: { driverId: { id, imageBase64 } }

  //       const imagesMap = {};
  //       response.data.forEach(item => {
  //         imagesMap[item.id] = item;
  //       });

  // Fetch trips from API on component mount
  const fetchTrips = useCallback(async (imagesToUse = {}, vehiclesToUse = {}) => {
    setLoadingTrips(true);
    console.log(`imagesToUse in fetchTrips:`, imagesToUse);
    try {
      const response = await getAllRides();
      console.log('Raw API Response:', response.data);
      console.log('Fetched rides, using images:', imagesToUse);
      
      let ridesData = [];
      
      // Handle different response formats
      console.log("Response Data Type: " + typeof response.data);
      if (Array.isArray(response.data)) {
        ridesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        ridesData = response.data.data;
      } else if (response.data?.rides && Array.isArray(response.data.rides)) {
        ridesData = response.data.rides;
      } else {
        console.error('Unexpected API response format:', response.data);
        toast.error('Invalid response format from server');
        setTrips([]);
        return;
      }
      
      // Transform backend response to frontend format with driver images
      const transformedTrips = ridesData.map(ride => {
        try {
            console.log('VEHICLES IN TRANSFORM RIDE RESPONSE:', vehiclesToUse);
            console.log('tranform ride response',transformRideResponse(ride, imagesToUse, vehiclesToUse));
          return transformRideResponse(ride, imagesToUse, vehiclesToUse);

        } catch (e) {
          console.error('Error transforming ride:', ride, e);
          return null;
        }
      }).filter(Boolean); // Remove null values
      
      console.log('Transformed Trips:', transformedTrips);
      setTrips(transformedTrips);
      
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Failed to load available rides');
      setTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  }, []);

  useEffect(() => {
    // Fetch driver images and trips on component mount
    const initializeApp = async () => {
      // Fetch images first
      const imagesMap = await fetchDriverImages();
      const vehicles = await fetchVehhicles();
      console.log('Images map fetched during initialization:', imagesMap);
      console.log('Vehicles fetched during initialization:', vehicles);
      // Then fetch trips with the images
      await fetchTrips(imagesMap,vehicles);
    };
    
    initializeApp();
  }, []);

  const filteredAndSortedTrips = useMemo(() => {
    let filtered = trips.filter((trip) => {
      // Filter by search parameters if provided
      console.log('Filtering trip:', trip, 'with searchParams:', searchParams);
      if (searchParams) {
        // Check if departure location matches (case-insensitive, partial match)
        const leavingLower = searchParams.leaving.toLowerCase();
        const tripFromLower = (trip.origin || trip.from || '').toLowerCase();
        if (!tripFromLower.includes(leavingLower) && !leavingLower.includes(tripFromLower)) {
          return false;
        }

        // Check if destination location matches (case-insensitive, partial match)
        const goingLower = searchParams.going.toLowerCase();
        const tripToLower = (trip.destination || trip.to || '').toLowerCase();
        if (!tripToLower.includes(goingLower) && !goingLower.includes(tripToLower)) {
          return false;
        }

        // Check if date matches
        if (searchParams.date) {
          const searchDate = new Date(searchParams.date).toDateString();
          // Try trip.date first (from search results), then fall back to trip.departureTime
          const tripDateStr = trip.date || trip.departureTime;
          const tripDate = new Date(tripDateStr).toDateString();
          if (searchDate !== tripDate) {
            return false;
          }
        }
      }

      // Filter by price
      if (
        trip.pricePerSeat < filters.priceRange[0] ||
        trip.pricePerSeat > filters.priceRange[1]
      ) {
        return false;
      }

      // Filter by verified drivers
      if (filters.verifiedOnly && !trip.driver.verified) {
        return false;
      }

      return true;
    });

    // Sort trips
    filtered.sort((a, b) => {
      if (sortBy === 'price') {
        return a.pricePerSeat - b.pricePerSeat;
      } else if (sortBy === 'departure') {
        return a.departureTime.localeCompare(b.departureTime);
      } else if (sortBy === 'duration') {
        // Simple duration comparison (assumes format like "3h 30m")
        const aDuration = parseInt(a.duration);
        const bDuration = parseInt(b.duration);
        return aDuration - bDuration;
      }
      return 0;
    });

    return filtered;
  }, [filters, sortBy, trips, searchParams]);

  // Wrapper function to refetch trips with current driver images
  const refetchTripsWithImages = useCallback(async () => {
    console.log('Refetching trips with current driver images:', driverImages);
    await fetchTrips(driverImages);
  }, [driverImages, fetchTrips]);

  // Fetch search results from API
  const fetchSearchResults = useCallback(async (source, destination, date) => {
    try {
      setLoadingTrips(true);
      setSearchParams({ leaving: source, going: destination, date });
      
      const response = await searchRides(source, destination, date);
      console.log('Search API Response:', response.data);
      
      let ridesData = [];
      if (Array.isArray(response.data)) {
        ridesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        ridesData = response.data.data;
      } else if (response.data?.rides && Array.isArray(response.data.rides)) {
        ridesData = response.data.rides;
      }

      // Transform rides with driver images
      const transformedTrips = ridesData.map(ride => {
        try {
          return transformRideResponse(ride, driverImages);
        } catch (e) {
          console.error('Error transforming ride:', ride, e);
          return null;
        }
      }).filter(Boolean);

      console.log('Search Results:', transformedTrips);
      setTrips(transformedTrips);
      
    } catch (error) {
      console.error('Error searching rides:', error);
      toast.error('Failed to search rides. Please try again.');
      setTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  }, [driverImages]);

  const handleBookTrip = (trip) => {
    setSelectedTrip(trip);
    setBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingOpen(false);
    setSelectedTrip(null);
  };

  const [profileUser, setProfileUser] = useState(null);
  const handleNavigate = (page, userDetails) => {
    setCurrentPage(page);
    if (page === 'profile' && userDetails) {
      setProfileUser(userDetails);
    }
    if (page === 'search' && userDetails) {
      // Call search API with the parameters
      fetchSearchResults(userDetails.leaving, userDetails.going, userDetails.date);
    }
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (userData) => {
    // User is already authenticated in AuthContext, just navigate
    setCurrentPage('home');
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const handleSignUpSuccess = (userData) => {
    // User is already registered in AuthContext, just navigate
    setCurrentPage('home');
    toast.success(`Account created successfully! Welcome, ${userData.name}!`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleViewProfile = (userId) => {
    setCurrentPage('profile');
    window.scrollTo(0, 0);
  };

  // Render login page
  if (currentPage === 'login') {
    return <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
  }

  // Render signup page
  if (currentPage === 'signup') {
    return <SignUp onNavigate={handleNavigate} onSignUpSuccess={handleSignUpSuccess} />;
  }

  // Render post ride page
  if (currentPage === 'postride') {
    return (
      <>
        <PostRide onNavigate={handleNavigate} user={user} onRidePosted={refetchTripsWithImages} />
        <Toaster />
      </>
    );
  }

  // Render offer ride page
  if (currentPage === 'offerride') {
    return (
      <>
        <OfferRide onNavigate={handleNavigate} user={user} />
        <Toaster />
      </>
    );
  }

  // Render user profile page
  if (currentPage === 'profile') {
    return (
      <>
        <UserProfile 
          userId={profileUser?.id || user?.id} 
          user1={profileUser || user}
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('home')}
        />
        <Toaster />
      </>
    );
  }

  // Render my bookings page
  if (currentPage === 'mybookings') {
    return (
      <>
        <MyBookings 
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('home')}
        />
        <Toaster />
      </>
    );
  }

  // Render home page
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={handleNavigate} user={user} onLogout={handleLogout} />
      <Hero onNavigate={handleNavigate} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl mb-2">Available Rides</h2>
              <p className="text-gray-600">
                {filteredAndSortedTrips.length} ride{filteredAndSortedTrips.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Sort Tabs */}
          <Tabs value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <TabsList>
              <TabsTrigger value="departure">Earliest Departure</TabsTrigger>
              <TabsTrigger value="price">Lowest Price</TabsTrigger>
              <TabsTrigger value="duration">Shortest Duration</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block">
            <FilterSection filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Filters - Mobile */}
          {mobileFiltersOpen && (
            <div className="lg:hidden col-span-1 mb-8">
              <FilterSection filters={filters} onFilterChange={setFilters} />
            </div>
          )}

          {/* Trips List */}
          <div className="lg:col-span-3">
            {loadingTrips ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading available rides...</span>
                </div>
              </div>
            ) : filteredAndSortedTrips.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">
                  No rides match your filters
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      priceRange: [0, 100],
                      instantBooking: false,
                      verifiedOnly: false,
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedTrips.map((trip) => (
                  <TripCard 
                    key={trip.id} 
                    trip={trip} 
                    onBook={handleBookTrip}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        trip={selectedTrip}
        open={bookingOpen}
        onClose={handleCloseBooking}
        onBookingSuccess={refetchTripsWithImages}
      />

      {/* Toaster */}
      <Toaster />
    </div>
  );
}