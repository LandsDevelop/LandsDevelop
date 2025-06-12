import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Ruler, Users } from 'lucide-react';
import ListingsSidebar from './ListingsSidebar';

const UserPostedProperties: React.FC = () => {
  const navigate = useNavigate();
  const [userProperties, setUserProperties] = useState<any[]>([]);

  const fetchProperties = async () => {
    const res = await fetch('http://localhost:5174/api/all');
    const all = await res.json();
    const email = localStorage.getItem('email');
    const filtered = all.filter((p: any) => p.contactEmail === email);
    setUserProperties(filtered);
  };

  const handleCloseDeal = async (id: string) => {
    const token = localStorage.getItem('token');
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
      } else {
        alert(data.error || 'Failed to close deal.');
      }
    } catch (err) {
      alert('Error closing the deal.');
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-0 flex">
      <ListingsSidebar activePage="posted" />
      <div className="flex-1 ml-64 px-6 py-10">
        <h2 className="text-3xl font-bold text-teal-800 mb-6">Your Posted Properties</h2>

        {userProperties.length === 0 ? (
          <p className="text-gray-600">You haven’t posted any properties yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProperties.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition"
              >
                <div className="relative h-48">
                  <img
                    src={`http://localhost:5174${project.imageUrl}`}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                  />
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                    <span className="bg-teal-600 text-white px-3 py-1.5 rounded-full text-sm">
                      {project.developmentType}
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
                  <h3 className="text-lg font-bold mb-2 line-clamp-2 min-h-[3.5rem]">{project.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <p className="text-gray-600 text-sm truncate">{project.location}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-teal-600" />
                      <div>
                        <p className="text-xs text-gray-600">Total Area</p>
                        <p className="font-semibold text-sm">{project.totalArea}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-teal-600" />
                      <div>
                        <p className="text-xs text-gray-600">Ratio</p>
                        <p className="font-semibold text-sm">{project.developerRatio}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-4 border-t">
                    <div className="text-teal-600 font-bold text-sm">
                      Advance: {project.advance}
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
                      className="bg-yellow-500 text-white py-1 px-4 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    {project.dealStatus === 'open' ? (
                      <button
                        onClick={() => handleCloseDeal(project._id)}
                        className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700"
                      >
                        Close Deal
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-400 text-white py-1 px-4 rounded cursor-not-allowed"
                      >
                        Closed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPostedProperties;
