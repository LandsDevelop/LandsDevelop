import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location]); // Re-evaluate on route change

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  const scrollToContact = () => {
    if (location.pathname === '/') {
      const contactSection = document.querySelector('#contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/#contact-section';
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white shadow">
      <nav className="bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8" />
            <span className="text-2xl font-bold">LandsDevelop</span>
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-teal-200">Home</Link>
            <Link to="/about" className="hover:text-teal-200">About Us</Link>
            <Link to="/development-plots" className="hover:text-teal-200">Development Plots</Link>
            <button onClick={scrollToContact} className="hover:text-teal-200">Contact</button>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-white text-teal-600 px-4 py-2 rounded-full font-semibold hover:bg-teal-50 flex items-center gap-2"
                >
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-teal-50 flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-teal-50 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="bg-white text-teal-600 px-6 py-2 rounded-full font-semibold hover:bg-teal-50">
                  Login
                </Link>
                <Link to="/post-property" className="border-2 border-white text-white px-6 py-2 rounded-full font-semibold hover:bg-white hover:text-teal-600">
                  Post Property
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
