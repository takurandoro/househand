
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { User, Shield, Award, Heart, Globe, Handshake } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-orange-500" />,
      title: "Safe & Secure",
      description: "All helpers are verified with background checks and secure payments"
    },
    {
      icon: <Award className="w-8 h-8 text-orange-500" />,
      title: "Quality Service", 
      description: "Rated helpers with proven track records in household tasks"
    },
    {
      icon: <Heart className="w-8 h-8 text-orange-500" />,
      title: "Social Impact",
      description: "5% of every task contributes to Rwanda's social security fund"
    },
    {
      icon: <Globe className="w-8 h-8 text-orange-500" />,
      title: "Local Community",
      description: "Connecting neighbors and building stronger communities"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-700 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About HouseHand
          </h1>
          <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
            Formalizing domestic work in Rwanda while creating opportunities for everyone
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-black bg-clip-text text-transparent mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              HouseHand is transforming how household tasks are managed in Rwanda. We're creating a platform that 
              provides fair employment opportunities while ensuring quality service for families. Every task completed 
              contributes to formalizing domestic work and building social security for helpers.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gradient-to-r from-orange-50 via-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-black bg-clip-text text-transparent text-center mb-12">
            Why Choose HouseHand?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Impact */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-black bg-clip-text text-transparent mb-8">
            Building Rwanda's Future
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">1,200+</div>
              <div className="text-gray-600">Helpers Employed</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">15,000+</div>
              <div className="text-gray-600">Tasks Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">2.8M RWF</div>
              <div className="text-gray-600">Social Fund Contributions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-orange-500 via-orange-700 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Handshake size={64} className="mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you need help or want to provide services, HouseHand connects you with your community
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
