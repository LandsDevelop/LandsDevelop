import React, { useState, useCallback, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Load login state initially and whenever storage changes
  const loadAuthData = useCallback(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    setIsLoggedIn(!!token);
    setUserName(name || "");
  }, []);

  useEffect(() => {
    loadAuthData();

    // ✅ Listen for login/logout from other components
    const handleStorageChange = () => loadAuthData();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadAuthData]);

  const openLogin = () => setShowLoginModal(true);
  const closeLogin = () => setShowLoginModal(false);

  // ✅ Called after successful login/signup
  const handleLoginSuccess = useCallback(() => {
    loadAuthData();
    setShowLoginModal(false);
    navigate("/");
  }, [loadAuthData, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate("/");
  };

  const toggleDropdown = () => setShowDropdown((prev) => !prev);
  const goToProfile = () => {
    setShowDropdown(false);
    navigate("/profile");
  };
  const goToListings = () => {
    setShowDropdown(false);
    navigate("/user-properties");
  };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/60 backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-0">
          {/* --- Left: Logo --- */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center">
              <img
                src="https://i.ibb.co/wFzc65dP/lands-develop-official-logo.png"
                alt="LandsDevelop Logo"
                className="h-16 w-auto object-contain ml-4"
              />
            </Link>
          </div>

          {/* --- Center: Navigation Links --- */}
          <div className="flex-1 hidden md:flex items-center justify-center gap-12 text-lg font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition ${
                  isActive
                    ? "text-teal-700 font-semibold"
                    : "text-gray-700 hover:text-teal-700"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/properties"
              className={({ isActive }) =>
                `transition ${
                  isActive
                    ? "text-teal-700 font-semibold"
                    : "text-gray-700 hover:text-teal-700"
                }`
              }
            >
              Properties
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `transition ${
                  isActive
                    ? "text-teal-700 font-semibold"
                    : "text-gray-700 hover:text-teal-700"
                }`
              }
            >
              About
            </NavLink>
          </div>

          {/* --- Right: Buttons --- */}
<div className="flex-1 flex justify-end items-center gap-5 pr-4">
  <button
    onClick={() => {
      const token = localStorage.getItem("token");
      if (!token) {
        // user not logged in → show login popup
        localStorage.setItem("redirectToPost", "true");
        setShowLoginModal(true);
      } else {
        // logged in → navigate directly
        navigate("/post-property");
      }
    }}
    className="rounded-full border-2 border-teal-600 text-teal-700 px-6 py-2.5 text-base font-medium hover:bg-teal-600 hover:text-white transition"
  >
    Post Property
  </button>

  {!isLoggedIn ? (
    <button
      type="button"
      onClick={openLogin}
      className="rounded-full bg-teal-600 px-6 py-2.5 text-base font-semibold text-white hover:bg-teal-700 transition"
    >
      Login
    </button>
  ) : (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="rounded-full bg-teal-600 px-6 py-2.5 text-base font-semibold text-white hover:bg-teal-700 transition"
      >
        Hi, {userName.split(" ")[0]}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
          <button
            onClick={goToProfile}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            My Profile
          </button>
          <button
            onClick={goToListings}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            My Listings
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )}
</div>

        </div>
      </nav>

      <div className="h-20" />

      {/* --- Login Modal --- */}
      {showLoginModal && (
        <LoginModal onClose={closeLogin} onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
};

export default Navbar;
