import { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TripCard } from './components/TripCard';
import { FilterSection } from './components/FilterSection';
import { BookingDialog } from './components/BookingDialog';
import { getAllRides, getDriverImages, transformRideResponse } from './api/rideApi';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { toast } from 'sonner';

export default function App() {
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('departure');
  const [driverImages, setDriverImages] = useState({});
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

  // Fetch trips from API
  const fetchTrips = useCallback(async (imagesToUse = {}) => {
    setLoadingTrips(true);
    console.log(`imagesToUse in fetchTrips:`, imagesToUse);
    try {
      const response = await getAllRides();
      console.log('Fetched rides, using images:', imagesToUse);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform backend response to frontend format with driver images
        const transformedTrips = response.data.map(ride => 
          transformRideResponse(ride, imagesToUse)
        );
        setTrips(transformedTrips);
        console.log('Using direct data array with images:', imagesToUse);
        console.log('Transformed trips:', transformedTrips);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Using nested data array with images:', imagesToUse);
        const transformedTrips = response.data.data.map(ride =>
          console.log(imagesToUse),
          transformRideResponse(ride, imagesToUse)
        );
        console.log(`images ${imagesToUse}`)
        setTrips(transformedTrips);
      } else {
        console.error('Unexpected API response format:', response.data);
        setTrips([]);
      }
      console.log('Trips state updated:', trips);
      
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
      console.log('Images map fetched during initialization:', imagesMap);
      // Then fetch trips with the images
      await fetchTrips(imagesMap);
    };
    
    initializeApp();
  }, []);

  // Wrapper function to refetch trips with current driver images
  const refetchTripsWithImages = useCallback(async () => {
    console.log('Refetching trips with current driver images:', driverImages);
    await fetchTrips(driverImages);
  }, [driverImages, fetchTrips]);

  const filteredAndSortedTrips = useMemo(() => {
    let filtered = trips.filter((trip) => {
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
  }, [filters, sortBy, trips]);

  const handleBookTrip = (trip) => {
    setSelectedTrip(trip);
    setBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingOpen(false);
    setSelectedTrip(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />

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
                  <TripCard key={trip.id} trip={trip} onBook={handleBookTrip} />
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
    </div>
  );
}
