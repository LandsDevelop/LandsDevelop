import React from 'react';
import { Bed, Bath, Square } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  type: string;
  beds: number;
  baths: number;
  area: string;
  image: string;
  bhk: number;
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative">
        <img 
          src={`http://localhost:5174${property.image}`} 
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <span className="absolute top-4 right-4 bg-teal-600 text-white px-3 py-1 rounded-full text-sm">
          {property.type}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
        <p className="text-gray-600 mb-4">{property.location}</p>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bhk} BHK</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.baths}</span>
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.area}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-teal-600">{property.price}</span>
          <Link 
            to={`/property/${property.id}`}
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