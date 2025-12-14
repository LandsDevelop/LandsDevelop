import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to properties page with search query
      navigate(`/properties?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Navigate to properties page without query (show all)
      navigate('/properties');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleQuickSearch = (location: string) => {
    navigate(`/properties?q=${encodeURIComponent(location)}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search by location, locality, project name..."
            className="w-full pl-12 pr-32 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 flex items-center gap-2 font-medium"
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>
        </div>

        {/* Quick Search Suggestions */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-3">Popular locations:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Gachibowli',
              'Kondapur',
              'Banjara Hills',
              'Hitech City',
              'Madhapur',
              'Kukatpally',
              'Financial District',
              'Kokapet'
            ].map((location) => (
              <button
                key={location}
                onClick={() => handleQuickSearch(location)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-teal-100 hover:text-teal-700 transition-colors"
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <span>💡</span> Search Tips:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
          <div>• Try location names: "Gachibowli", "Kondapur"</div>
          <div>• Use landmarks: "near Hitech City"</div>
          <div>• Project names work too!</div>
          <div>• Spelling variations are okay</div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;