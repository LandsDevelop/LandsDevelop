import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Ruler, Users, IndianRupee } from 'lucide-react';
import { projects } from './DevelopmentPlots';

interface SearchResultsProps {
  searchQuery: string;
}

const PropertySearchResults: React.FC<SearchResultsProps> = ({ searchQuery }) => {
  // Filter projects based on search query
  const filteredProjects = projects.filter(project => {
    const query = searchQuery.toLowerCase();
    return (
      project.location.toLowerCase().includes(query) ||
      project.developmentType.toLowerCase().includes(query) ||
      project.totalArea.toLowerCase().includes(query)
    );
  });

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No matching projects found.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {filteredProjects.map(project => (
        <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
          
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2">{project.title}</h3>
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{project.location}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-teal-600" />
                <div>
                  <p className="text-xs text-gray-600">Total Area</p>
                  <p className="font-semibold">{project.totalArea}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-600" />
                <div>
                  <p className="text-xs text-gray-600">Ratio</p>
                  <p className="font-semibold">{project.developerRatio}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-1 text-teal-600">
                <IndianRupee className="h-4 w-4" />
                <span className="font-bold">{project.goodwill}</span>
              </div>
              <Link
                to={`/project/${project.id}`}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertySearchResults;