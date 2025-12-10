import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import PostProperty from './components/PostProperty';
import PropertyDetails from './components/PropertyDetails';
import ProjectDetails from './components/ProjectDetails';
import AboutUs from './components/AboutUs';
import UserProfile from './components/UserProfile';
import EditProperty from "./components/EditProperty";
import InterestShown from './components/InterestShown';
import InterestedInYourProperties from './components/InterestedInYourProperties';
import UserPostedProperties from './components/UserPostedProperties';
import SearchBar from './components/SearchBar';
import Footer from './components/footer';
import SearchPage from './components/SearchPage';

function HomePage() {
  return (
    <>
      {/* 🌆 Hero Section */}
      <section
        className="relative bg-cover bg-center h-[90vh] text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Find Your Perfect Land or Property
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl text-gray-200">
            Explore trusted real estate listings across Hyderabad. Post, search, and connect – all in one place.
          </p>
        </div>
      </section>

      {/* 🔍 Smart Search Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
            Search Smarter with LandsDevelop
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Try intelligent location search with typo correction, nearby matches, and property categorization.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* ⚡ Feature Highlights */}
      <section className="py-20 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center">
          <div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
              alt="Smart Search"
              className="mx-auto w-16 h-16 mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
            <p className="text-gray-600">
              Search properties by name, location, or even partial keywords – we'll find the closest matches.
            </p>
          </div>
          <div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
              alt="Verified Listings"
              className="mx-auto w-16 h-16 mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
            <p className="text-gray-600">
              Every property is verified by our moderation team to ensure accurate information.
            </p>
          </div>
          <div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/709/709496.png"
              alt="Easy Posting"
              className="mx-auto w-16 h-16 mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Post Easily</h3>
            <p className="text-gray-600">
              List your property in minutes – add details, upload images, and go live instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 🏙️ Quick Explore Section */}
      <section className="py-20 bg-gray-100 border-t">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            Explore Properties in Popular Locations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Gachibowli",
              "Kondapur",
              "Madhapur",
              "Manikonda",
              "Banjara Hills",
              "Kukatpally",
              "Kokapet",
              "Narsingi",
            ].map((city) => (
              <div
                key={city}
                className="bg-white shadow hover:shadow-lg rounded-xl py-8 px-4 transition cursor-pointer border border-gray-100"
              >
                <h4 className="text-lg font-semibold text-teal-700">{city}</h4>
                <p className="text-gray-500 text-sm mt-2">View Listings</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<SearchPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/post-property" element={<PostProperty />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/edit-property/:id" element={<EditProperty />} />
          <Route path="/interest-shown" element={<InterestShown />} />
          <Route path="/interested-in-your-properties" element={<InterestedInYourProperties />} />
          <Route path="/user-posted-properties" element={<UserPostedProperties />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;