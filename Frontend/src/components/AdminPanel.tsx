import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Check, X, Eye, Filter, Search } from 'lucide-react';

interface Property {
  _id: string;
  projectName: string;
  developmentType: string;
  totalArea: string;
  areaUnit: string;
  city: string;
  locality: string;
  societyName?: string;
  landmark: string;
  goodwill: string;
  advance: string;
  imageUrl: string;
  plotDiagramUrl?: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  facing?: string;
  developerRatio?: string;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    developmentType: 'all',
    searchQuery: ''
  });

  useEffect(() => {
    // Check if user is admin
    const phone = localStorage.getItem('phone');
    const adminPhone = '9014011885'; // Your admin phone number
    
    if (phone !== adminPhone) {
      alert('Access denied. Admin only.');
      navigate('/');
      return;
    }

    fetchPendingProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters]);

  const fetchPendingProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://landsdevelop25.onrender.com/api/admin/properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Development type filter
    if (filters.developmentType !== 'all') {
      filtered = filtered.filter(p => p.developmentType === filters.developmentType);
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.locality?.toLowerCase().includes(query) ||
        p.societyName?.toLowerCase().includes(query) ||
        p.city?.toLowerCase().includes(query) ||
        p.developmentType?.toLowerCase().includes(query)
      );
    }

    setFilteredProperties(filtered);
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://landsdevelop25.onrender.com/api/admin/properties/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        alert('Property approved successfully!');
        setProperties(prev => prev.map(p => 
          p._id === id ? { ...p, status: 'approved' as const } : p
        ));
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error approving property:', error);
      alert('Failed to approve property');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this property?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://landsdevelop25.onrender.com/api/admin/properties/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        alert('Property rejected');
        setProperties(prev => prev.map(p => 
          p._id === id ? { ...p, status: 'rejected' as const } : p
        ));
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error rejecting property:', error);
      alert('Failed to reject property');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage property submissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Development Type Filter */}
            <select
              value={filters.developmentType}
              onChange={(e) => setFilters(prev => ({ ...prev, developmentType: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              <option value="villa">Villa</option>
              <option value="standalone">Standalone</option>
              <option value="high-rise">High-rise</option>
              <option value="plotted">Plotted</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total Properties</p>
            <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-6">
            <p className="text-yellow-800 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-900">
              {properties.filter(p => p.status === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-6">
            <p className="text-green-800 text-sm">Approved</p>
            <p className="text-3xl font-bold text-green-900">
              {properties.filter(p => p.status === 'approved').length}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-6">
            <p className="text-red-800 text-sm">Rejected</p>
            <p className="text-3xl font-bold text-red-900">
              {properties.filter(p => p.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              {filteredProperties.length} Properties
            </h2>
          </div>

          <div className="divide-y">
            {filteredProperties.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No properties found matching your filters
              </div>
            ) : (
              filteredProperties.map((property) => (
                <div key={property._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-32 h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={property.imageUrl ? `https://landsdevelop25.onrender.com${property.imageUrl}` : 'https://via.placeholder.com/150'}
                        alt="Property"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {property.societyName || property.locality}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.locality}, {property.city}
                          </div>
                        </div>
                        {getStatusBadge(property.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="ml-1 font-semibold capitalize">{property.developmentType}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Area:</span>
                          <span className="ml-1 font-semibold">{property.totalArea} {property.areaUnit}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="ml-1 font-semibold">{property.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Posted:</span>
                          <span className="ml-1 font-semibold">
                            {new Date(property.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            setSelectedProperty(property);
                            setShowModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>

                        {property.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(property._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(property._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Property Detail Modal */}
      {showModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Property Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Images */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Property Image</h3>
                  <img
                    src={selectedProperty.imageUrl ? `https://landsdevelop25.onrender.com${selectedProperty.imageUrl}` : 'https://via.placeholder.com/400'}
                    alt="Property"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                {selectedProperty.plotDiagramUrl && (
                  <div>
                    <h3 className="font-semibold mb-2">Plot Diagram</h3>
                    <img
                      src={`https://landsdevelop25.onrender.com${selectedProperty.plotDiagramUrl}`}
                      alt="Plot Diagram"
                      className="w-full h-64 object-contain rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Development Type</p>
                    <p className="font-semibold capitalize">{selectedProperty.developmentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Area</p>
                    <p className="font-semibold">{selectedProperty.totalArea} {selectedProperty.areaUnit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-semibold">{selectedProperty.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Locality</p>
                    <p className="font-semibold">{selectedProperty.locality}</p>
                  </div>
                  {selectedProperty.societyName && (
                    <div>
                      <p className="text-sm text-gray-600">Society/Apartment</p>
                      <p className="font-semibold">{selectedProperty.societyName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Landmark</p>
                    <p className="font-semibold">{selectedProperty.landmark}</p>
                  </div>
                  {selectedProperty.facing && (
                    <div>
                      <p className="text-sm text-gray-600">Facing</p>
                      <p className="font-semibold">{selectedProperty.facing}</p>
                    </div>
                  )}
                  {selectedProperty.developerRatio && (
                    <div>
                      <p className="text-sm text-gray-600">Developer Ratio</p>
                      <p className="font-semibold">{selectedProperty.developerRatio}</p>
                    </div>
                  )}
                  {selectedProperty.goodwill && (
                    <div>
                      <p className="text-sm text-gray-600">Goodwill</p>
                      <p className="font-semibold">₹{parseInt(selectedProperty.goodwill).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedProperty.advance && (
                    <div>
                      <p className="text-sm text-gray-600">Advance</p>
                      <p className="font-semibold">₹{parseInt(selectedProperty.advance).toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Contact Phone</p>
                    <p className="font-semibold">{selectedProperty.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    {getStatusBadge(selectedProperty.status)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedProperty.status === 'pending' && (
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => handleApprove(selectedProperty._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    <Check className="h-5 w-5" />
                    Approve Property
                  </button>
                  <button
                    onClick={() => handleReject(selectedProperty._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                  >
                    <X className="h-5 w-5" />
                    Reject Property
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;




