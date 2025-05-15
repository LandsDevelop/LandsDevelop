import React, { useState } from 'react';
import { Search, MapPin, Home, Ruler } from 'lucide-react';

interface SearchBarProps {
  onSearch: (params: {
    location: string;
    propertyType: string;
    area: string;
    areaUnit: string;
  }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('acres');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const indianLocations = {
    "Hyderabad": [
      "Kompally", "Financial District", "Shamshabad", "HITEC City", "Gachibowli",
      "Madhapur", "Nanakramguda", "Kondapur", "Raidurg", "Banjara Hills",
      "Jubilee Hills", "Kukatpally", "Miyapur", "Manikonda"
    ],
    "Bangalore": [
      "Whitefield", "Electronic City", "Marathahalli", "Hebbal", "Sarjapur",
      "HSR Layout", "Koramangala", "Indiranagar", "JP Nagar", "Jayanagar"
    ]
  };

  const allLocations = Object.entries(indianLocations).flatMap(([city, areas]) =>
    areas.map(area => `${area}, ${city}`)
  ).sort();

  const filteredLocations = allLocations.filter(loc =>
    loc.toLowerCase().includes(location.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location,
      propertyType,
      area,
      areaUnit
    });
    setShowLocationSuggestions(false);
  };

  const handleLocationSelect = (loc: string) => {
    setLocation(loc);
    setShowLocationSuggestions(false);
    // Trigger search immediately when location is selected
    onSearch({
      location: loc,
      propertyType,
      area,
      areaUnit
    });
  };

  const developmentTypes = [
    { value: "villa", label: "Villa Project" },
    { value: "apartment", label: "High-rise Apartment" },
    { value: "plotted", label: "Plotted Development" },
    { value: "mixed", label: "Mixed Development" },
    { value: "standalone", label: "Standalone Building" }
  ];

  const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPropertyType = e.target.value;
    setPropertyType(newPropertyType);
    // Trigger search immediately when property type changes
    onSearch({
      location,
      propertyType: newPropertyType,
      area,
      areaUnit
    });
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newArea = e.target.value;
    setArea(newArea);
    // Trigger search immediately when area changes
    onSearch({
      location,
      propertyType,
      area: newArea,
      areaUnit
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center border rounded-lg p-3">
            <Home className="h-5 w-5 text-gray-400 mr-2" />
            <select 
              className="w-full focus:outline-none bg-white text-gray-900 appearance-none"
              value={propertyType}
              onChange={handlePropertyTypeChange}
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'none'
              }}
            >
              <option value="">Development Type</option>
              {developmentTypes.map(type => (
                <option 
                  key={type.value} 
                  value={type.value}
                  className="text-gray-900 bg-white"
                >
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {propertyType && (
            <div className="mt-1 text-sm text-teal-600 pl-2">
              Selected: {developmentTypes.find(t => t.value === propertyType)?.label}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className={`flex items-center border rounded-lg p-3 ${area ? 'bg-teal-50 border-teal-200' : ''}`}>
            <Ruler className={`h-5 w-5 mr-2 ${area ? 'text-teal-600' : 'text-gray-400'}`} />
            <input
              type="number"
              placeholder="Area"
              value={area}
              onChange={handleAreaChange}
              className={`w-full focus:outline-none ${area ? 'bg-teal-50 text-teal-700 placeholder-teal-400' : 'bg-white'}`}
            />
            <select
              value={areaUnit}
              onChange={(e) => setAreaUnit(e.target.value)}
              className={`ml-2 focus:outline-none ${area ? 'bg-teal-50 text-teal-700' : 'bg-white text-gray-900'}`}
            >
              <option value="acres">Acres</option>
              <option value="sqYards">Sq. Yards</option>
            </select>
          </div>
          {area && (
            <div className="mt-1 text-sm text-teal-600 pl-2 font-medium">
              Area: {area} {areaUnit}
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <div className={`flex items-center border rounded-lg p-3 ${location && !showLocationSuggestions ? 'bg-teal-50 border-teal-200' : ''}`}>
            <MapPin className={`h-5 w-5 mr-2 ${location && !showLocationSuggestions ? 'text-teal-600' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search locations across India"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              className={`w-full focus:outline-none ${location && !showLocationSuggestions ? 'bg-teal-50 text-teal-700 placeholder-teal-400' : 'bg-white'}`}
            />
          </div>
          {location && !showLocationSuggestions && (
            <div className="mt-1 text-sm text-teal-600 pl-2 font-medium">
              Selected: {location}
            </div>
          )}
          {showLocationSuggestions && location.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredLocations.map((loc, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-gray-600 hover:text-teal-600 border-b last:border-b-0"
                  onClick={() => handleLocationSelect(loc)}
                >
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium">{loc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit"
          className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;