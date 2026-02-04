import { Search, MapPin, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';

export function Hero({ onNavigate }) {
  const [leaving, setLeaving] = useState('');
  const [going, setGoing] = useState('');
  const [date, setDate] = useState('');
  const [leavingSuggestions, setLeavingSuggestions] = useState([]);
  const [goingSuggestions, setGoingSuggestions] = useState([]);
  const [showLeavingDropdown, setShowLeavingDropdown] = useState(false);
  const [showGoingDropdown, setShowGoingDropdown] = useState(false);
  const [selectedLeaving, setSelectedLeaving] = useState(null);
  const [selectedGoing, setSelectedGoing] = useState(null);

  // Call your backend endpoint that proxies Map My India API
  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:9090/api/places?address=${encodeURIComponent(query)}`);
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

  const handleSearch = () => {
    if (!leaving.trim()) {
      alert('Please select a departure location');
      return;
    }
    if (!going.trim()) {
      alert('Please select a destination');
      return;
    }
    if (!date) {
      alert('Please select a date');
      return;
    }

    // Navigate to search results with search parameters
    onNavigate('search', {
      leaving,
      going,
      date
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 text-gray-900">
            Travel Together, Save Together
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share rides with verified drivers going your way. Safe, affordable, and eco-friendly travel.
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Leaving from */}
            <div className="relative">
  {/* Input + Icon */}
  <div className="flex items-center h-11 pl-3 bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
    <input
      value={leaving}
      onChange={e => {
        setLeaving(e.target.value);
        fetchSuggestions(e.target.value, setLeavingSuggestions);
        setShowLeavingDropdown(true);
        setSelectedLeaving(null);
      }}
      onBlur={() => setTimeout(() => setShowLeavingDropdown(false), 200)}
      onFocus={() => leavingSuggestions.length > 0 && setShowLeavingDropdown(true)}
      placeholder="Leaving from..."
      className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
      autoComplete="off"
    />
  </div>

  {/* Dropdown */}
  {showLeavingDropdown && leavingSuggestions.length > 0 && (
    <div
      className="absolute left-0 top-full mt-1 z-50 w-full bg-white border border-sky-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      style={{backgroundColor: '#fff'}}
    >
      {leavingSuggestions.map((s, i) => (
        <div
          key={i}
          className="px-4 py-2 cursor-pointer text-sm flex justify-between border-b border-gray-100 last:border-b-0 text-sky-900 bg-white hover:bg-sky-100"
          style={{backgroundColor: '#fff'}}
          onMouseDown={() => {
            setLeaving(s.placeName);
            setSelectedLeaving(s);
            setShowLeavingDropdown(false);
          }}
        >
          <span>{s.placeName}</span>
          <span className="text-gray-400 ml-2">{s.state}</span>
        </div>
      ))}
    </div>
  )}
</div>
            {/* Going to */}
            <div className="relative">
  {/* Input + Icon */}
  <div className="flex items-center h-11 pl-3 bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
    <input
      value={going}
      onChange={e => {
        setGoing(e.target.value);
        fetchSuggestions(e.target.value, setGoingSuggestions);
        setShowGoingDropdown(true);
        setSelectedGoing(null);
      }}
      onBlur={() => setTimeout(() => setShowGoingDropdown(false), 200)}
      onFocus={() => goingSuggestions.length > 0 && setShowGoingDropdown(true)}
      placeholder="Going to..."
      className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
      autoComplete="off"
    />
  </div>

  {/* Dropdown */}
  {showGoingDropdown && goingSuggestions.length > 0 && (
    <div
      className="absolute left-0 top-full mt-1 z-50 w-full bg-white border border-sky-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      style={{backgroundColor: '#fff'}}
    >
      {goingSuggestions.map((s, i) => (
        <div
          key={i}
          className="px-4 py-2 cursor-pointer text-sm flex justify-between border-b border-gray-100 last:border-b-0 text-sky-900 bg-white hover:bg-sky-100"
          style={{backgroundColor: '#fff'}}
          onMouseDown={() => {
            setGoing(s.placeName);
            setSelectedGoing(s);
            setShowGoingDropdown(false);
          }}
        >
          <span>{s.placeName}</span>
          <span className="text-gray-400 ml-2">{s.state}</span>
        </div>
      ))}
    </div>
  )}
</div>
            {/* Date */}
            <div className="flex items-center h-11 pl-3 bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
              <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="When?"
                className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
              />
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={handleSearch}>
            <Search className="h-5 w-5 mr-2" />
            Search Rides
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-2 text-blue-600">2M+</div>
            <div className="text-gray-600">Trusted Drivers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2 text-blue-600">50+</div>
            <div className="text-gray-600">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2 text-blue-600">30M+</div>
            <div className="text-gray-600">Rides Shared</div>
          </div>
        </div>
      </div>
    </div>
  );
}
