import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PostProperty: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // State variables
  const [projectTitle, setProjectTitle] = useState('');
  const [developmentType, setDevelopmentType] = useState('');
  const [totalArea, setTotalArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('sqYards');
  const [dimensions, setDimensions] = useState({ length: '', width: '' });
  const [roadSize, setRoadSize] = useState('');
  const [developerRatio, setDeveloperRatio] = useState('50:50');
  const [facing, setFacing] = useState('');
  const [goodwillAmount, setGoodwillAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [landmark, setLandmark] = useState('');
  const [locality, setLocality] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [navigate]);

  const handleAmenityToggle = (feature: string) => {
    setSelectedAmenities(prev =>
      prev.includes(feature) ? prev.filter(a => a !== feature) : [...prev, feature]
    );
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) return alert('Not authenticated');

  const formData = new FormData();
  formData.append('title', projectTitle);
  formData.append('location', locality);
  formData.append('totalArea', totalArea);
  formData.append('dimensions', `${dimensions.length} ft x ${dimensions.width} ft`);
  formData.append('developmentType', developmentType);
  formData.append('developerRatio', developerRatio);
  formData.append('goodwill', goodwillAmount);
  formData.append('advance', advanceAmount);
  formData.append('facing', facing);
  formData.append('mapLink', mapLink);
  formData.append('roadSize', roadSize);
  formData.append('areaUnit', areaUnit);
  formData.append('address', address);
  formData.append('landmark', landmark);
  formData.append('selectedAmenities', JSON.stringify(selectedAmenities));
  formData.append('permission_type', 'HMDA');
  formData.append('permission_status', 'Approved');
  formData.append('reraApproved', '1');
  formData.append('landconverted', '1');
  formData.append('titleClear', '1');
  if (imageFile) formData.append('image', imageFile);

  try {
    const res = await fetch('http://localhost:5174/api/add', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
    // ❌ Do NOT set 'Content-Type' manually when using FormData
  },
  body: formData
});


    const rawResponse = await res.text();
    console.log("Raw response:", rawResponse);

    const data = JSON.parse(rawResponse); // parse once
    if (!res.ok) throw new Error(data.error || 'Failed to post property');

    alert('Property posted!');
    navigate('/development-plots');
  } catch (err: any) {
    alert(`Error: ${err.message}`);
  }
};

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Post Your Property</h1>
<form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Project Title</label>
            <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} className="w-full border px-4 py-2 rounded" required />
          </div>
    
          <div>
            <label className="block text-sm font-medium">Development Type</label>
            <select value={developmentType} onChange={e => setDevelopmentType(e.target.value)} className="w-full border px-4 py-2 rounded" required>
              <option value="">Select Type</option>
              <option value="villa">Villa</option>
              <option value="standalone">Standalone</option>
              <option value="highrise">High-rise</option>
              <option value="plotted">Plotted</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Total Area</label>
              <input value={totalArea} onChange={e => setTotalArea(e.target.value)} type="number" className="w-full border px-4 py-2 rounded" required />
            </div>
            <div>
              <label>Area Unit</label>
              <select value={areaUnit} onChange={e => setAreaUnit(e.target.value)} className="w-full border px-4 py-2 rounded">
                <option value="sqYards">Sq Yards</option>
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Length (ft)" type="number" value={dimensions.length} onChange={e => setDimensions(prev => ({ ...prev, length: e.target.value }))} className="w-full border px-4 py-2 rounded" />
            <input placeholder="Width (ft)" type="number" value={dimensions.width} onChange={e => setDimensions(prev => ({ ...prev, width: e.target.value }))} className="w-full border px-4 py-2 rounded" />
          </div>

          <div>
            <label>Road Size</label>
            <input value={roadSize} onChange={e => setRoadSize(e.target.value)} className="w-full border px-4 py-2 rounded" />
          </div>

          <div>
            <label>Developer Ratio</label>
            <select value={developerRatio} onChange={e => setDeveloperRatio(e.target.value)} className="w-full border px-4 py-2 rounded">
              <option value="50:50">50:50</option>
              <option value="60:40">60:40</option>
              <option value="40:60">40:60</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Goodwill (₹)" value={goodwillAmount} onChange={e => setGoodwillAmount(e.target.value)} className="w-full border px-4 py-2 rounded" />
            <input placeholder="Advance (₹)" value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)} className="w-full border px-4 py-2 rounded" />
          </div>

          <textarea placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full border px-4 py-2 rounded"></textarea>
          <input placeholder="Landmark" value={landmark} onChange={e => setLandmark(e.target.value)} className="w-full border px-4 py-2 rounded" />
          <input placeholder="Locality" value={locality} onChange={e => setLocality(e.target.value)} className="w-full border px-4 py-2 rounded" />

          <div>
          <label className="block text-sm font-medium mb-1">Uploads Image</label>
          <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full border px-4 py-2 rounded"
          />
          </div>


          <input placeholder="Google Maps Link" type="url" value={mapLink} onChange={e => setMapLink(e.target.value)} className="w-full border px-4 py-2 rounded" />

          <div>
            <label className="block text-sm font-medium">Select Amenities</label>
            <div className="grid grid-cols-2 gap-2">
              {["Corner Plot", "Gated Community", "RERA Approved", "Water Connection"].map((feature) => (
                <label key={feature} className="flex items-center">
                  <input type="checkbox" checked={selectedAmenities.includes(feature)} onChange={() => handleAmenityToggle(feature)} className="mr-2" />
                  {feature}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg">
            Post Property
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostProperty;
