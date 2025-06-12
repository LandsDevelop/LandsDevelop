// File: ListingsSidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const ListingsSidebar: React.FC<{ activePage: string }> = ({ activePage }) => {
  const linkClass = (page: string) =>
    `block w-full text-left px-4 py-3 text-sm font-medium rounded-none ${
      activePage === page
        ? 'bg-[#b2f5ea] text-teal-900 font-semibold'
        : 'text-gray-800 hover:bg-gray-100'
    }`;

  const divider = <hr className="border-gray-300" />;

  return (
    <aside className="w-full sm:w-64 bg-white border-r min-h-screen pt-16 fixed top-0 left-0 z-40">
      <div className="p-2">
        <h2 className="text-sm text-gray-600 font-semibold px-4 py-2 mb-2">Manage your Account</h2>

        <div className="flex flex-col gap-0 border border-gray-200 rounded-md overflow-hidden">
          <Link to="/profile" className={linkClass('profile')}>
            Profile Page
          </Link>
          {divider}
          <Link to="/user-posted-properties" className={linkClass('posted')}>
            Posted Properties
          </Link>
          {divider}
          <Link to="/interest-shown" className={linkClass('shown')}>
            Owners You Contacted
          </Link>
          {divider}
          <Link to="/interested-in-your-properties" className={linkClass('interested')}>
            Interested in Your Properties
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default ListingsSidebar;
