// File: InterestShown.tsx
import React, { useEffect, useState } from 'react';
import ListingsSidebar from './ListingsSidebar';
import PropertyCard from './PropertyCard';

const InterestShown: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    const fetchInterestShown = async () => {
      const email = localStorage.getItem('email');
      if (!email) return;

      try {
        const res = await fetch(`https://landsdevelop.onrender.com/api/interests/${email}`);
        const data = await res.json();
        const extracted = data.map((entry: any) => entry.propertyId);
        setProperties(extracted);
      } catch (err) {
        console.error('Failed to load owners you contacted:', err);
      }
    };

    fetchInterestShown();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-0 flex">
      <ListingsSidebar activePage="shown" />
      <div className="flex-1 ml-64 px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-teal-800">Owners You Contacted</h1>

        {properties.length === 0 ? (
          <p className="text-gray-600 text-center">You haven’t shown interest in any properties yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestShown;
