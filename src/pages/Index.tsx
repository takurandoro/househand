
import Navigation from '@/components/Navigation';
import TaskCard from '@/components/TaskCard';
import SocialFundDisplay from '@/components/SocialFundDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Calendar, Check, Book, Search, MapPin, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTask } from '@/contexts/TaskContext';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();
  const { getAvailableTasks } = useTask();
  
  const featuredTasks = getAvailableTasks().slice(0, 3);

  const handleSearch = () => {
    // Navigate to clients page with search parameters
    const params = new URLSearchParams();
    if (searchQuery) params.set('task', searchQuery);
    if (searchLocation) params.set('location', searchLocation);
    navigate(`/clients?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section - Orange to Black gradient */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-700 to-black text-white">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find help for your
              <span className="block">household tasks</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
              Connect with skilled helpers in Rwanda. Fair pricing, secure payments, 
              and social benefits for everyone.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-full p-2 shadow-lg max-w-2xl">
              <div className="flex items-center">
                <div className="flex-1 px-6 py-3">
                  <div className="text-sm font-semibold text-gray-900">What do you need help with?</div>
                  <input 
                    type="text" 
                    placeholder="Cleaning, washing, yard work..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full text-gray-700 placeholder-gray-500 bg-transparent border-none outline-none"
                  />
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="flex-1 px-6 py-3">
                  <div className="text-sm font-semibold text-gray-900">Location</div>
                  <input 
                    type="text" 
                    placeholder="Kigali, Rwanda"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full text-gray-700 placeholder-gray-500 bg-transparent border-none outline-none"
                  />
                </div>
                <Button 
                  size="lg" 
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 rounded-full h-14 w-14 p-0"
                >
                  <Search size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Link to="/clients" className="group">
              <Card className="h-64 relative overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-600 to-black"></div>
                <CardContent className="relative h-full flex flex-col justify-end p-8 text-white">
                  <User size={48} className="mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">I need help</h3>
                  <p className="text-orange-100">Post your household tasks and get help from verified helpers</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/helpers" className="group">
              <Card className="h-64 relative overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-700 to-black"></div>
                <CardContent className="relative h-full flex flex-col justify-end p-8 text-white">
                  <Calendar size={48} className="mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">I want to help</h3>
                  <p className="text-orange-100">Find household tasks in your area and earn fair income</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tasks */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Tasks near you
            </h2>
            <Link to="/helpers">
              <Button variant="outline" className="border-gray-300">
                Show all
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredTasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                title={task.title}
                description={task.description}
                effort={task.effort}
                price={task.budget}
                location={task.location}
                postedTime={`${Math.floor((Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60))} hours ago`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Social Impact */}
      <section className="py-16 bg-gradient-to-r from-orange-50 via-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-black bg-clip-text text-transparent mb-4">
              Building a better future together
            </h2>
            <p className="text-lg text-gray-600">
              Every task helps formalize domestic work and provides social benefits
            </p>
          </div>
          <SocialFundDisplay />
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-black bg-clip-text text-transparent mb-4">
              Your safety is our priority
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All helpers are verified and tasks are covered by our guarantee
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified helpers</h3>
              <p className="text-gray-600">
                Background checks and ID verification for all helpers
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Rated & reviewed</h3>
              <p className="text-gray-600">
                Community ratings help you choose the right helper
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Book className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure payments</h3>
              <p className="text-gray-600">
                Payments held safely until your task is completed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-black to-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-lg">
                  <User size={20} />
                </div>
                <span className="text-xl font-bold">HouseHand</span>
              </div>
              <p className="text-gray-400">
                Formalizing domestic work and creating opportunities in Rwanda.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Safety Information</li>
                <li>Contact Us</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Guidelines</li>
                <li>Trust & Safety</li>
                <li>Accessibility</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">HouseHand</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HouseHand. Supporting formal employment in Rwanda.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
