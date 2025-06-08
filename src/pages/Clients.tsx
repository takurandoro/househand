
import Navigation from '@/components/Navigation';
import TaskCard from '@/components/TaskCard';
import PostTaskModal from '@/components/tasks/PostTaskModal';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTask, Task } from '@/contexts/TaskContext';
import AuthModal from '@/components/auth/AuthModal';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const Clients = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [postTaskModalOpen, setPostTaskModalOpen] = useState(false);
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchParams] = useSearchParams();
  const { user, login, signup } = useAuth();
  const { t } = useLanguage();
  const { addTask, getTasksByClient } = useTask();

  const myTasks = user ? getTasksByClient(user.id) : [];

  useEffect(() => {
    // Check if user came from search - auto-open post task modal
    const taskQuery = searchParams.get('task');
    const locationQuery = searchParams.get('location');
    if ((taskQuery || locationQuery) && user) {
      setPostTaskModalOpen(true);
    }
  }, [searchParams, user]);

  const handlePostTask = (taskData: any) => {
    if (!user) return;
    
    addTask({
      ...taskData,
      clientId: user.id,
      clientName: user.name
    });
    
    toast.success('Task posted successfully! Helpers will be notified.');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalOpen(true);
  };

  if (!user || user.role !== 'client') {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-orange-500 via-orange-700 to-black text-white py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <Lock size={64} className="mx-auto mb-6 opacity-80" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Get help with household tasks
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of satisfied clients who found reliable help on HouseHand
              </p>
              <Button 
                onClick={() => setAuthModalOpen(true)}
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3"
              >
                Sign up to get started
              </Button>
            </div>
          </section>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLogin={login}
          onSignup={signup}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-white via-orange-50 to-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-black bg-clip-text text-transparent mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600">
                Manage your tasks and find help for your household needs
              </p>
            </div>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800"
              onClick={() => setPostTaskModalOpen(true)}
            >
              <Plus size={20} className="mr-2" />
              Post new task
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Stats */}
            <Card className="mb-6 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                <CardTitle className="text-lg text-orange-800">Your stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active tasks</span>
                  <Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800">
                    {myTasks.filter(t => t.status === 'active').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In progress</span>
                  <span className="font-semibold">{myTasks.filter(t => t.status === 'in-progress').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold">{myTasks.filter(t => t.status === 'completed').length}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-orange-600">
                    <span className="text-sm">Total bids received</span>
                    <span className="font-semibold">{myTasks.reduce((sum, task) => sum + task.bids.length, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                <CardTitle className="text-lg flex items-center text-orange-800">
                  <Filter size={20} className="mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>All tasks</option>
                    <option>Active</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date range
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>All time</option>
                    <option>This week</option>
                    <option>This month</option>
                    <option>Last month</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search your tasks..." 
                  className="pl-10 h-12 border-orange-200 focus:border-orange-500"
                />
              </div>
            </div>

            {/* My Tasks */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-black bg-clip-text text-transparent mb-6">Your tasks</h2>
              {myTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven't posted any tasks yet</p>
                  <Button 
                    onClick={() => setPostTaskModalOpen(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800"
                  >
                    <Plus size={20} className="mr-2" />
                    Post your first task
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {myTasks.map((task) => (
                    <div key={task.id} onClick={() => handleTaskClick(task)}>
                      <TaskCard 
                        title={task.title}
                        description={task.description}
                        effort={task.effort}
                        price={task.budget}
                        location={task.location}
                        postedTime={`${task.status} - ${task.bids.length} bids received`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PostTaskModal
        isOpen={postTaskModalOpen}
        onClose={() => setPostTaskModalOpen(false)}
        onSubmit={handlePostTask}
      />

      {selectedTask && (
        <TaskDetailModal
          isOpen={taskDetailModalOpen}
          onClose={() => setTaskDetailModalOpen(false)}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default Clients;
