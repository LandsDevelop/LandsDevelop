import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  Building2, MapPin, Users, Ruler, ArrowRight
} from 'lucide-react';
//import PropertyCard from './components/PropertyCard';
import SearchBar from './components/SearchBar';
import Login from './components/Login';
import Navbar from './components/Navbar';
import PostProperty from './components/PostProperty';
import ChatWindow from './components/ChatWindow';
import PropertyDetails from './components/PropertyDetails';
import DevelopmentPlots from './components/DevelopmentPlots';
import ProjectDetails from './components/ProjectDetails';
import AboutUs from './components/AboutUs';
//import UserProfile from './components/UserProfile';

function HomePage() {
  const [searchParams, setSearchParams] = useState({
    location: '',
    propertyType: '',
    area: '',
    areaUnit: 'acres'
  });
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('http://localhost:5174/api/all');
        const data = await res.json();
        console.log("Data fetched:", data); // Add this to debug
        setFeaturedProjects(data.slice(0, 4));
        setFilteredProjects(data.slice(0, 4));
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    };
    fetchProjects();
  }, []);
  

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params);
    const filtered = featuredProjects.filter(project => {
      const locationMatch = !params.location || 
        project.location.toLowerCase().includes(params.location.toLowerCase());
      const typeMatch = !params.propertyType || 
        project.developmentType === params.propertyType;
      const areaMatch = !params.area || 
        parseFloat(project.totalArea) >= parseFloat(params.area);
      return locationMatch && typeMatch && areaMatch;
    });
    setFilteredProjects(filtered);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="container mx-auto px-6 py-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect Development Project
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            Search from premium development opportunities across prime locations. Direct owners. Verified properties.
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {searchParams.location || searchParams.propertyType || searchParams.area 
                ? `Search Results (${filteredProjects.length} projects found)`
                : 'Featured Development Projects'}
            </h2>
            <Link
              to="/development-plots"
              className="text-teal-600 hover:text-teal-700 flex items-center gap-2"
            >
              View All Projects
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Projects Found</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or explore our featured projects.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProjects.map(project => (
                <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
                  <div className="relative h-48">
                    <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    />


                    <div className="absolute top-4 right-4">
                      <span className="bg-teal-600 text-white px-3 py-1.5 rounded-full text-sm">
                        {project.developmentType}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 min-h-[3.5rem]">{project.title}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <p className="text-gray-600 text-sm truncate">{project.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-teal-600" />
                        <div>
                          <p className="text-xs text-gray-600">Total Area</p>
                          <p className="font-semibold text-sm">{project.totalArea}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-teal-600" />
                        <div>
                          <p className="text-xs text-gray-600">Ratio</p>
                          <p className="font-semibold text-sm">{project.developerRatio}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex justify-between items-center pt-4 border-t">
                      <div className="text-teal-600 font-bold text-sm">
                        Advance: {project.advance}
                      </div>
                      <Link
                        to={`/project/${project.id}`}
                        className="bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/post-property" element={<PostProperty />} />
          <Route path="/development-plots" element={<DevelopmentPlots />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/property/:id" element={<PropertyDetails properties={[]} />} />
        </Routes>
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;

// <Route path="/profile" element={<UserProfile />} />