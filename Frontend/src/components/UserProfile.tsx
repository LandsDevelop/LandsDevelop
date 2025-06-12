import React from 'react';
import ListingsSidebar from './ListingsSidebar';

const UserProfile: React.FC = () => {
  const name = localStorage.getItem('name') || 'User';
  const email = localStorage.getItem('email') || 'Not available';

  return (
    <div className="min-h-screen bg-gray-50 pt-0 flex">
  <ListingsSidebar activePage="profile" />
  <div className="flex-1 ml-64 px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Profile Page</h1>
        <div className="bg-white shadow-md rounded-lg p-6 max-w-lg">
          <p className="text-lg mb-4">
            <strong>Name:</strong> {name}
          </p>
          <p className="text-lg">
            <strong>Email:</strong> {email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;