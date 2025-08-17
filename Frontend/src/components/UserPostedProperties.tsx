import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Ruler, Users } from 'lucide-react';
import ListingsSidebar from './ListingsSidebar';

const UserPostedProperties: React.FC = () => {
  const navigate = useNavigate();
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const phone = localStorage.getItem('phone');
      
      if (!phone) {
        setError('Phone number not found. Please log in again.');
        return;
      }

      // Try the new phone-based endpoint first
      let res = await fetch(`http://localhost:5174/api/user-properties-by-phone/${phone}`);
      
      if (!res.ok) {
        // Fallback to the old method if the new endpoint doesn't exist yet
        res = await fetch('http://localhost:5174/api/all');
        const all = await res.json();
        const filtered = all.filter((p: any) => p.phone === phone || p.contactPhone === phone);
        setUserProperties(filtered);
      } else {
        const properties = await res.json();
        setUserProperties(properties);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to fetch properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeal = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to close the deal.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5174/api/properties/${id}/close`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await res.json();
      
      if (data.success) {
        setUserProperties((prev) =>
          prev.map((p) => (p._id === id ? { ...p, dealStatus: 'closed' } : p))
        );
        alert('Deal closed successfully!');
      } else {
        alert(data.error || 'Failed to close deal.');
      }
    } catch (err) {
      console.error('Error closing deal:', err);
      alert('Error closing the deal. Please try again.');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to delete the property.');
      return;
    }

    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5174/api/properties/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      
      if (data.success) {
        setUserProperties((prev) => prev.filter((p) => p._id !== id));
        alert('Property deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete property.');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      alert('Error deleting the property. Please try again.');
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-0 flex">
        <ListingsSidebar activePage="posted" />
        <div className="flex-1 ml-64 px-6 py-10">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-gray-600">Loading your properties...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-0 flex">
        <ListingsSidebar activePage="posted" />
        <div className="flex-1 ml-64 px-6 py-10">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchProperties}
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-0 flex">
      <ListingsSidebar activePage="posted" />
      <div className="flex-1 ml-64 px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-teal-800">Your Posted Properties</h2>
          <button
            onClick={() => navigate('/post-property')}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium"
          >
            + Post New Property
          </button>
        </div>

        {userProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <p className="text-gray-600 text-lg mb-4">You haven't posted any properties yet.</p>
              <button
                onClick={() => navigate('/post-property')}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 font-medium"
              >
                Post Your First Property
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              You have {userProperties.length} propert{userProperties.length === 1 ? 'y' : 'ies'} listed
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProperties.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition"
                >
                  <div className="relative h-48">
                    <img
                      src={project.imageUrl ? `http://localhost:5174${project.imageUrl}` : 'https://via.placeholder.com/400x200?text=No+Image'}
                      alt={project.projectName || project.title || 'Property'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
                      }}
                    />
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                      <span className="bg-teal-600 text-white px-3 py-1.5 rounded-full text-sm">
                        {project.developmentType || 'N/A'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                        project.dealStatus === 'closed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {project.dealStatus === 'closed' ? 'Closed' : 'Open'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 min-h-[3.5rem]">
                      {project.projectName || project.title || 'Untitled Property'}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <p className="text-gray-600 text-sm truncate">
                        {project.locality ? `${project.locality}, ${project.city || 'N/A'}` : project.location || 'Location not specified'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-teal-600" />
                        <div>
                          <p className="text-xs text-gray-600">Total Area</p>
                          <p className="font-semibold text-sm">
                            {project.totalArea ? `${project.totalArea} ${project.areaUnit || ''}` : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-teal-600" />
                        <div>
                          <p className="text-xs text-gray-600">Ratio</p>
                          <p className="font-semibold text-sm">{project.developerRatio || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex justify-between items-center pt-4 border-t">
                      <div className="text-teal-600 font-bold text-sm">
                        Advance: ₹{project.advance || 'N/A'}
                      </div>
                      <Link
                        to={`/project/${project._id}`}
                        className="text-sm text-teal-700 underline"
                      >
                        View Details
                      </Link>
                    </div>

                    <div className="flex justify-between gap-2 mt-3">
                      <button
                        onClick={() => navigate(`/edit-property/${project._id}`)}
                        className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>

                      {project.dealStatus === 'open' ? (
                        <button
                          onClick={() => handleCloseDeal(project._id)}
                          className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 text-sm"
                        >
                          Close Deal
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-400 text-white py-1 px-3 rounded cursor-not-allowed text-sm"
                        >
                          Closed
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteProperty(project._id)}
                        className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserPostedProperties;