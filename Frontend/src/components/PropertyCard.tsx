import React from 'react';
import { Bed, Bath, Square } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Property {
  _id: string;
  title: string;
  location: string;
  totalArea: string;
  developmentType: string;
  developerRatio: string;
  imageUrl: string;
  bhk?: number;
  baths?: number;
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative">
        <img 
          src={`https://landsdevelop.onrender.com${property.imageUrl}`} 
          alt={property.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
          }}
        />
        <span className="absolute top-4 right-4 bg-teal-600 text-white px-3 py-1 rounded-full text-sm">
          {property.developmentType}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
        <p className="text-gray-600 mb-4">{property.location}</p>
        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bhk || 'N/A'} BHK</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.baths || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{property.totalArea}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-md font-bold text-teal-600">
            Ratio: {property.developerRatio}
          </span>
          <Link 
            to={`/project/${property._id}`}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
