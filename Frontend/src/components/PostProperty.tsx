import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const PostProperty = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    developmentType: '',
    totalArea: '',
    areaUnit: 'Sq Yards',
    northSideLength: '',
    southSideLength: '',
    eastSideLength: '',
    westSideLength: '',
    facing: '',
    roadSize: '',
    developerRatio: '',
    city: 'Hyderabad',
    locality: '',
    societyName: '',
    landmark: '',
    coordinates: { lat: 17.385044, lng: 78.486671 },
    mapLink: '',
    goodwill: '',
    advance: '',
    description: '',
    image: null as File | null,
    plotDiagram: null as File | null,
  });

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [useMapLink, setUseMapLink] = useState(false);
  const [mapLinkInput, setMapLinkInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const localityAutocompleteRef = useRef<any>(null);
  const societyAutocompleteRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const localityInputRef = useRef<HTMLInputElement>(null);
  const societyInputRef = useRef<HTMLInputElement>(null);
  const mapLinkInputRef = useRef<HTMLInputElement>(null);

  const cities = [
    { value: 'Hyderabad', label: 'Hyderabad' }
  ];

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB9FPavjXUnsCVKb9aLOdY7n8SQJ0IfGYY';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        console.log('Google Maps API loaded successfully');
        setIsMapLoaded(true);
        initializeMap();
        setTimeout(() => {
          initializeLocalityAutocomplete();
          initializeSocietyAutocomplete();
        }, 100);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        alert('Failed to load Google Maps. Please check your API key and internet connection.');
      };
      
      document.head.appendChild(script);
    } else {
      setIsMapLoaded(true);
      initializeMap();
      initializeLocalityAutocomplete();
      initializeSocietyAutocomplete();
    }
  }, []);

  const initializeMap = () => {
    if (window.google && document.getElementById('map')) {
      try {
        mapRef.current = new window.google.maps.Map(document.getElementById('map'), {
          center: formData.coordinates,
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: true,
          draggable: true,
          zoomControl: true,
          scrollwheel: true,
          disableDoubleClickZoom: false,
        });

        markerRef.current = new window.google.maps.Marker({
          position: formData.coordinates,
          map: mapRef.current,
          draggable: true,
          title: 'Property Location'
        });

        // Update coordinates when marker is dragged
        markerRef.current.addListener('dragend', (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          setFormData(prev => ({
            ...prev,
            coordinates: { lat, lng },
            mapLink: `https://maps.google.com/?q=${lat},${lng}`
          }));
        });

        // Update coordinates when map is clicked
        mapRef.current.addListener('click', (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          markerRef.current.setPosition({ lat, lng });
          setFormData(prev => ({
            ...prev,
            coordinates: { lat, lng },
            mapLink: `https://maps.google.com/?q=${lat},${lng}`
          }));
        });

        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  };

  const initializeLocalityAutocomplete = () => {
    if (window.google && localityInputRef.current && !useMapLink) {
      try {
        localityAutocompleteRef.current = new window.google.maps.places.Autocomplete(
          localityInputRef.current,
          {
            types: ['sublocality', 'neighborhood', 'locality'],
            componentRestrictions: { country: 'IN' },
            fields: ['formatted_address', 'geometry', 'address_components', 'name'],
            bounds: new window.google.maps.LatLngBounds(
              new window.google.maps.LatLng(17.2, 78.2),
              new window.google.maps.LatLng(17.6, 78.8)
            ),
            strictBounds: true
          }
        );

        localityAutocompleteRef.current.addListener('place_changed', handleLocalitySelect);
      } catch (error) {
        console.error('Error initializing locality autocomplete:', error);
      }
    }
  };

  const initializeSocietyAutocomplete = () => {
    if (window.google && societyInputRef.current && !useMapLink) {
      try {
        societyAutocompleteRef.current = new window.google.maps.places.Autocomplete(
          societyInputRef.current,
          {
            types: ['establishment', 'point_of_interest'],
            componentRestrictions: { country: 'IN' },
            fields: ['formatted_address', 'geometry', 'address_components', 'name'],
            bounds: new window.google.maps.LatLngBounds(
              new window.google.maps.LatLng(17.2, 78.2),
              new window.google.maps.LatLng(17.6, 78.8)
            ),
            strictBounds: false
          }
        );

        societyAutocompleteRef.current.addListener('place_changed', handleSocietySelect);
      } catch (error) {
        console.error('Error initializing society autocomplete:', error);
      }
    }
  };

  const handleLocalitySelect = () => {
    try {
      const place = localityAutocompleteRef.current.getPlace();
      
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        let localityName = place.name || '';
        
        place.address_components?.forEach((component: any) => {
          if (component.types.includes('sublocality_level_1') || 
              component.types.includes('sublocality') ||
              component.types.includes('neighborhood')) {
            localityName = component.long_name;
          }
        });

        setFormData(prev => ({
          ...prev,
          locality: localityName,
          coordinates: { lat, lng },
          mapLink: `https://maps.google.com/?q=${lat},${lng}`
        }));

        moveMapToLocation(lat, lng);
      }
    } catch (error) {
      console.error('Error handling locality selection:', error);
    }
  };

  const handleSocietySelect = () => {
    try {
      const place = societyAutocompleteRef.current.getPlace();
      
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setFormData(prev => ({
          ...prev,
          societyName: place.name || '',
          coordinates: { lat, lng },
          mapLink: `https://maps.google.com/?q=${lat},${lng}`
        }));

        moveMapToLocation(lat, lng);
      }
    } catch (error) {
      console.error('Error handling society selection:', error);
    }
  };

  const moveMapToLocation = (lat: number, lng: number) => {
    if (mapRef.current && markerRef.current) {
      const position = { lat, lng };
      mapRef.current.setCenter(position);
      mapRef.current.setZoom(15);
      markerRef.current.setPosition(position);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
              if (status === 'OK' && results[0]) {
                let localityName = '';
                
                results[0].address_components.forEach((component: any) => {
                  if (component.types.includes('sublocality_level_1') || 
                      component.types.includes('sublocality') ||
                      component.types.includes('neighborhood')) {
                    localityName = component.long_name;
                  }
                });
                
                setFormData(prev => ({
                  ...prev,
                  locality: localityName,
                  coordinates: { lat, lng },
                  mapLink: `https://maps.google.com/?q=${lat},${lng}`
                }));
                
                moveMapToLocation(lat, lng);
              }
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const extractCoordinatesFromMapLink = (link: string) => {
    const patterns = [
      /maps\.google\.com.*?@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /maps\.google\.com.*?q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /maps\.google\.com.*?ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /maps\.google\.com.*?center=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /goo\.gl\/maps\/.*?@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /(-?\d+\.?\d*),(-?\d+\.?\d*)/
    ];
    
    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
    return null;
  };

  const handleMapLinkChange = (e: ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setMapLinkInput(link);
    
    if (link.trim()) {
      const coords = extractCoordinatesFromMapLink(link);
      if (coords) {
        setFormData(prev => ({
          ...prev,
          coordinates: coords,
          mapLink: `https://maps.google.com/?q=${coords.lat},${coords.lng}`
        }));
        
        moveMapToLocation(coords.lat, coords.lng);
      }
    }
  };

  const toggleMapLinkMode = () => {
    setUseMapLink(!useMapLink);
    if (!useMapLink) {
      setFormData(prev => ({ ...prev, locality: '', societyName: '' }));
    } else {
      setMapLinkInput('');
      setTimeout(() => {
        initializeLocalityAutocomplete();
        initializeSocietyAutocomplete();
      }, 100);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handlePlotDiagramChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, plotDiagram: file }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in');
      navigate('/');
      setIsSubmitting(false);
      return;
    }

    // Validation
    if (!formData.locality) {
      alert('Please enter a locality');
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    
    // Add all text fields
    data.append('developmentType', formData.developmentType);
    data.append('totalArea', formData.totalArea);
    data.append('areaUnit', formData.areaUnit);
    data.append('northSideLength', formData.northSideLength);
    data.append('southSideLength', formData.southSideLength);
    data.append('eastSideLength', formData.eastSideLength);
    data.append('westSideLength', formData.westSideLength);
    data.append('facing', formData.facing);
    data.append('roadSize', formData.roadSize);
    data.append('developerRatio', formData.developerRatio);
    data.append('city', formData.city);
    data.append('locality', formData.locality);
    data.append('societyName', formData.societyName);
    data.append('landmark', formData.landmark);
    data.append('map', formData.mapLink);
    data.append('coordinates', JSON.stringify(formData.coordinates));
    data.append('goodwill', formData.goodwill);
    data.append('advance', formData.advance);
    data.append('description', formData.description);
    data.append('selectedAmenities', JSON.stringify([]));
    
    // Add images if present
    if (formData.image) {
      data.append('image', formData.image);
    }
    if (formData.plotDiagram) {
      data.append('plotDiagram', formData.plotDiagram);
    }

    try {
      const res = await fetch('http://localhost:5174/api/add', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const responseText = await res.text();
      
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid response from server: ${responseText}`);
      }
      
      if (!res.ok) {
        throw new Error(json.error || json.details || 'Failed to post property');
      }
      
      alert('Property submitted successfully! It will be visible after admin approval.');
      navigate('/');
      
    } catch (err: any) {
      console.error('Submit error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roadSizes = ['20', '40', '60', '80', '100'];
  const facings = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
  const ratios = ['50:50', '60:40', '70:30', '80:20'];
  const showDimensions = formData.areaUnit !== 'Acres';

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-teal-700">Property Details</h2>
      
      <select 
        name="developmentType" 
        value={formData.developmentType} 
        onChange={handleChange} 
        className="w-full border p-2 rounded" 
        required
      >
        <option value="">Select Development Type *</option>
        <option value="villa">Villa</option>
        <option value="standalone">Standalone</option>
        <option value="high-rise">High-rise</option>
        <option value="plotted">Plotted</option>
        <option value="mixed">Mixed</option>
      </select>

      <div className="grid grid-cols-2 gap-4">
        <input 
          name="totalArea" 
          value={formData.totalArea} 
          onChange={handleChange} 
          placeholder="Total Area *" 
          className="border p-2 rounded" 
          type="number"
          min="0"
          step="any"
          required 
        />
        <select 
          name="areaUnit" 
          onChange={handleChange} 
          value={formData.areaUnit} 
          className="border p-2 rounded"
        >
          <option value="Sq Yards">Sq Yards</option>
          <option value="Sq Ft">Sq Ft</option>
          <option value="Acres">Acres</option>
        </select>
      </div>

      {showDimensions && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-teal-600">Plot Dimensions (in feet)</h3>
          <div className="grid grid-cols-2 gap-4">
            <input 
              name="northSideLength" 
              value={formData.northSideLength} 
              onChange={handleChange} 
              placeholder="North Side Length (ft)" 
              className="border p-2 rounded" 
              type="number"
              min="0"
              step="any"
            />
            <input 
              name="southSideLength" 
              value={formData.southSideLength} 
              onChange={handleChange} 
              placeholder="South Side Length (ft)" 
              className="border p-2 rounded" 
              type="number"
              min="0"
              step="any"
            />
            <input 
              name="eastSideLength" 
              value={formData.eastSideLength} 
              onChange={handleChange} 
              placeholder="East Side Length (ft)" 
              className="border p-2 rounded" 
              type="number"
              min="0"
              step="any"
            />
            <input 
              name="westSideLength" 
              value={formData.westSideLength} 
              onChange={handleChange} 
              placeholder="West Side Length (ft)" 
              className="border p-2 rounded" 
              type="number"
              min="0"
              step="any"
            />
          </div>
          
          {/* Plot Diagram Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload 2D Plot Diagram (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Upload a simple 2D diagram showing the plot boundaries with measurements. 
              Accepted formats: JPG, PNG, PDF (Max 5MB)
            </p>
            <input 
              type="file" 
              onChange={handlePlotDiagramChange} 
              className="border p-2 w-full rounded bg-white" 
              accept="image/*,.pdf"
            />
            {formData.plotDiagram && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {formData.plotDiagram.name}
              </p>
            )}
          </div>
        </div>
      )}

      <select 
        name="facing" 
        onChange={handleChange} 
        value={formData.facing} 
        className="w-full border p-2 rounded"
      >
        <option value="">Facing</option>
        {facings.map(f => <option key={f} value={f}>{f}</option>)}
      </select>

      <div className="flex gap-2">
        <select 
          onChange={e => setFormData(prev => ({ ...prev, roadSize: e.target.value }))} 
          className="border p-2 rounded"
        >
          <option value="">Select Road Size (ft)</option>
          {roadSizes.map(size => <option key={size} value={size}>{size}</option>)}
        </select>
        <input 
          name="roadSize" 
          value={formData.roadSize} 
          onChange={handleChange} 
          className="border p-2 rounded flex-grow" 
          placeholder="Or enter road size (in feet)" 
        />
      </div>

      <div className="flex gap-2">
        <select 
          onChange={e => setFormData(prev => ({ ...prev, developerRatio: e.target.value }))} 
          className="border p-2 rounded"
        >
          <option value="">Select Developer Ratio</option>
          {ratios.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input 
          name="developerRatio" 
          value={formData.developerRatio} 
          onChange={handleChange} 
          className="border p-2 rounded flex-grow" 
          placeholder="Or enter custom ratio" 
        />
      </div>

      <h2 className="text-2xl font-bold text-teal-700 mt-6">Location Details</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <select 
            name="city" 
            value={formData.city} 
            onChange={handleChange} 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500" 
            required
          >
            {cities.map(city => (
              <option key={city.value} value={city.value}>{city.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
          <input
            type="checkbox"
            id="useMapLink"
            checked={useMapLink}
            onChange={toggleMapLinkMode}
            className="w-4 h-4 text-teal-600"
          />
          <label htmlFor="useMapLink" className="text-sm text-gray-700">
            Use Google Maps link instead
          </label>
        </div>

        {useMapLink ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paste Google Maps Link *
            </label>
            <input
              ref={mapLinkInputRef}
              type="text"
              value={mapLinkInput}
              onChange={handleMapLinkChange}
              placeholder="Paste your Google Maps link here"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-teal-500"
              disabled={!isMapLoaded}
              required
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Locality *
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="ml-2 text-xs text-teal-600 hover:text-teal-800 bg-teal-50 px-2 py-1 rounded"
                >
                  Use Current Location
                </button>
              </label>
              <input 
                ref={localityInputRef}
                name="locality" 
                value={formData.locality} 
                onChange={handleChange} 
                placeholder="Enter locality (e.g., Gachibowli, Kondapur)" 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-teal-500" 
                disabled={!isMapLoaded}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Society / Apartment Name (Optional)
              </label>
              <input 
                ref={societyInputRef}
                name="societyName" 
                value={formData.societyName} 
                onChange={handleChange} 
                placeholder="Enter society or apartment name" 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-teal-500" 
                disabled={!isMapLoaded}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Landmark / Street *</label>
          <input 
            name="landmark" 
            value={formData.landmark} 
            onChange={handleChange} 
            placeholder="e.g., Near Metro Station, Main Road" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        {(formData.locality || formData.societyName) && (
          <div className="p-3 bg-teal-50 rounded-lg">
            <p className="text-sm text-teal-700">
              <strong>Selected Location:</strong>
            </p>
            <p className="text-sm text-gray-700">
              {formData.societyName && `${formData.societyName}, `}
              {formData.locality}, {formData.landmark}, {formData.city}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Mark Location on Map *
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Click on the map or drag the marker to mark the exact property location
        </p>
        <div 
          id="map" 
          className="w-full h-80 rounded-lg border bg-gray-100"
          style={{ minHeight: '320px' }}
        ></div>
      </div>

      <h2 className="text-2xl font-bold text-teal-700 mt-6">Pricing (Optional)</h2>
      <input 
        name="goodwill" 
        onChange={handleChange} 
        value={formData.goodwill} 
        placeholder="Goodwill (₹)" 
        className="w-full border p-2 rounded" 
        type="number"
      />
      <input 
        name="advance" 
        onChange={handleChange} 
        value={formData.advance} 
        placeholder="Advance (₹)" 
        className="w-full border p-2 rounded" 
        type="number"
      />
      <textarea 
        name="description" 
        onChange={handleChange} 
        value={formData.description} 
        placeholder="Property Description (Optional)" 
        className="w-full border p-2 rounded h-24" 
      />

      <h2 className="text-2xl font-bold text-teal-700 mt-6">Property Image</h2>
      <input 
        type="file" 
        onChange={handleImageChange} 
        className="border p-2 w-full rounded" 
        accept="image/*"
      />

      <button 
        type="submit" 
        className="bg-teal-700 text-white px-8 py-3 rounded-lg hover:bg-teal-800 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
        disabled={!isMapLoaded || isSubmitting}
      >
        {isSubmitting ? 'Submitting for Approval...' : 'Submit Property for Approval'}
      </button>
      
      <p className="text-sm text-gray-600 text-center">
        Your property will be reviewed by admin before being published
      </p>
    </form>
  );
};

export default PostProperty;