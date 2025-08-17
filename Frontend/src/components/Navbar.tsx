// src/components/Navbar.tsx
import React, { useState, useCallback } from "react";
import { Link, NavLink } from "react-router-dom";
import LoginModal from "./LoginModal"; // <-- adjust to "../components/LoginModal" if needed

const Navbar: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const openLogin = () => setShowLoginModal(true);
  const closeLogin = () => setShowLoginModal(false);

  // If you have Redux/Context to refresh auth, do it here
  const handleLoginSuccess = useCallback(() => {
    // e.g., dispatch(fetchMe()) or window.location.reload()
    setShowLoginModal(false);
  }, []);

  return (
    <>
      {/* Top Nav */}
      <nav className="fixed inset-x-0 top-0 z-40 bg-white/90 backdrop-blur shadow">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand / Logo */}
          <Link to="/" className="text-xl font-semibold tracking-tight">
            LandsDevelop
          </Link>

          {/* Desktop links (example) */}
          <div className="hidden items-center gap-6 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm ${isActive ? "font-semibold text-black" : "text-gray-600 hover:text-black"}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/properties"
              className={({ isActive }) =>
                `text-sm ${isActive ? "font-semibold text-black" : "text-gray-600 hover:text-black"}`
              }
            >
              Properties
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm ${isActive ? "font-semibold text-black" : "text-gray-600 hover:text-black"}`
              }
            >
              About Us
            </NavLink>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/post-property"
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:border-gray-400"
            >
              Post Property
            </Link>

            <button
              type="button"
              onClick={openLogin}
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer so content isn't under the fixed navbar */}
      <div className="h-16" />

      {/* Login Modal (popup) */}
      {showLoginModal && (
        <LoginModal onClose={closeLogin} onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
};

export default Navbar;
