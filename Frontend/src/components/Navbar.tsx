// Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, List } from 'lucide-react';
import LoginModal from './LoginModal';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [listingOpen, setListingOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshAuth = () => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    setIsAuthenticated(!!token);
    setUserName(name);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setListingOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserName(null);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-teal-700">LandsDevelop</Link>

        <div className="flex-1 flex justify-center space-x-6">
          <Link to="/" className="text-teal-700 hover:text-teal-600">Home</Link>
          <Link to="/about" className="text-teal-700 hover:text-teal-600">About Us</Link>
          <Link to="/development-plots" className="text-teal-700 hover:text-teal-600">Development Plots</Link>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              if (isAuthenticated) navigate('/post-property');
              else setShowLoginModal(true);
            }}
            className="border-2 border-teal-600 text-teal-600 px-4 py-2 rounded-full font-semibold hover:bg-white hover:text-teal-600"
          >
            Post Property
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="border-2 border-teal-600 bg-white text-teal-600 px-4 py-2 rounded-full font-semibold hover:bg-teal-50 flex items-center gap-2"
              >
                <User className="h-5 w-5" />
                <span>{userName || 'Account'}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 py-2 border">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-teal-50"
                  >
                    My Profile
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setListingOpen(!listingOpen)}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-teal-50 flex items-center gap-2"
                    >
                      <List className="h-4 w-4" />
                      My Listings
                    </button>

                    {listingOpen && (
                      <div className="mt-1 ml-6 space-y-1">
                        <Link
                          to="/user-posted-properties"
                          className="block px-4 py-2 text-gray-700 hover:bg-teal-50"
                        >
                          Posted Properties
                        </Link>
                        <Link
                          to="/interest-shown"
                          className="block px-4 py-2 text-gray-700 hover:bg-teal-50"
                        >
                          Owners You Contacted
                        </Link>
                        <Link
                          to="/interested-in-your-properties"
                          className="block px-4 py-2 text-gray-700 hover:bg-teal-50"
                        >
                          Interested in Your Properties
                        </Link>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="border-2 border-teal-600 bg-white text-teal-600 px-6 py-2 rounded-full font-semibold hover:bg-teal-50"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onLoginSuccess={refreshAuth} />}
    </nav>
  );
};

export default Navbar;
