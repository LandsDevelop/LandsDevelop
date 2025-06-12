import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Project {
  _id: string;
  title: string;
  location: string;
  totalArea: string;
  dimensions?: string;
  developmentType: string;
  developerRatio: string;
  goodwill: string;
  advance: string;
  facing: string;
  imageUrl: string;
}

const DevelopmentPlots = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('http://localhost:5174/api/all');
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = selectedType
    ? projects.filter(p => p.developmentType === selectedType)
    : projects;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Development Projects</h2>
          <Link
            to="/post-property"
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
          >
            Post New Project
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {[
            'villa',
            'highrise',
            'mixed',
            'plotted',
            'standalone'
          ].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(selectedType === type ? '' : type)}
              className={`px-4 py-2 rounded-lg border ${
                selectedType === type
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {filteredProjects.length === 0 ? (
          <p className="text-gray-600">No projects available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map(project => (
              <Link
                key={project._id}
                to={`/project/${project._id}`}
                className="block bg-white rounded-xl shadow p-4 hover:shadow-lg transition"
              >
                <img
                  src={`http://localhost:5174${project.imageUrl}`}
                  alt={project.title}
                  className="w-full h-48 object-cover rounded mb-4"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
                  }}
                />
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-700"><strong>Location:</strong> {project.location}</p>
                <p><strong>Total Area:</strong> {project.totalArea}</p>
                <p><strong>Development Type:</strong> {project.developmentType}</p>
                <p><strong>Ratio:</strong> {project.developerRatio}</p>
                <p><strong>Goodwill:</strong> {project.goodwill}</p>
                <p><strong>Advance:</strong> {project.advance}</p>
                <p><strong>Facing:</strong> {project.facing}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopmentPlots;
