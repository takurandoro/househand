
import Navigation from '@/components/Navigation';
import TaskCard from '@/components/TaskCard';
import BidModal from '@/components/tasks/BidModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { User, Search, MapPin, Clock, Filter, DollarSign, Star, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/hooks/useAuth';

const Helpers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedEffort, setSelectedEffort] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [sortBy, setSortBy] = useState('newest');
  
  const { getAvailableTasks } = useTask();
  const { user } = useAuth();
  const tasks = getAvailableTasks();

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !selectedLocation || selectedLocation === 'all' || task.location.includes(selectedLocation);
    const matchesEffort = !selectedEffort || selectedEffort === 'all' || task.effort === selectedEffort;
    
    return matchesSearch && matchesLocation && matchesEffort;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'price-high':
        const budgetA = typeof a.budget === 'string' ? parseFloat(a.budget.replace(/[^\d.-]/g, '')) : a.budget;
        const budgetB = typeof b.budget === 'string' ? parseFloat(b.budget.replace(/[^\d.-]/g, '')) : b.budget;
        return budgetB - budgetA;
      case 'price-low':
        const budgetA2 = typeof a.budget === 'string' ? parseFloat(a.budget.replace(/[^\d.-]/g, '')) : a.budget;
        const budgetB2 = typeof b.budget === 'string' ? parseFloat(b.budget.replace(/[^\d.-]/g, '')) : b.budget;
        return budgetA2 - budgetB2;
      case 'newest':
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowBidModal(true);
  };

  const handleBidSubmit = (bidData: any) => {
    console.log('Bid submitted:', bidData);
    setShowBidModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <Navigation />
      
      {/* Header Section */}
      <section className="bg-white border-b border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 via-transparent to-gray-50/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.name?.[0] || 'H'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.name || 'Helper'}
                </h1>
                <p className="text-gray-600 text-lg">Find your next task and start earning</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2 mb-1">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-3xl font-bold text-gray-900">4.8</span>
              </div>
              <p className="text-gray-600">Your rating</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Earnings Card */}
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold">This Month</span>
                </div>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-1">45,000 RWF</div>
                  <div className="text-gray-400 text-sm">Total earned</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <div className="text-lg font-semibold">12</div>
                    <div className="text-gray-400 text-xs">Tasks completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-orange-400">2,250 RWF</div>
                    <div className="text-gray-400 text-xs">Social fund</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">24</div>
                <div className="text-gray-600 text-xs">Completed</div>
              </Card>
              
              <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="text-gray-600 text-xs">This week</div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="pl-10 bg-gray-50 border-gray-200">
                        <SelectValue placeholder="All locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All locations</SelectItem>
                        <SelectItem value="Gasabo">Gasabo</SelectItem>
                        <SelectItem value="Kicukiro">Kicukiro</SelectItem>
                        <SelectItem value="Nyarugenge">Nyarugenge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Effort Level</label>
                  <Select value={selectedEffort} onValueChange={setSelectedEffort}>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All levels</SelectItem>
                      <SelectItem value="Low">Low effort</SelectItem>
                      <SelectItem value="Medium">Medium effort</SelectItem>
                      <SelectItem value="High">High effort</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Task Type</label>
                  <div className="space-y-2">
                    {['Cleaning', 'Cooking', 'Gardening', 'Childcare'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox id={type} />
                        <label htmlFor={type} className="text-sm text-gray-600">{type}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <Card className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-20 py-4 text-lg bg-gray-50 border-gray-200 rounded-xl"
                />
                <Button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800"
                >
                  Search
                </Button>
              </div>
            </Card>

            {/* Tasks Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-gray-900 bg-clip-text text-transparent">
                  Available Tasks
                </h2>
                <p className="text-gray-600 mt-1">Find tasks that match your skills</p>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant={sortBy === 'newest' ? 'default' : 'outline'}
                  onClick={() => setSortBy('newest')}
                  size="sm"
                >
                  Newest
                </Button>
                <Button 
                  variant={sortBy === 'price-high' ? 'default' : 'outline'}
                  onClick={() => setSortBy('price-high')}
                  size="sm"
                >
                  Highest Pay
                </Button>
                <Button 
                  variant={sortBy === 'price-low' ? 'default' : 'outline'}
                  onClick={() => setSortBy('price-low')}
                  size="sm"
                >
                  Lowest Pay
                </Button>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="space-y-6">
              {sortedTasks.map((task) => (
                <div key={task.id} onClick={() => handleTaskClick(task)}>
                  <TaskCard 
                    title={task.title}
                    description={task.description}
                    effort={task.effort}
                    price={task.budget}
                    location={task.location}
                    postedTime={`${Math.floor((Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60))} hours ago`}
                    isHelper={true}
                  />
                </div>
              ))}
              
              {sortedTasks.length === 0 && (
                <Card className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBidModal && selectedTask && (
        <BidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          task={selectedTask}
          onSubmit={handleBidSubmit}
        />
      )}
    </div>
  );
};

export default Helpers;
