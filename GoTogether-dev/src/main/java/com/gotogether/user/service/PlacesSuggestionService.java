package com.gotogether.user.service;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.gotogether.user.dto.PlacesSuggestionDTO;

@Service
public class PlacesSuggestionService {
    
    private final List<PlacesSuggestionDTO> allPlaces;
    
    public PlacesSuggestionService() {
        this.allPlaces = initializePlaces();
    }
    
    /**
     * Get places by type - P for cities starting with P, C for tourist attractions, etc.
     * @param type - Can be a single letter, partial name, or full type
     * @return List of matching places
     */
    public List<PlacesSuggestionDTO> getSuggestedPlacesByType(String type) {
        if (type == null || type.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        String searchTerm = type.trim().toUpperCase();
        
        return allPlaces.stream()
            .filter(place -> {
                // Match by starting letter (e.g., 'P' for Pune, Pimpri, etc.)
                if (searchTerm.length() == 1) {
                    return place.getPlaceName().toUpperCase().startsWith(searchTerm);
                }
                // Match by place name (partial or full)
                else if (place.getPlaceName().toUpperCase().contains(searchTerm)) {
                    return true;
                }
                // Match by region
                else if (place.getRegion() != null && place.getRegion().toUpperCase().contains(searchTerm)) {
                    return true;
                }
                // Match by type
                else if (place.getType().toUpperCase().contains(searchTerm)) {
                    return true;
                }
                return false;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get all places
     */
    public List<PlacesSuggestionDTO> getAllPlaces() {
        return new ArrayList<>(allPlaces);
    }
    
    /**
     * Get places by state
     */
    public List<PlacesSuggestionDTO> getPlacesByState(String state) {
        return allPlaces.stream()
            .filter(place -> place.getState().equalsIgnoreCase(state))
            .collect(Collectors.toList());
    }
    
    /**
     * Get places by exact type
     */
    public List<PlacesSuggestionDTO> getPlacesByExactType(String type) {
        return allPlaces.stream()
            .filter(place -> place.getType().equalsIgnoreCase(type))
            .collect(Collectors.toList());
    }
    
    /**
     * Initialize all Indian places with their data
     */
    private List<PlacesSuggestionDTO> initializePlaces() {
        List<PlacesSuggestionDTO> places = new ArrayList<>();
        
        // Maharashtra
        places.add(new PlacesSuggestionDTO(1L, "Pune", "Maharashtra", "Deccan", "City", 18.5204, 73.8567, "Technology hub and educational center"));
        places.add(new PlacesSuggestionDTO(2L, "Pimpri-Chinchwad", "Maharashtra", "Near Pune", "City", 18.6298, 73.7997, "Industrial city near Pune"));
        places.add(new PlacesSuggestionDTO(3L, "Mumbai", "Maharashtra", "Coastal", "Metropolis", 19.0760, 72.8777, "Financial capital of India"));
        places.add(new PlacesSuggestionDTO(4L, "Nagpur", "Maharashtra", "Central", "City", 21.1458, 79.0882, "Orange city of India"));
        places.add(new PlacesSuggestionDTO(5L, "Aurangabad", "Maharashtra", "Marathwada", "City", 19.8762, 75.3433, "Gateway to Ajanta and Ellora caves"));
        places.add(new PlacesSuggestionDTO(6L, "Nashik", "Maharashtra", "North", "City", 19.9975, 73.7898, "Wine capital of India"));
        places.add(new PlacesSuggestionDTO(7L, "Kolhapur", "Maharashtra", "South", "City", 16.7050, 73.7321, "Historical city known for silk"));
        places.add(new PlacesSuggestionDTO(8L, "Amravati", "Maharashtra", "Vidarbha", "City", 20.9517, 77.7597, "City of temples"));
        
        // Karnataka
        places.add(new PlacesSuggestionDTO(9L, "Bangalore", "Karnataka", "South", "Metropolis", 12.9716, 77.5946, "IT capital of India"));
        places.add(new PlacesSuggestionDTO(10L, "Mysore", "Karnataka", "South", "City", 12.2958, 76.6394, "City of palaces"));
        places.add(new PlacesSuggestionDTO(11L, "Mangalore", "Karnataka", "Coastal", "City", 12.8658, 74.8455, "Coffee port city"));
        places.add(new PlacesSuggestionDTO(12L, "Belgaum", "Karnataka", "North", "City", 15.8497, 74.4977, "Historic city"));
        places.add(new PlacesSuggestionDTO(13L, "Hubli", "Karnataka", "North", "City", 15.3647, 75.1240, "Twin city with Dharwad"));
        places.add(new PlacesSuggestionDTO(14L, "Davangere", "Karnataka", "Central", "City", 14.4667, 75.9167, "City of spices"));
        places.add(new PlacesSuggestionDTO(15L, "Tumkur", "Karnataka", "Central", "City", 13.2167, 77.1167, "Silk city"));
        
        // Tamil Nadu
        places.add(new PlacesSuggestionDTO(16L, "Chennai", "Tamil Nadu", "Coastal", "Metropolis", 13.0827, 80.2707, "Capital of Tamil Nadu"));
        places.add(new PlacesSuggestionDTO(17L, "Coimbatore", "Tamil Nadu", "South", "City", 11.0081, 76.9069, "Textile hub of India"));
        places.add(new PlacesSuggestionDTO(18L, "Madurai", "Tamil Nadu", "Central", "City", 9.9252, 78.1198, "Temple city"));
        places.add(new PlacesSuggestionDTO(19L, "Tiruppur", "Tamil Nadu", "South", "City", 11.1087, 77.3411, "Manchester of South India"));
        places.add(new PlacesSuggestionDTO(20L, "Erode", "Tamil Nadu", "Central", "City", 11.3919, 77.7172, "Manchester of Tamil Nadu"));
        places.add(new PlacesSuggestionDTO(21L, "Kanyakumari", "Tamil Nadu", "Coastal", "Town", 8.0883, 77.5385, "Southernmost tip of India"));
        places.add(new PlacesSuggestionDTO(22L, "Ooty", "Tamil Nadu", "Mountain", "Hill Station", 11.4102, 76.6955, "Queen of hill stations"));
        
        // Telangana
        places.add(new PlacesSuggestionDTO(23L, "Hyderabad", "Telangana", "Central", "Metropolis", 17.3850, 78.4867, "Pearl city of India"));
        places.add(new PlacesSuggestionDTO(24L, "Secunderabad", "Telangana", "Central", "City", 17.3700, 78.5050, "Twin city of Hyderabad"));
        places.add(new PlacesSuggestionDTO(25L, "Warangal", "Telangana", "North", "City", 17.9689, 79.5941, "Historic city"));
        places.add(new PlacesSuggestionDTO(26L, "Nizamabad", "Telangana", "East", "City", 19.2727, 78.1221, "Blue tile city"));
        
        // Andhra Pradesh
        places.add(new PlacesSuggestionDTO(27L, "Visakhapatnam", "Andhra Pradesh", "Coastal", "City", 17.6869, 83.2185, "Ship-building city"));
        places.add(new PlacesSuggestionDTO(28L, "Vijayawada", "Andhra Pradesh", "Central", "City", 16.5062, 80.6480, "City of victory"));
        places.add(new PlacesSuggestionDTO(29L, "Tirupati", "Andhra Pradesh", "South", "City", 13.1886, 79.8260, "Temple city"));
        places.add(new PlacesSuggestionDTO(30L, "Vishakapatnam", "Andhra Pradesh", "Coastal", "City", 17.6868, 83.2185, "Steel city"));
        
        // Delhi
        places.add(new PlacesSuggestionDTO(31L, "Delhi", "Delhi", "North", "Capital", 28.7041, 77.1025, "Capital of India"));
        places.add(new PlacesSuggestionDTO(32L, "New Delhi", "Delhi", "North", "City", 28.6139, 77.2090, "Administrative center"));
        places.add(new PlacesSuggestionDTO(33L, "Gurgaon", "Delhi", "South", "City", 28.4595, 77.0266, "Tech hub near Delhi"));
        places.add(new PlacesSuggestionDTO(34L, "Noida", "Delhi", "East", "City", 28.5355, 77.3910, "Sister city of Delhi"));
        
        // Uttar Pradesh
        places.add(new PlacesSuggestionDTO(35L, "Lucknow", "Uttar Pradesh", "Central", "City", 26.8467, 80.9462, "City of Nawabs"));
        places.add(new PlacesSuggestionDTO(36L, "Kanpur", "Uttar Pradesh", "Central", "City", 26.4499, 80.3319, "Manchester of India"));
        places.add(new PlacesSuggestionDTO(37L, "Agra", "Agra", "Central", "City", 27.1767, 78.0081, "Taj Mahal city"));
        places.add(new PlacesSuggestionDTO(38L, "Varanasi", "Uttar Pradesh", "East", "Holy City", 25.3201, 82.9789, "Holy city on Ganges"));
        places.add(new PlacesSuggestionDTO(39L, "Mathura", "Uttar Pradesh", "Central", "Holy City", 27.4924, 77.6737, "Krishna birthplace"));
        places.add(new PlacesSuggestionDTO(40L, "Ghaziabad", "Uttar Pradesh", "North", "City", 28.6692, 77.4538, "Gateway to UP"));
        
        // Bihar
        places.add(new PlacesSuggestionDTO(41L, "Patna", "Bihar", "Central", "City", 25.5941, 85.1376, "Oldest city in world"));
        places.add(new PlacesSuggestionDTO(42L, "Gaya", "Bihar", "South", "City", 24.7955, 85.0032, "Religious city"));
        places.add(new PlacesSuggestionDTO(43L, "Bodh Gaya", "Bihar", "South", "Holy Site", 24.4972, 84.9863, "Buddha's enlightenment place"));
        
        // West Bengal
        places.add(new PlacesSuggestionDTO(44L, "Kolkata", "West Bengal", "Coastal", "Metropolis", 22.5726, 88.3639, "City of joy"));
        places.add(new PlacesSuggestionDTO(45L, "Darjeeling", "West Bengal", "North", "Hill Station", 27.0410, 88.2663, "Queen of hills"));
        places.add(new PlacesSuggestionDTO(46L, "Siliguri", "West Bengal", "North", "City", 26.7271, 88.3953, "Gateway to North East"));
        places.add(new PlacesSuggestionDTO(47L, "Asansol", "West Bengal", "Central", "City", 23.6840, 86.9640, "Industrial city"));
        
        // Gujarat
        places.add(new PlacesSuggestionDTO(48L, "Ahmedabad", "Gujarat", "Central", "City", 23.0225, 72.5714, "Manchester of East"));
        places.add(new PlacesSuggestionDTO(49L, "Surat", "Gujarat", "South", "City", 21.1702, 72.8311, "Diamond city"));
        places.add(new PlacesSuggestionDTO(50L, "Vadodara", "Gujarat", "Central", "City", 22.3072, 73.1812, "Baroda city"));
        places.add(new PlacesSuggestionDTO(51L, "Rajkot", "Gujarat", "West", "City", 22.3039, 70.8022, "Watch city"));
        places.add(new PlacesSuggestionDTO(52L, "Junagadh", "Gujarat", "South", "City", 21.5230, 70.4624, "Historic city"));
        
        // Rajasthan
        places.add(new PlacesSuggestionDTO(53L, "Jaipur", "Rajasthan", "Central", "City", 26.9124, 75.7873, "Pink city of India"));
        places.add(new PlacesSuggestionDTO(54L, "Jodhpur", "Rajasthan", "West", "City", 26.2389, 73.0243, "Blue city"));
        places.add(new PlacesSuggestionDTO(55L, "Udaipur", "Rajasthan", "South", "City", 24.5854, 73.7125, "City of lakes"));
        places.add(new PlacesSuggestionDTO(56L, "Ajmer", "Rajasthan", "Central", "City", 26.4499, 74.6399, "City of pilgrims"));
        places.add(new PlacesSuggestionDTO(57L, "Bikaner", "Rajasthan", "North", "City", 28.0229, 71.8315, "Red sand city"));
        places.add(new PlacesSuggestionDTO(58L, "Kota", "Rajasthan", "South", "City", 25.2138, 75.8648, "Education hub"));
        places.add(new PlacesSuggestionDTO(59L, "Pushkar", "Rajasthan", "Central", "Town", 26.4894, 74.5511, "Holy town"));
        
        // Madhya Pradesh
        places.add(new PlacesSuggestionDTO(60L, "Indore", "Madhya Pradesh", "West", "City", 22.7196, 75.8577, "Holkar city"));
        places.add(new PlacesSuggestionDTO(61L, "Bhopal", "Madhya Pradesh", "Central", "City", 23.1815, 79.9864, "City of lakes"));
        places.add(new PlacesSuggestionDTO(62L, "Gwalior", "Madhya Pradesh", "North", "City", 26.2183, 78.1667, "City of forts"));
        places.add(new PlacesSuggestionDTO(63L, "Jabalpur", "Madhya Pradesh", "East", "City", 23.1815, 79.9864, "Marble city"));
        places.add(new PlacesSuggestionDTO(64L, "Khajuraho", "Madhya Pradesh", "Central", "Town", 24.8317, 79.9864, "Temple town"));
        
        // Punjab
        places.add(new PlacesSuggestionDTO(65L, "Amritsar", "Punjab", "North", "City", 31.6340, 74.8711, "Golden temple city"));
        places.add(new PlacesSuggestionDTO(66L, "Ludhiana", "Punjab", "North", "City", 30.9010, 75.8573, "Manchester of India"));
        places.add(new PlacesSuggestionDTO(67L, "Chandigarh", "Chandigarh", "North", "Union Territory", 30.7333, 76.7794, "Planned city"));
        places.add(new PlacesSuggestionDTO(68L, "Jalandhar", "Punjab", "North", "City", 31.7271, 75.5761, "Sports city"));
        places.add(new PlacesSuggestionDTO(69L, "Patiala", "Punjab", "North", "City", 30.3398, 76.3869, "Royal city"));
        
        // Himachal Pradesh
        places.add(new PlacesSuggestionDTO(70L, "Shimla", "Himachal Pradesh", "Mountain", "Hill Station", 31.7775, 77.1073, "Queen of hill stations"));
        places.add(new PlacesSuggestionDTO(71L, "Manali", "Himachal Pradesh", "Mountain", "Hill Station", 32.2432, 77.1892, "Honeymoon capital"));
        places.add(new PlacesSuggestionDTO(72L, "Dharamshala", "Himachal Pradesh", "Mountain", "Hill Station", 32.2206, 76.3256, "Kangra valley gem"));
        places.add(new PlacesSuggestionDTO(73L, "Mandi", "Himachal Pradesh", "Mountain", "Town", 31.5909, 77.1001, "Town of gods"));
        
        // Uttarakhand
        places.add(new PlacesSuggestionDTO(74L, "Dehradun", "Uttarakhand", "Mountain", "City", 30.3165, 78.0322, "Land of gods"));
        places.add(new PlacesSuggestionDTO(75L, "Mussoorie", "Uttarakhand", "Mountain", "Hill Station", 30.4637, 78.0733, "Queen of mountains"));
        places.add(new PlacesSuggestionDTO(76L, "Rishikesh", "Uttarakhand", "Mountain", "Holy City", 30.0888, 78.2671, "Yoga capital"));
        places.add(new PlacesSuggestionDTO(77L, "Nainital", "Uttarakhand", "Mountain", "Hill Station", 29.3919, 79.4504, "Lake town"));
        
        // Kerala
        places.add(new PlacesSuggestionDTO(78L, "Kochi", "Kerala", "Coastal", "City", 9.9312, 76.2673, "Queen of Arabian Sea"));
        places.add(new PlacesSuggestionDTO(79L, "Thiruvananthapuram", "Kerala", "Coastal", "City", 8.5241, 76.9366, "Evergreen city"));
        places.add(new PlacesSuggestionDTO(80L, "Kozhikode", "Kerala", "Coastal", "City", 11.2588, 75.7804, "Spice city"));
        places.add(new PlacesSuggestionDTO(81L, "Alleppey", "Kerala", "Coastal", "Town", 9.4981, 76.3388, "Venice of East"));
        places.add(new PlacesSuggestionDTO(82L, "Munnar", "Kerala", "Mountain", "Hill Station", 10.5892, 77.0595, "Tea garden town"));
        
        // Goa
        places.add(new PlacesSuggestionDTO(83L, "Panaji", "Goa", "Coastal", "City", 15.4909, 73.8278, "Capital of Goa"));
        places.add(new PlacesSuggestionDTO(84L, "Margao", "Goa", "Coastal", "City", 15.2794, 73.9342, "South Goa hub"));
        places.add(new PlacesSuggestionDTO(85L, "Ponda", "Goa", "Coastal", "City", 15.3956, 73.9666, "Spice city"));
        
        // Haryana
        places.add(new PlacesSuggestionDTO(86L, "Faridabad", "Haryana", "North", "City", 28.4089, 77.3178, "Industrial city"));
        places.add(new PlacesSuggestionDTO(87L, "Hisar", "Haryana", "North", "City", 29.1469, 75.7237, "City of sports"));
        places.add(new PlacesSuggestionDTO(88L, "Rohtak", "Haryana", "North", "City", 28.8996, 77.0569, "Business hub"));
        
        // Jharkhand
        places.add(new PlacesSuggestionDTO(89L, "Ranchi", "Jharkhand", "Central", "City", 23.3441, 85.3096, "City of waterfalls"));
        places.add(new PlacesSuggestionDTO(90L, "Jamshedpur", "Jharkhand", "East", "City", 22.8046, 86.1558, "Steel city"));
        places.add(new PlacesSuggestionDTO(91L, "Dhanbad", "Jharkhand", "East", "City", 23.7957, 86.4304, "Coal capital"));
        
        // Odisha
        places.add(new PlacesSuggestionDTO(92L, "Bhubaneswar", "Odisha", "Coastal", "City", 20.2961, 85.8245, "Temple city"));
        places.add(new PlacesSuggestionDTO(93L, "Cuttack", "Odisha", "Coastal", "City", 20.4625, 85.8830, "Silver city"));
        places.add(new PlacesSuggestionDTO(94L, "Puri", "Odisha", "Coastal", "City", 19.8136, 85.8349, "Jagannath temple city"));
        
        // Assam
        places.add(new PlacesSuggestionDTO(95L, "Guwahati", "Assam", "East", "City", 26.1445, 91.7362, "Gateway to NE India"));
        places.add(new PlacesSuggestionDTO(96L, "Dibrugarh", "Assam", "East", "City", 27.4728, 94.9142, "Tea city"));
        
        return places;
    }
}
