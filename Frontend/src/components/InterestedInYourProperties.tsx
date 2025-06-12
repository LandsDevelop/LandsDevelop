import { useEffect, useState } from 'react';
import ListingsSidebar from './ListingsSidebar';

const InterestedInYourProperties = () => {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const ownerEmail = localStorage.getItem('email');
      if (!ownerEmail) return;

      const res = await fetch(`http://localhost:5174/api/interests-owned-by-you/${ownerEmail}`);
      const data = await res.json();
      setRecords(data);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-0 flex">
      <ListingsSidebar activePage="interested" />
      <div className="flex-1 ml-64 px-6 py-10">
        <h1 className="text-3xl font-bold text-teal-800 mb-6">Interested in Your Properties</h1>

        {records.length === 0 ? (
          <p className="text-gray-600">No one has viewed your property contact details yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map((r, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-5">
                <div className="mb-3">
                  <p className="text-sm text-gray-500">Interested Buyer</p>
                  <p className="font-semibold text-gray-800">{r.user?.name || r.userId}</p>
                  <p className="text-sm text-gray-600">{r.user?.email}</p>
                </div>

                <hr className="my-3" />

                <div className="mb-3">
                  <p className="text-sm text-gray-500">Property</p>
                  <p className="font-semibold text-teal-700">
                    {r.propertyId?.title || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {r.propertyId?.location || 'Unknown location'}
                  </p>
                </div>

                <hr className="my-3" />

                <div className="text-sm text-gray-500">
                  Viewed on:{' '}
                  <span className="text-gray-800">
                    {new Date(r.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestedInYourProperties;
