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
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <SearchBar />
        </div>
      </section>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/post-property" element={<PostProperty />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/property/:id" element={<PropertyDetails properties={[]} />} />
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












