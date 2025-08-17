import React from 'react';
import SearchBar from './SearchBar';

const SearchPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              🎯 Smart Property Search
            </h1>
            <p className="text-lg text-teal-100 max-w-2xl mx-auto mb-6">
              Powered by Google Maps API for intelligent location matching. 
              Find properties even with spelling mistakes or partial addresses!
            </p>
            <div className="bg-teal-700 bg-opacity-50 rounded-lg p-4 max-w-3xl mx-auto">
              <h3 className="font-semibold mb-2">✨ Enhanced Search Features:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>🔍 <strong>Smart Spelling:</strong> "Kondapoor" finds "Kondapur"</div>
                <div>📍 <strong>Location Aware:</strong> Auto-suggests nearby areas</div>
                <div>🎯 <strong>Partial Matches:</strong> "Hitech" finds "Hitech City"</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your Perfect Property
            </h1>
            <p className="text-lg text-teal-100 max-w-2xl mx-auto">
              Search thousands of properties by location, development type, and more. 
              Find your dream home or investment opportunity in Hyderabad.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="py-8">
        <SearchBar />
      </div>

      {/* Quick Search Suggestions */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🌟 Try Smart Search With Popular Locations</h3>
          <p className="text-sm text-gray-600 mb-4">
            Click any location below or type with spelling variations - our Google Maps integration will find the right matches!
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'Gachibowli', 'Kondapur', 'Banjara Hills', 'Jubilee Hills', 
              'Hitech City', 'Madhapur', 'Kukatpally', 'Miyapur', 
              'Secunderabad', 'Begumpet', 'Ameerpet', 'Dilsukhnagar',
              'Financial District', 'Kokapet', 'Narsingi', 'Manikonda'
            ].map((location) => (
              <button
                key={location}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-teal-100 hover:text-teal-700 transition-colors"
                onClick={() => {
                  // Auto-fill and search for these locations
                  const searchInput = document.querySelector('input[placeholder*="Smart search"]') as HTMLInputElement;
                  if (searchInput) {
                    searchInput.value = location;
                    searchInput.focus();
                    // Trigger the input change event
                    const event = new Event('input', { bubbles: true });
                    searchInput.dispatchEvent(event);
                    
                    // Auto-trigger search after a short delay
                    setTimeout(() => {
                      const searchButton = document.querySelector('button:has(.lucide-search)') as HTMLButtonElement;
                      if (searchButton) {
                        searchButton.click();
                      }
                    }, 500);
                  }
                }}
              >
                {location}
              </button>
            ))}
          </div>
          
          {/* Search Examples */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">💡 Smart Search Examples:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div><strong className="text-blue-700">Spelling Variations:</strong></div>
                <div className="text-gray-700">• "Kondapoor" → finds Kondapur</div>
                <div className="text-gray-700">• "Gatchibowli" → finds Gachibowli</div>
                <div className="text-gray-700">• "Hitec City" → finds Hitech City</div>
              </div>
              <div className="space-y-2">
                <div><strong className="text-blue-700">Landmark Search:</strong></div>
                <div className="text-gray-700">• "near Forum Mall"</div>
                <div className="text-gray-700">• "close to Metro Station"</div>
                <div className="text-gray-700">• "Financial District area"</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;