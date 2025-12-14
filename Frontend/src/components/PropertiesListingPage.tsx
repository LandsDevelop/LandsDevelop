import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search, SlidersHorizontal, X, Grid, List, IndianRupee } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface Property {
  _id: string;
  projectName: string;
  developmentType: string;
  totalArea: string;
  areaUnit: string;
  city: string;
  locality: string;
  landmark: string;
  coordinates: string;
  goodwill: string;
  advance: string;
  imageUrl: string;
  dealStatus: string;
  facing: string;
  roadSize: string;
  developerRatio: string;
  createdAt: string;
}

const PropertiesListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const autocompleteRef = React.useRef<any>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    developmentType: searchParams.get('developmentType') || 'All',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    ratio: searchParams.get('ratio') || 'All',
    facing: searchParams.get('facing') || 'All',
    minGoodwill: searchParams.get('minGoodwill') || '',
    maxGoodwill: searchParams.get('maxGoodwill') || '',
    city: searchParams.get('city') || 'All'
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter options
  const developmentTypes = ['All', 'villa', 'standalone', 'high-rise', 'plotted', 'mixed'];
  const ratios = ['All', '50:50', '60:40', '70:30', '80:20'];
  const facings = ['All', 'North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
  const cities = ['All', 'Hyderabad'];

  // Fetch properties
  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps?.places && searchInputRef.current && !autocompleteRef.current) {
        try {
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

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.name) {
              let locationName = '';
              if (place.address_components) {
                const locality = place.address_components.find((c: any) =>
                  c.types?.includes('sublocality_level_1') ||
                  c.types?.includes('sublocality') ||
                  c.types?.includes('locality')
                );
                locationName = locality?.long_name || place.name;
              } else {
                locationName = place.name;
              }
              setSearchQuery(locationName);
              setTimeout(() => handleSearch(), 100);
            }
          });
        } catch (error) {
          console.warn('Failed to initialize Google Maps Autocomplete:', error);
        }
      }
    };

    if (!window.google?.maps) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB9FPavjXUnsCVKb9aLOdY7n8SQJ0IfGYY';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=3.55`;
      script.async = true;
      script.onload = () => {
        setTimeout(loadGoogleMaps, 500);
      };
      document.head.appendChild(script);
    } else {
      loadGoogleMaps();
    }
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.developmentType !== 'All') params.append('developmentType', filters.developmentType);
      if (filters.minArea) params.append('minArea', filters.minArea);
      if (filters.maxArea) params.append('maxArea', filters.maxArea);
      if (filters.ratio !== 'All') params.append('ratio', filters.ratio);

      const response = await fetch(`http://localhost:5174/api/search?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        // Filter out closed deals and apply additional filters
        let filtered = data.filter((property: Property) => property.dealStatus !== 'closed');

        // Apply facing filter
        if (filters.facing !== 'All') {
          filtered = filtered.filter((p: Property) => p.facing === filters.facing);
        }

        // Apply city filter
        if (filters.city !== 'All') {
          filtered = filtered.filter((p: Property) => p.city === filters.city);
        }

        // Apply goodwill range filter
        if (filters.minGoodwill || filters.maxGoodwill) {
          filtered = filtered.filter((p: Property) => {
            const goodwill = parseInt(p.goodwill || '0');
            const min = parseInt(filters.minGoodwill || '0');
            const max = parseInt(filters.maxGoodwill || '999999999');
            return goodwill >= min && goodwill <= max;
          });
        }

        setProperties(filtered);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.developmentType !== 'All') params.set('developmentType', filters.developmentType);
    if (filters.minArea) params.set('minArea', filters.minArea);
    if (filters.maxArea) params.set('maxArea', filters.maxArea);
    if (filters.ratio !== 'All') params.set('ratio', filters.ratio);
    if (filters.facing !== 'All') params.set('facing', filters.facing);
    if (filters.minGoodwill) params.set('minGoodwill', filters.minGoodwill);
    if (filters.maxGoodwill) params.set('maxGoodwill', filters.maxGoodwill);
    if (filters.city !== 'All') params.set('city', filters.city);
    
    setSearchParams(params);
    fetchProperties();
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Auto-apply filters on change
    setTimeout(() => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (newFilters.developmentType !== 'All') params.set('developmentType', newFilters.developmentType);
      if (newFilters.minArea) params.set('minArea', newFilters.minArea);
      if (newFilters.maxArea) params.set('maxArea', newFilters.maxArea);
      if (newFilters.ratio !== 'All') params.set('ratio', newFilters.ratio);
      if (newFilters.facing !== 'All') params.set('facing', newFilters.facing);
      if (newFilters.minGoodwill) params.set('minGoodwill', newFilters.minGoodwill);
      if (newFilters.maxGoodwill) params.set('maxGoodwill', newFilters.maxGoodwill);
      if (newFilters.city !== 'All') params.set('city', newFilters.city);
      
      setSearchParams(params);
    }, 100);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      developmentType: 'All',
      minArea: '',
      maxArea: '',
      ratio: 'All',
      facing: 'All',
      minGoodwill: '',
      maxGoodwill: '',
      city: 'All'
    });
    setSearchParams({});
    fetchProperties();
  };

  const formatPrice = (price: string) => {
    if (!price) return 'Price on request';
    const num = parseInt(price);
    if (isNaN(num)) return 'Price on request';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <div className="bg-white border-b sticky top-0 z-40 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by location, project name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Search & Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showMobileFilters ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : 'hidden'} md:block md:relative md:w-80 flex-shrink-0`}>
                          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              {/* Mobile Close Button */}
              <div className="md:hidden flex justify-between items-center mb-4 pb-4 border-b">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold hidden md:block">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Development Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <div className="space-y-2">
                    {developmentTypes.map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="developmentType"
                          value={type}
                          checked={filters.developmentType === type}
                          onChange={(e) => handleFilterChange('developmentType', e.target.value)}
                          className="mr-2 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {type === 'All' ? 'All Types' : type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Area Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area Range (Sq Yards)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minArea}
                      onChange={(e) => handleFilterChange('minArea', e.target.value)}
                      placeholder="Min"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-gray-500 self-center">-</span>
                    <input
                      type="number"
                      value={filters.maxArea}
                      onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                      placeholder="Max"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Goodwill Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goodwill Range (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minGoodwill}
                      onChange={(e) => handleFilterChange('minGoodwill', e.target.value)}
                      placeholder="Min"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-gray-500 self-center">-</span>
                    <input
                      type="number"
                      value={filters.maxGoodwill}
                      onChange={(e) => handleFilterChange('maxGoodwill', e.target.value)}
                      placeholder="Max"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Facing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facing
                  </label>
                  <select
                    value={filters.facing}
                    onChange={(e) => handleFilterChange('facing', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  >
                    {facings.map(facing => (
                      <option key={facing} value={facing}>{facing}</option>
                    ))}
                  </select>
                </div>

                {/* Developer Ratio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* Apply Button (Mobile) */}
                <button
                  onClick={() => {
                    handleSearch();
                    setShowMobileFilters(false);
                  }}
                  className="md:hidden w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Properties List */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {loading ? 'Searching...' : `${properties.length} Properties Found`}
                </h2>
                {searchQuery && (
                  <p className="text-sm text-gray-600 mt-1">
                    for "{searchQuery}"
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && properties.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
                <button
                  onClick={clearFilters}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Properties Grid/List */}
            {!loading && properties.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {properties.map((property) => (
                  <div
                    key={property._id}
                    className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex gap-4' : ''
                    }`}
                  >
                    {/* Property Image */}
                    <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'h-48'} bg-gray-200 overflow-hidden ${viewMode === 'grid' ? 'rounded-t-lg' : 'rounded-l-lg'}`}>
                      <img
                        src={property.imageUrl ? `http://localhost:5174${property.imageUrl}` : 'https://via.placeholder.com/400x300?text=No+Image'}
                        alt={property.projectName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                      <span className="absolute top-2 right-2 bg-teal-600 text-white px-3 py-1 rounded-full text-xs">
                        {property.developmentType}
                      </span>
                    </div>

                    {/* Property Details */}
                    <div className="p-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {property.projectName}
                      </h3>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{property.locality}, {property.city}</span>
                      </div>

                      {property.landmark && (
                        <p className="text-xs text-gray-500 mb-3">Near {property.landmark}</p>
                      )}

                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Area:</span>
                          <span className="font-semibold ml-1">{property.totalArea} {property.areaUnit}</span>
                        </div>
                        {property.facing && (
                          <div>
                            <span className="text-gray-600">Facing:</span>
                            <span className="font-semibold ml-1">{property.facing}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            {property.goodwill && (
                              <div className="text-sm">
                                <span className="text-gray-600">Goodwill:</span>
                                <span className="font-bold text-green-600 ml-1">
                                  {formatPrice(property.goodwill)}
                                </span>
                              </div>
                            )}
                            {property.advance && (
                              <div className="text-sm">
                                <span className="text-gray-600">Advance:</span>
                                <span className="font-bold text-blue-600 ml-1">
                                  {formatPrice(property.advance)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/property/${property._id}`}
                          className="block w-full bg-teal-600 text-white text-center py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesListingPage;