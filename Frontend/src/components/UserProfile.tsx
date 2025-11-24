import React, { useEffect, useState } from 'react';
import ListingsSidebar from './ListingsSidebar';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('User');
  const [email, setEmail] = useState('Not available');
  const [phone, setPhone] = useState('Not available');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const phone = localStorage.getItem('phone');

    // Redirect if not authenticated
    if (!token) {
      navigate('/');
      return;
    }

    if (name) setName(name);
    if (email) setEmail(email);
    if (phone) setPhone(`+91 ${phone}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 pt-0 flex">
      <ListingsSidebar activePage="profile" />
      <div className="flex-1 ml-64 px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Profile Page</h1>
        <div className="bg-white shadow-md rounded-lg p-6 max-w-lg">
          <p className="text-lg mb-4">
            <strong>Name:</strong> {name}
          </p>
          <p className="text-lg mb-4">
            <strong>Email:</strong> {email}
          </p>
          <p className="text-lg">
            <strong>Phone:</strong> {phone}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
