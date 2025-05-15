import React from 'react';
import { Building2, Users, Target, Award, MapPin, Phone, Mail, Clock, Shield, Sparkles } from 'lucide-react';

const AboutUs: React.FC = () => {
  const stats = [
    { label: 'Projects Completed', value: '50+' },
    { label: 'Happy Clients', value: '200+' },
    { label: 'Cities Covered', value: '10+' },
    { label: 'Years Experience', value: '15+' }
  ];

  const team = [
    {
      name: 'Ashok Kumar',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=387&h=387',
      description: 'With over 15 years of experience in real estate development'
    },
    {
      name: 'Vani Reddy',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=387&h=387',
      description: 'Expert in operational excellence and strategic planning'
    },
    {
      name: 'Siva Sai',
      role: 'Legal Advisor',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=387&h=387',
      description: 'Specialized in real estate law and documentation'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Building Tomorrow's Landmarks Today
            </h1>
            <p className="text-xl text-teal-100">
              LandsDevelop is your trusted partner in property development, connecting landowners with developers to create exceptional real estate projects across India.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-teal-600" />
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To revolutionize property development by creating a transparent, efficient, and trustworthy platform that brings together landowners and developers. We aim to facilitate successful partnerships that result in exceptional real estate projects.
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-teal-600" />
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To become India's leading property development facilitator, known for our integrity, innovation, and commitment to excellence. We envision a future where property development is accessible, transparent, and rewarding for all stakeholders.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose LandsDevelop</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Shield className="h-12 w-12 text-teal-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Verified Properties</h3>
            <p className="text-gray-600">
              All properties undergo rigorous verification for clear titles and necessary approvals.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Users className="h-12 w-12 text-teal-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Expert Team</h3>
            <p className="text-gray-600">
              Our experienced professionals guide you through every step of the development process.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Award className="h-12 w-12 text-teal-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Proven Track Record</h3>
            <p className="text-gray-600">
              Successfully facilitated numerous development projects across multiple cities.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-teal-600 mb-2">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Get in Touch</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-teal-600" />
                <div>
                  <h3 className="font-semibold">Office Address</h3>
                  <p className="text-gray-600">406, Vaishnovi TNr, Vaasvi colony, RK Puram, Hyderabad</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-teal-600" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-gray-600">+91 9014011885</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-teal-600" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-600">ashok@landsdevelop.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-teal-600" />
                <div>
                  <h3 className="font-semibold">Business Hours</h3>
                  <p className="text-gray-600">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="email"
                placeholder="Your Email"
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
        </div>
      </div>
    </div>
  );
};

export default AboutUs;