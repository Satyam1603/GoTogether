import { useState, useEffect } from 'react';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Car, 
  CheckCircle, 
  Mail, 
  Phone, 
  Shield,
  MessageCircle,
  ThumbsUp,
  Award,
  Users,
  Navigation,
  Music,
  Volume2,
  Cigarette,
  PawPrint,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Upload,
  Camera,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useAuth } from '../context/AuthContext';
import * as userService from '../Service/userservice';
import * as vehicleApi from '../api/vehicleApi';
import { rideService } from '../Service/rideservice';

export function UserProfile({ userId, user1, onNavigate, onBack }) {
  const [activeTab, setActiveTab] = useState('about');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const { user: authUser, updateProfile } = useAuth();
  const preferences = JSON.parse(user1?.preferences || '{}');
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    driverId: user1?.id || userId,
    make: '',
    model: '',
    plateNumber: '',
    color: '',
    capacity: 4
  });
  const [editData, setEditData] = useState({
    firstName: user1?.firstName || '',
    lastName: user1?.lastName || '',
    bio: user1?.bio || '',
    location: user1?.location || 'Indore MP',
    phoneNumber: user1?.phoneNumber || '',
    languages: user1?.languages || ['English', 'Spanish'],
    preferences: {
      chattiness: preferences?.chattiness || 'I love to chat',
      music: preferences?.music || 'Silence is golden',
      smoking: preferences?.smoking || 'No smoking',
      pets: preferences?.pets || 'Pets allowed'
    }
  });

  // State for My Rides feature
  const [myRides, setMyRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(false);
  const [editingRideId, setEditingRideId] = useState(null);
  const [editingRideData, setEditingRideData] = useState({
    source: '',
    destination: '',
    date: '',
    departureTime: '',
    availableSeats: '',
    farePerSeat: '',
    description: ''
  });

  console.log('UserProfile props:', { userId, user1 });

  // Check if viewing own profile
  const isOwner = authUser?.id === (user1?.id || userId);

  // Fetch vehicles when component mounts or user changes
  useEffect(() => {
    if (isOwner && (user1?.id || userId)) {
      fetchVehicles();
      fetchMyRides();
    }
  }, [user1?.id, userId, isOwner]);
  
  // Format date to readable format like "January 2026"
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch (e) {
      return dateString;
    }
  };

  // Convert base64 image to data URL
  const getImageUrl = () => {
    // Use preview image if available (during edit or after upload)
    if (previewImage) {
      return previewImage;
    }
    if (user1?.imageUrl) {
      // If image is base64, convert to data URL
      return user1.imageUrl;
    }
    // Fallback avatar
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user1?.firstName + ' ' + user1?.lastName) + '&background=random&size=256';
  };

  // Handle field change in edit mode
  const handleFieldChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle preference change
  const handlePreferenceChange = (preference, value) => {
    setEditData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: value
      }
    }));
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatePayload = {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phoneNumber,
        preferences: JSON.stringify(editData.preferences)
      };

      const result = await updateProfile(userId || user1?.id, updatePayload);
      if (result.success) {
        setIsEditMode(false);
        // Show success message
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditData({
      firstName: user1?.firstName || '',
      lastName: user1?.lastName || '',
      bio: user1?.bio || '',
      location: user1?.location || 'Indore MP',
      phoneNumber: user1?.phoneNumber || '',
      languages: user1?.languages || ['English', 'Spanish'],
      preferences: {
        chattiness: user1?.preferences?.chattiness || 'I love to chat',
        music: user1?.preferences?.music || 'Silence is golden',
        smoking: user1?.preferences?.smoking || 'No smoking',
        pets: user1?.preferences?.pets || 'Pets allowed'
      }
    });
    setPreviewImage(null);
    setIsEditMode(false);
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result);
    };
    reader.readAsDataURL(file);

    // Upload to S3
    setIsUploadingImage(true);
    try {
      const response = await userService.uploadProfileImage(userId || user1?.id, file);
      if (response.data.imageUrl) {
        // Update preview with the actual S3 URL
        setPreviewImage(response.data.imageUrl);
        alert('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setPreviewImage(null);
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  // Use passed user details if available, otherwise fallback to mock
  const user =  {
    id: userId || 1,
    name: editData.firstName || user1?.firstName,
    avatar: getImageUrl(),
   
    lastUpdated: formatDate(user1?.lastUpdated) || 'March 2024',
    location: editData.location || 'Indore MP',
    rating: 4.9,
    totalReviews: 127,
    totalRides: 145,
    responseRate: '95%',
    responseTime: 'Within an hour',
    verified: user1?.emailVerified || true,
    verifications: {
      email: user1?.emailVerified || false,
      phone: user1?.phoneVerified || false,
      government_id: true,
      facebook: true
    },
    bio: editData.bio || "I'm a friendly traveler who loves meeting new people on the road! I commute between SF and LA regularly for work. I'm a safe driver with a clean record and enjoy good conversations during trips.",
    languages: editData.languages || ['English', 'Spanish'],
    preferences: editData.preferences || {
      chattiness: 'I love to chat',
      music: 'Silence is golden',
      smoking: 'No smoking',
      pets: 'Pets allowed'
    },
    vehicle: {
      make: 'Tesla',
      model: 'Model 3',
      year: 2022,
      color: 'White',
      plate: 'ABC1234'
    },
    stats: {
      ridesAsDriver: 89,
      ridesAsPassenger: 56,
      citiesVisited: 24,
      co2Saved: '456 kg'
    },
    reviews: [
      {
        id: 1,
        reviewer: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Great driver! Very punctual and friendly. The car was clean and comfortable. Would definitely ride with Sarah again.',
        trip: 'San Francisco → Los Angeles'
      },
      {
        id: 2,
        reviewer: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        rating: 5,
        date: '1 month ago',
        comment: 'Perfect trip! Sarah was an excellent conversationalist and made the long drive enjoyable. Highly recommend!',
        trip: 'Los Angeles → San Diego'
      },
      {
        id: 3,
        reviewer: 'David Park',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        rating: 5,
        date: '2 months ago',
        comment: 'Safe driver, great music taste, and very accommodating with stops. Would ride again!',
        trip: 'San Francisco → Sacramento'
      },
      {
        id: 4,
        reviewer: 'Lisa Anderson',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
        rating: 4,
        date: '3 months ago',
        comment: 'Nice ride overall. Sarah was friendly and the car was very comfortable. Arrived on time.',
        trip: 'Oakland → San Jose'
      }
    ]
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Vehicle management functions
  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await vehicleApi.getVehiclesByDriver(user1?.id || userId);
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      alert('Failed to load vehicles');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.make || !newVehicle.model || !newVehicle.plateNumber) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await vehicleApi.addVehicle(newVehicle);
      setVehicles([...vehicles, response.data]);
      setNewVehicle({
        driverId: user1?.id || userId,
        make: '',
        model: '',
        plateNumber: '',
        color: '',
        capacity: 4
      });
      setShowAddVehicle(false);
      alert('Vehicle added successfully!');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Failed to add vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      await vehicleApi.deleteVehicle(vehicleId);
      setVehicles(vehicles.filter(v => v.vehicle_Id !== vehicleId));
      alert('Vehicle deleted successfully!');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle');
    }
  };

  // Ride management functions
  const fetchMyRides = async () => {
    try {
      setLoadingRides(true);
      const result = await rideService.getDriverRides(user1?.id || userId);
      if (result.success) {
        setMyRides(result.data || []);
      } else {
        console.error('Failed to fetch rides:', result.error);
        setMyRides([]);
      }
    } catch (error) {
      console.error('Error fetching my rides:', error);
      setMyRides([]);
    } finally {
      setLoadingRides(false);
    }
  };

  const handleEditRide = (ride) => {
    setEditingRideId(ride.id || ride.rideId);
    setEditingRideData({
      source: ride.source || '',
      destination: ride.destination || '',
      date: ride.date || '',
      departureTime: ride.departureTime || ride.time || '',
      availableSeats: ride.availableSeats || '',
      farePerSeat: ride.farePerSeat || '',
      description: ride.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingRideId(null);
    setEditingRideData({
      source: '',
      destination: '',
      date: '',
      departureTime: '',
      availableSeats: '',
      farePerSeat: '',
      description: ''
    });
  };

  const handleUpdateRide = async () => {
    if (!editingRideData.source || !editingRideData.destination || !editingRideData.date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Combine date and time into ISO 8601 format for LocalDateTime
      const dateTimeString = editingRideData.departureTime 
        ? `${editingRideData.date}T${editingRideData.departureTime}:00`
        : `${editingRideData.date}T00:00:00`;

      const updatePayload = {
        source: editingRideData.source,
        destination: editingRideData.destination,
        date: editingRideData.date,
        departureTime: dateTimeString, // Send as ISO 8601 format: YYYY-MM-DDTHH:mm:ss
        availableSeats: parseInt(editingRideData.availableSeats),
        farePerSeat: parseFloat(editingRideData.farePerSeat),
        description: editingRideData.description
      };

      const result = await rideService.updateRideDetails(editingRideId, updatePayload);
      
      if (result.success) {
        // Update the local list
        const updatedRides = myRides.map(ride => 
          (ride.id === editingRideId || ride.rideId === editingRideId) ? { ...ride, ...updatePayload } : ride
        );
        setMyRides(updatedRides);
        handleCancelEdit();
        alert('Ride updated successfully!');
      } else {
        alert('Failed to update ride: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating ride:', error);
      alert('Error updating ride');
    }
  };

  const handleDeleteRide = async (rideId) => {
    if (!confirm('Are you sure you want to delete this ride? This action cannot be undone.')) return;

    try {
      const result = await rideService.cancelRide(rideId);
      
      if (result.success) {
        setMyRides(myRides.filter(ride => (ride.id !== rideId && ride.rideId !== rideId)));
        alert('Ride deleted successfully!');
      } else {
        alert('Failed to delete ride: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting ride:', error);
      alert('Error deleting ride');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative" style={{ width: '198px', height: '198px' }}>
  <img
    src={user.avatar}
    alt={user.name}
    className="!h-12 !w-12 rounded-full object-cover ring-1 ring-white/80 shadow-sm block"
    style={{ width: '198px', height: '198px' }}
  />
                {user.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2">
                    <CheckCircle className="h-0 w-0 text-white" />
                  </div>
                )}

                {/* Image upload button in edit mode */}
                {isEditMode && (
                  <label className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md text-blue-600 hover:bg-blue-50 cursor-pointer">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Upload status indicator */}
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl mb-2">{user.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                    <div className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50/80 hover:bg-emerald-50 border border-slate-200/50 hover:border-emerald-300 transition-all duration-300 hover:shadow-md">
  <MapPin className="h-4 w-4 text-slate-500 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
  <span className="font-semibold text-sm text-slate-700 group-hover:text-slate-900">{user.location}</span>
</div>

                    {/* <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {user.memberSince}</span>
                    </div> */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/50 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
  <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 tracking-tight">
    Last updated {formatDate(user.lastUpdated)}
  </span>
</div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl">{user.rating}</span>
                    </div>
                    <span className="text-gray-600">({user.totalReviews} reviews)</span>
                  </div>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-2">
                    {user.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  {isEditMode ? (
                    <>
                      <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        onClick={handleCancel} 
                        variant="outline" 
                        className="w-full md:w-auto"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={() => setIsEditMode(true)}
                        className="w-full md:w-auto "
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button className="w-full md:w-auto">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" className="w-full md:w-auto">
                        <Shield className="h-4 w-4 mr-2" />
                        Report User
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 pt-10 border-t border-white/30">
  {/* Total Rides */}
  <div className="group p-5 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm border border-blue-200/50 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center">
    <Car className="h-10 w-10 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform p-2" />
    <div className="text-3xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 mx-auto">
      {user.totalRides.toLocaleString()}
    </div>
    <div className="text-slate-600 text-sm font-semibold uppercase tracking-wide px-2">
      Total Rides
    </div>
  </div>

  {/* Cities Visited */}
  <div className="group p-5 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-200/50 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center">
    <Navigation className="h-10 w-10 text-purple-500 mx-auto mb-4 group-hover:scale-110 transition-transform p-2" />
    <div className="text-3xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 mx-auto">
      {user.stats.citiesVisited}
    </div>
    <div className="text-slate-600 text-sm font-semibold uppercase tracking-wide px-2">
      Cities Visited
    </div>
  </div>

  {/* Response Rate */}
  <div className="group p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-200/50 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center">
    <MessageCircle className="h-10 w-10 text-emerald-500 mx-auto mb-4 group-hover:scale-110 transition-transform p-2" />
    <div className="text-3xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 mx-auto">
      {user.responseRate}
    </div>
    <div className="text-slate-600 text-sm font-semibold uppercase tracking-wide px-2">
      Response Rate
    </div>
  </div>

  {/* CO2 Saved */}
  <div className="group p-5 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-200/50 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center">
    <Award className="h-10 w-10 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform p-2" />
    <div className="text-3xl font-bold text-slate-900 mb-3 group-hover:text-green-600 mx-auto">
      {user.stats.co2Saved}
    </div>
    <div className="text-slate-600 text-sm font-semibold uppercase tracking-wide px-2">
      CO₂ Saved
    </div>
  </div>
</div>

        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex bg-white/80 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-white/50 max-w-4xl mx-auto">
  <TabsTrigger 
    value="about" 
    className="group flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=active]:border-white/70 font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:bg-white/60"
  >
    {/* <User className="h-5 w-5 text-slate-600 group-data-[state=active]:text-slate-900" /> */}
    About
  </TabsTrigger>
  
  <TabsTrigger 
    value="reviews"
    className="group flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=active]:border-white/70 font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:bg-white/60"
  >
    <Star className="h-5 w-5 text-slate-600 group-data-[state=active]:text-yellow-500" />
    Reviews
    <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
      127
    </span>
  </TabsTrigger>
  
  <TabsTrigger 
    value="vehicle"
    className="group flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=active]:border-white/70 font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:bg-white/60"
  >
    <Car className="h-5 w-5 text-slate-600 group-data-[state=active]:text-blue-600" />
    Vehicle
  </TabsTrigger>
  
  <TabsTrigger 
    value="verification"
    className="group flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=active]:border-white/70 font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:bg-white/60"
  >
    <Shield className="h-5 w-5 text-slate-600 group-data-[state=active]:text-emerald-600" />
    Verification
  </TabsTrigger>

  {isOwner && (
    <TabsTrigger 
      value="myrides"
      className="group flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=active]:border-white/70 font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:bg-white/60"
    >
      <Navigation className="h-5 w-5 text-slate-600 group-data-[state=active]:text-purple-600" />
      My Rides
    </TabsTrigger>
  )}
</TabsList>


          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">About {user.name}</h2>
              </div>
              
              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <Input 
                      value={editData.firstName} 
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <Input 
                      value={editData.lastName} 
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      placeholder="Last Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <Input 
                      value={editData.location} 
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      placeholder="Location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <Input 
                      value={editData.phoneNumber} 
                      onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                      placeholder="Phone Number"
                      type="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <Textarea 
                      value={editData.bio} 
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              )}
            </div>

            {/* Travel Preferences */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl mb-4">Travel Preferences</h2>
              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chattiness</label>
                    <select 
                      value={editData.preferences.chattiness}
                      onChange={(e) => handlePreferenceChange('chattiness', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option>I love to chat</option>
                      <option>I prefer quiet rides</option>
                      <option>No preference</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Music</label>
                    <select 
                      value={editData.preferences.music}
                      onChange={(e) => handlePreferenceChange('music', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option>Silence is golden</option>
                      <option>I love music</option>
                      <option>Podcasts only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Smoking</label>
                    <select 
                      value={editData.preferences.smoking}
                      onChange={(e) => handlePreferenceChange('smoking', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option>No smoking</option>
                      <option>Smoking allowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pets</label>
                    <select 
                      value={editData.preferences.pets}
                      onChange={(e) => handlePreferenceChange('pets', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option>Pets allowed</option>
                      <option>No pets</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-gray-900">Chattiness</div>
                      <div className="text-gray-600">{user.preferences.chattiness}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Music className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-gray-900">Music</div>
                      <div className="text-gray-600">{user.preferences.music}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Cigarette className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-gray-900">Smoking</div>
                      <div className="text-gray-600">{user.preferences.smoking}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <PawPrint className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-gray-900">Pets</div>
                      <div className="text-gray-600">{user.preferences.pets}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Experience Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl mb-4">Experience</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="text-2xl text-blue-600">{user.stats.ridesAsDriver}</div>
                    <div className="text-gray-600">Rides as Driver</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="text-2xl text-green-600">{user.stats.ridesAsPassenger}</div>
                    <div className="text-gray-600">Rides as Passenger</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">Reviews</h2>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl">{user.rating}</span>
                  <span className="text-gray-600">({user.totalReviews} reviews)</span>
                </div>
              </div>

              <div className="space-y-6">
                {user.reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
                    <div className="flex gap-4">
                      <img
                        src={review.avatar}
                        alt={review.reviewer}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-gray-900 mb-1">{review.reviewer}</div>
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <span className="text-sm">{review.date}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm">{review.trip}</span>
                            </div>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Vehicle Tab */}
          <TabsContent value="vehicle">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl">My Vehicles</h2>
                {isOwner && !showAddVehicle && (
                  <Button 
                    onClick={() => setShowAddVehicle(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-black"
                  >
                    <Plus className="h-4 w-4 mr-2 " />
                    Add Vehicle
                  </Button>
                )}
              </div>

              {!isOwner && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-900">You are viewing {user1?.firstName}'s vehicles.</p>
                </div>
              )}

              {/* Add Vehicle Form - Only show to owner */}
              {isOwner && showAddVehicle && (
                <div className="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Add New Vehicle</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Make *</label>
                      <Input
                        value={newVehicle.make}
                        onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                        placeholder="e.g., Honda"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Model *</label>
                      <Input
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                        placeholder="e.g., City"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">License Plate *</label>
                      <Input
                        value={newVehicle.plateNumber}
                        onChange={(e) => setNewVehicle({...newVehicle, plateNumber: e.target.value})}
                        placeholder="e.g., MH-12-AB-1234"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
                      <Input
                        value={newVehicle.color}
                        onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                        placeholder="e.g., White"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Capacity</label>
                      <Input
                        type="number"
                        min="1"
                        value={newVehicle.capacity}
                        onChange={(e) => setNewVehicle({...newVehicle, capacity: parseInt(e.target.value)})}
                        placeholder="e.g., 4"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button 
                      onClick={handleAddVehicle}
                      className="bg-blue-600 hover:bg-green-700 text-white border-green-700"
                    >
                      Add Vehicle
                    </Button>
                    <Button 
                      onClick={() => setShowAddVehicle(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Vehicles List */}
              {loadingVehicles ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading vehicles...</p>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No vehicles added yet</p>
                  {!showAddVehicle && (
                    <Button 
                      onClick={() => setShowAddVehicle(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Vehicle
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.vehicle_Id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4 flex-1">
                          <div className="bg-blue-100 p-3 rounded-lg h-fit">
                            <Car className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {vehicle.make} {vehicle.model}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                              <div>
                                <span className="text-gray-600">License Plate:</span>
                                <p className="font-medium text-gray-900">{vehicle.plateNumber}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Color:</span>
                                <p className="font-medium text-gray-900">{vehicle.color}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Capacity:</span>
                                <p className="font-medium text-gray-900">{vehicle.capacity} seats</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteVehicle(vehicle.vehicle_Id)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl mb-6">Verifications</h2>
              <p className="text-gray-600 mb-6">
                Verifications help build trust in the GoTogether community.
              </p>

              <div className="space-y-4">
                <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                  user.verifications.email ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  {user.verifications.email ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                  )}
                  <div className="flex-1">
                    <div className="text-gray-900">Email Address</div>
                    <div className="text-gray-600">Verified email address</div>
                  </div>
                  {user.verifications.email && (
                    <Badge className="bg-green-600">Verified</Badge>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                  user.verifications.phone ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  {user.verifications.phone ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                  )}
                  <div className="flex-1">
                    <div className="text-gray-900">Phone Number</div>
                    <div className="text-gray-600">Verified phone number</div>
                  </div>
                  {user.verifications.phone && (
                    <Badge className="bg-green-600">Verified</Badge>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                  user.verifications.government_id ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  {user.verifications.government_id ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                  )}
                  <div className="flex-1">
                    <div className="text-gray-900">Government ID</div>
                    <div className="text-gray-600">ID verified by GoTogether</div>
                  </div>
                  {user.verifications.government_id && (
                    <Badge className="bg-green-600">Verified</Badge>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                  user.verifications.facebook ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  {user.verifications.facebook ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                  )}
                  <div className="flex-1">
                    <div className="text-gray-900">Facebook Account</div>
                    <div className="text-gray-600">Connected Facebook profile</div>
                  </div>
                  {user.verifications.facebook && (
                    <Badge className="bg-green-600">Verified</Badge>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-blue-900">
                    <div className="mb-1">Trusted Member</div>
                    <div className="text-blue-700">
                      This user has completed all verifications and has an excellent track record with GoTogether.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* My Rides Tab */}
          {isOwner && (
            <TabsContent value="myrides" className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl">My Rides</h2>
                  <Button 
                    onClick={() => onNavigate('postride')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Ride
                  </Button>
                </div>

                {loadingRides ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : myRides && myRides.length > 0 ? (
                  <div className="space-y-4">
                    {myRides.map((ride) => (
                      <div 
                        key={ride.id || ride.rideId} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {editingRideId === (ride.id || ride.rideId) ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <h3 className="text-xl font-semibold mb-4">Edit Ride</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                                <Input 
                                  value={editingRideData.source}
                                  onChange={(e) => setEditingRideData({...editingRideData, source: e.target.value})}
                                  placeholder="Source location"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                                <Input 
                                  value={editingRideData.destination}
                                  onChange={(e) => setEditingRideData({...editingRideData, destination: e.target.value})}
                                  placeholder="Destination"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <Input 
                                  type="date"
                                  value={editingRideData.date}
                                  onChange={(e) => setEditingRideData({...editingRideData, date: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time</label>
                                <Input 
                                  type="time"
                                  value={editingRideData.departureTime}
                                  onChange={(e) => setEditingRideData({...editingRideData, departureTime: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Available Seats</label>
                                <Input 
                                  type="number"
                                  value={editingRideData.availableSeats}
                                  onChange={(e) => setEditingRideData({...editingRideData, availableSeats: e.target.value})}
                                  placeholder="Number of seats"
                                  min="1"
                                  max="8"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Seat</label>
                                <Input 
                                  type="number"
                                  value={editingRideData.farePerSeat}
                                  onChange={(e) => setEditingRideData({...editingRideData, farePerSeat: e.target.value})}
                                  placeholder="Price"
                                  step="0.01"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <Textarea 
                                  value={editingRideData.description}
                                  onChange={(e) => setEditingRideData({...editingRideData, description: e.target.value})}
                                  placeholder="Any additional information about the ride"
                                  rows={3}
                                />
                              </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button 
                                onClick={handleUpdateRide}
                                className="bg-green-600 hover:bg-green-700 text-black border-green-700"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </Button>
                              <Button 
                                onClick={handleCancelEdit}
                                variant="outline"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin className="h-4 w-4 text-blue-600" />
                                  <span className="font-semibold">{ride.source} → {ride.destination}</span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {ride.departureTime}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Car className="h-4 w-4" />
                                    {ride.availableSeats} seats available
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-semibold text-green-600">₹{ride.farePerSeat}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {ride.description && (
                              <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
                                {ride.description}
                              </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t border-gray-200">
                              <Button 
                                onClick={() => handleEditRide(ride)}
                                variant="outline"
                                size="sm"
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                onClick={() => handleDeleteRide(ride.id || ride.rideId)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't posted any rides yet.</p>
                    <Button 
                      onClick={() => onNavigate('postride')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Ride
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
