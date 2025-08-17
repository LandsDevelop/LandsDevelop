import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';

interface Property {
  _id: string;
  projectName: string;
  developmentType: string;
  totalArea: string;
  areaUnit: string;
  city: string;
  locality: string;
  landmark: string;
  address: string;
  coordinates: string;
  goodwill: string;
  advance: string;
  imageUrl: string;
  dealStatus: string;
  createdAt: string;
}

interface SearchFilters {
  developmentType: string;
  minArea: string;
  maxArea: string;
  ratio: string;
}

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    developmentType: 'All',
    minArea: '',
    maxArea: '',
    ratio: 'All'
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [googleMapsStatus, setGoogleMapsStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  
  // Refs for Google Maps integration
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Development types and ratios for filters
  const developmentTypes = ['All', 'villa', 'standalone', 'high-rise', 'plotted', 'mixed'];
  const ratios = ['All', '50:50', '60:40', '70:30', '80:20'];

  // Enhanced location matching without Google Maps dependency
  const fuzzyLocationMatch = (query: string): string[] => {
    const locationMappings: { [key: string]: string[] } = {
      'gachibowli': ['gachibowli', 'gatchibowli', 'gachbowli', 'gachi bowli'],
      'kondapur': ['kondapur', 'kondapoor', 'kondapour', 'konda pur'],
      'hitech city': ['hitech city', 'hitec city', 'hi-tech city', 'hitech', 'hitec'],
      'banjara hills': ['banjara hills', 'banjara', 'banjarahills', 'banjra hills'],
      'jubilee hills': ['jubilee hills', 'jubilee', 'jubileehills', 'jubli hills'],
      'madhapur': ['madhapur', 'madhpur', 'madha pur', 'madhapar'],
      'kukatpally': ['kukatpally', 'kukatpaly', 'kukat pally', 'kukutpally'],
      'miyapur': ['miyapur', 'miapur', 'miya pur', 'miyapoor'],
      'financial district': ['financial district', 'fin district', 'financial', 'finacial district']
    };

    const queryLower = query.toLowerCase().trim();
    const matches: string[] = [];

    // Direct match
    matches.push(queryLower);

    // Find fuzzy matches
    Object.entries(locationMappings).forEach(([canonical, variants]) => {
      variants.forEach(variant => {
        if (queryLower.includes(variant) || variant.includes(queryLower)) {
          matches.push(canonical);
          matches.push(...variants);
        }
      });
    });

    // Remove duplicates
    return [...new Set(matches)];
  };

  // Load Google Maps API (with better error handling)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        setGoogleMapsStatus('loaded');
        initializeAutocomplete();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.warn('Google Maps API key not found. Using fallback search.');
        setGoogleMapsStatus('error');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=3.55`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Add a small delay to ensure Google Maps is fully initialized
        timeoutId = setTimeout(() => {
          if (window.google?.maps?.places) {
            setGoogleMapsStatus('loaded');
            initializeAutocomplete();
          } else {
            setGoogleMapsStatus('error');
          }
        }, 1000);
      };
      
      script.onerror = () => {
        console.warn('Failed to load Google Maps API. Using fallback search.');
        setGoogleMapsStatus('error');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!window.google?.maps?.places || !searchInputRef.current) {
      return;
    }

    try {
      // Use the newer Places API approach
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'IN' },
          fields: ['formatted_address', 'geometry', 'address_components', 'name'],
          bounds: new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(17.2, 78.2),
            new window.google.maps.LatLng(17.6, 78.8)
          ),
          strictBounds: false
        }
      );

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
      console.log('Google Places Autocomplete initialized successfully');
      
    } catch (error) {
      console.warn('Failed to initialize Google Places Autocomplete:', error);
      setGoogleMapsStatus('error');
    }
  };

  const handlePlaceSelect = () => {
    try {
      const place = autocompleteRef.current?.getPlace();
      
      if (!place) return;
      
      let searchTerm = '';
      
      if (place.address_components) {
        const locality = place.address_components.find((c: any) => 
          c.types?.includes('sublocality_level_1') || 
          c.types?.includes('sublocality') ||
          c.types?.includes('locality')
        );
        
        searchTerm = locality?.long_name || place.name || place.formatted_address || searchQuery;
      } else {
        searchTerm = place.name || searchQuery;
      }

      if (searchTerm) {
        setSearchQuery(searchTerm);
        setTimeout(() => handleSearch(searchTerm), 100);
      }
    } catch (error) {
      console.warn('Error handling place selection:', error);
    }
  };

  const handleSearch = async (query: string = searchQuery, currentFilters: SearchFilters = filters) => {
    if (!query.trim() && currentFilters.developmentType === 'All' && !currentFilters.minArea && !currentFilters.maxArea && currentFilters.ratio === 'All') {
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // First attempt: Direct search
      let searchResults = await performDirectSearch(query.trim(), currentFilters);
      
      // If no results and we have a query, try fuzzy matching
      if (searchResults.length === 0 && query.trim()) {
        console.log('No direct results found, trying fuzzy location matching...');
        
        const alternativeQueries = fuzzyLocationMatch(query.trim());
        
        for (const altQuery of alternativeQueries.slice(1, 4)) { // Try up to 3 alternatives
          if (altQuery !== query.trim().toLowerCase()) {
            console.log(`Trying fuzzy search with: ${altQuery}`);
            const fuzzyResults = await performDirectSearch(altQuery, currentFilters);
            if (fuzzyResults.length > 0) {
              searchResults = fuzzyResults;
              break;
            }
          }
        }
      }

      // Filter out closed deals
      const openProperties = searchResults.filter((property: Property) => 
        property.dealStatus !== 'closed'
      );
      
      setProperties(openProperties);
      
    } catch (error) {
      console.error('Search error:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const performDirectSearch = async (searchTerm: string, currentFilters: SearchFilters): Promise<Property[]> => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (currentFilters.developmentType !== 'All') params.append('developmentType', currentFilters.developmentType);
    if (currentFilters.minArea) params.append('minArea', currentFilters.minArea);
    if (currentFilters.maxArea) params.append('maxArea', currentFilters.maxArea);
    if (currentFilters.ratio !== 'All') params.append('ratio', currentFilters.ratio);

    const response = await fetch(`https://landsdevelop.onrender.com/api/search?${params.toString()}`);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      console.error('Search failed:', data.error);
      return [];
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (hasSearched) {
      handleSearch(searchQuery, newFilters);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setProperties([]);
    setHasSearched(false);
    setFilters({
      developmentType: 'All',
      minArea: '',
      maxArea: '',
      ratio: 'All'
    });
    
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  const formatPrice = (price: string) => {
    if (!price) return 'Price on request';
    const num = parseInt(price);
    if (isNaN(num)) return 'Price on request';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString()}`;
  };

  const formatArea = (area: string, unit: string) => {
    return `${area} ${unit}`;
  };

  const getSearchStatusMessage = () => {
    switch (googleMapsStatus) {
      case 'loading':
        return { text: 'Loading smart search...', color: 'text-orange-600', icon: '⏳' };
      case 'loaded':
        return { text: 'Smart search enabled', color: 'text-green-600', icon: '✅' };
      case 'error':
        return { text: 'Basic search enabled', color: 'text-blue-600', icon: '🔍' };
      default:
        return { text: 'Search ready', color: 'text-gray-600', icon: '🔍' };
    }
  };

  const statusMessage = getSearchStatusMessage();

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={
                googleMapsStatus === 'loaded' 
                  ? "Smart search enabled - try 'Kondapoor' or 'near Hitech City'" 
                  : "Search by location, locality, project name..."
              }
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
              {googleMapsStatus === 'loading' && (
                <div className="animate-spin h-4 w-4 border-2 border-teal-500 border-t-transparent rounded-full"></div>
              )}
              {(searchQuery || hasSearched) && (
                <button
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-400 hover:text-teal-600"
                type="button"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
            
            {/* Search Status Indicator */}
            <div className="absolute top-full left-0 mt-1">
              <span className={`text-xs ${statusMessage.color} flex items-center`}>
                <span className="mr-1">{statusMessage.icon}</span>
                {statusMessage.text}
              </span>
            </div>
          </div>

          {/* Search and Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 flex items-center space-x-2"
              type="button"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? 'Searching...' : 'Search Properties'}</span>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border flex items-center space-x-2 ${
                showFilters 
                  ? 'bg-teal-50 text-teal-700 border-teal-300' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              type="button"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>

            {/* Search Tips */}
            <div className="text-sm text-gray-500 flex items-center">
              💡 Try: "Gachibowli", "Kondapoor", or "near Hitech City"
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Development Type
                  </label>
                  <select
                    value={filters.developmentType}
                    onChange={(e) => handleFilterChange('developmentType', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  >
                    {developmentTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Area
                  </label>
                  <input
                    type="number"
                    value={filters.minArea}
                    onChange={(e) => handleFilterChange('minArea', e.target.value)}
                    placeholder="Min area"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Area
                  </label>
                  <input
                    type="number"
                    value={filters.maxArea}
                    onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                    placeholder="Max area"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Developer Ratio
                  </label>
                  <select
                    value={filters.ratio}
                    onChange={(e) => handleFilterChange('ratio', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  >
                    {ratios.map(ratio => (
                      <option key={ratio} value={ratio}>
                        {ratio === 'All' ? 'All Ratios' : ratio}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {loading ? 'Searching with smart location matching...' : `Found ${properties.length} properties`}
              {searchQuery && ` for "${searchQuery}"`}
            </h2>
            {properties.length > 0 && (
              <span className="text-sm text-gray-500">
                Sorted by latest first
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-blue-700 text-sm">
                    🔍 Searching your properties with intelligent location matching...
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <div className="text-gray-500 space-y-2">
                <p>We searched with intelligent location matching but couldn't find properties matching your criteria.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-left max-w-lg mx-auto">
                  <p className="font-medium text-blue-800 mb-2">💡 Search Tips:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Try broader terms like "Hyderabad" or area names</li>
                    <li>• Spelling variations work: "Kondapoor" → "Kondapur"</li>
                    <li>• Use landmarks: "near Hitech City" or "Financial District"</li>
                    <li>• Check different property types or adjust area filters</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  {property.imageUrl && (
                    <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={`https://landsdevelop.onrender.com/${property.imageUrl}`}
                        alt={property.projectName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9wZXJ0eSBJbWFnZTwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {property.projectName}
                      </h3>
                      <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
                        {property.developmentType}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.locality}, {property.city}
                      </p>
                      
                      {property.landmark && (
                        <p className="text-sm text-gray-500">
                          Near {property.landmark}
                        </p>
                      )}
                      
                      <p className="text-sm font-medium text-gray-700">
                        Area: {formatArea(property.totalArea, property.areaUnit)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        {property.goodwill && (
                          <p className="text-sm">
                            <span className="text-gray-600">Goodwill:</span>
                            <span className="font-semibold text-green-600 ml-1">
                              {formatPrice(property.goodwill)}
                            </span>
                          </p>
                        )}
                        {property.advance && (
                          <p className="text-sm">
                            <span className="text-gray-600">Advance:</span>
                            <span className="font-semibold text-blue-600 ml-1">
                              {formatPrice(property.advance)}
                            </span>
                          </p>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => window.location.href = `/property/${property._id}`}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm"
                        type="button"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;