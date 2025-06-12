import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bed, Bath, Square, MapPin, IndianRupee, ArrowLeft, Phone, Mail,
} from 'lucide-react';

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
  dealStatus?: string; // optional
}

const PropertyDetails: React.FC<{ properties: Property[] }> = ({ properties }) => {
  const { id } = useParams();
  const property = properties.find((p) => p.id === Number(id));

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
            <Link to="/" className="text-teal-600 hover:text-teal-700 flex items-center justify-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-6">
        <Link to="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-6 gap-2">
          <ArrowLeft className="h-5 w-5" />
          Back to Listings
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Property Images */}
          <div className="relative h-[400px]">
            <img
              src={`http://localhost:5174${property.image}`}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className="bg-teal-600 text-white px-4 py-2 rounded-full">
                {property.type}
              </span>
            </div>
          </div>

          {/* Property Info */}
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {property.location}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-teal-600 flex items-center gap-2">
                  <IndianRupee className="h-6 w-6" />
                  {property.price}
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Bed className="h-8 w-8 text-teal-600" />
                </div>
                <p className="text-gray-600">Bedrooms</p>
                <p className="text-xl font-semibold">{property.bhk} BHK</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Bath className="h-8 w-8 text-teal-600" />
                </div>
                <p className="text-gray-600">Bathrooms</p>
                <p className="text-xl font-semibold">{property.baths}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Square className="h-8 w-8 text-teal-600" />
                </div>
                <p className="text-gray-600">Area</p>
                <p className="text-xl font-semibold">{property.area}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                This beautiful {property.bhk} BHK property is located in the prime area of {property.location}.
                It offers modern amenities and spacious rooms with excellent ventilation. The property comes with
                {property.baths} bathrooms and covers an area of {property.area}.
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['24/7 Security', 'Power Backup', 'Parking', 'Garden', 'Gym', 'Swimming Pool'].map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-teal-600 rounded-full"></div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="border-t pt-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Owner</h2>

              {property.dealStatus === 'closed' ? (
                <div className="text-red-600 font-semibold">
                  Deal Closed – Contact details are no longer available.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-teal-600" />
                      +91 9014011885
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-teal-600" />
                      ashok@landsdevelop.com
                    </p>
                  </div>
                  <form className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="tel"
                      placeholder="Your Phone"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <textarea
                      placeholder="Your Message"
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    ></textarea>
                    <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors">
                      Send Message
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
