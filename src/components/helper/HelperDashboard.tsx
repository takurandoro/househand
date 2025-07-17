
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadTasksForView } from "@/lib/tasks";
import { TaskFilters } from './TaskFilters';
import { TaskList } from './TaskList';
import { EarningsDisplay } from './EarningsDisplay';
import { WithdrawalDialog } from './WithdrawalDialog';
import { BidDialog } from './BidDialog';
import { useHelperEarnings } from '@/hooks/dashboard/useHelperEarnings';
import { withdrawHelperEarnings } from '@/lib/tasks/earnings';
import { TaskWithRelations } from '@/types/task';
import { Activity, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { handleBid } from '@/lib/tasks/bidding';

interface DisplayHelperEarnings {
  totalEarnings: number;
  taskCount: number;
  healthInsurance: number;
  averageRating: number;
  reviewCount: number;
  availableForWithdrawal: number;
}

interface WithdrawalHelperEarnings {
  availableForWithdrawal: number;
}

interface HelperDashboardProps {
  userProfile: {
    id: string;
    full_name: string;
    avatar_url?: string;
    location?: string;
  };
  onSubmitBid: (taskId: string, message: string, proposedPrice: number) => void;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export const HelperDashboard: React.FC<HelperDashboardProps> = ({
  userProfile,
  onSubmitBid,
  onStartTask,
  onCompleteTask
}) => {
  // State - Updated filters to use hours and category instead of location and effort levels
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [activeTab, setActiveTab] = useState('available');
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isMedicalCardOpen, setIsMedicalCardOpen] = useState(false);

  useEffect(() => {
    if (isReviewsModalOpen && userProfile.id) {
      setIsLoadingReviews(true);
      supabase
        .from('helper_reviews')
        .select(`
          id, rating, comment, created_at,
          client:client_id (id, full_name, avatar_url),
          task:task_id (id, title)
        `)
        .eq('helper_id', userProfile.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          setIsLoadingReviews(false);
          if (error) return setReviews([]);
          setReviews(data || []);
        });
    }
  }, [isReviewsModalOpen, userProfile.id]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries - Updated to use new filter parameters
  const { data: availableTasks = [], isLoading: isLoadingAvailable } = useQuery<TaskWithRelations[]>({
    queryKey: ['tasks', 'available', userProfile.id, selectedHours, selectedCategories],
    queryFn: () => loadTasksForView({
      userId: userProfile.id,
      userType: 'helper',
      view: 'available',
      hours: selectedHours,
      categories: selectedCategories
    })
  });

  const { data: myBids = [], isLoading: isLoadingBids } = useQuery<TaskWithRelations[]>({
    queryKey: ['tasks', 'my_bids', userProfile.id],
    queryFn: () => loadTasksForView({
      userId: userProfile.id,
      userType: 'helper',
      view: 'my_bids'
    })
  });

  // Earnings
  const { earnings, isLoading: isLoadingEarnings } = useHelperEarnings(userProfile.id, 'helper');

  // Calculate health insurance as 5% of total earnings
  const calculatedHealthInsurance = Math.round((earnings.totalEarnings || 0) * 0.05);
  // Transform earnings for display
  const displayEarnings: DisplayHelperEarnings = {
    totalEarnings: earnings.totalEarnings,
    taskCount: earnings.taskCount, // Use the correct completedTasks count
    healthInsurance: calculatedHealthInsurance,
    averageRating: earnings.averageRating,
    reviewCount: earnings.reviewCount,
    availableForWithdrawal: earnings.availableForWithdrawal
  };

  // Transform earnings for withdrawal
  const withdrawalEarnings: WithdrawalHelperEarnings = {
    availableForWithdrawal: earnings.availableForWithdrawal
  };

  // Stats logic
  const activeTasks = myBids.filter(task => task.status === 'assigned' || task.status === 'in_progress');
  const pendingTasks = myBids.filter(task => task.status === 'open' && task.bids && task.bids.some(bid => bid.status === 'submitted'));
  const completedTasks = myBids.filter(task => task.status === 'completed');

  // Debug logs for stats
  console.log('myBids:', myBids);
  myBids.forEach((task, idx) => {
    console.log(`Task[${idx}] id:`, task.id, 'status:', task.status, 'bids:', task.bids);
  });
  console.log('activeTasks:', activeTasks);
  console.log('completedTasks:', completedTasks);
  console.log('pendingTasks:', pendingTasks);

  // Updated handlers for new filter system
  const handleHoursChange = (hours: string) => {
    setSelectedHours(prev => {
      if (prev.includes(hours)) {
        return prev.filter(h => h !== hours);
      }
      return [...prev, hours];
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  };

  const handleBidClick = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setIsBidDialogOpen(true);
  };

  const handleBidSubmit = async (taskId: string, message: string, price: number) => {
    try {
      await onSubmitBid(taskId, message, price);
      setIsBidDialogOpen(false);
      setSelectedTask(null);
    } catch (error) {
      let errorMsg = 'Failed to submit bid';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMsg = (error as any).message;
      } else {
        errorMsg = JSON.stringify(error);
      }
      toast({
        title: 'Bid Submission Failed',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };

  // Add withdraw bid handler
  const handleWithdrawBid = async (taskId: string, bidId: string) => {
    try {
      // Withdraw the bid (set status to 'submitted' or delete, and unassign task)
      await handleBid({
        taskId,
        helperId: userProfile.id,
        action: 'withdraw',
        applicationId: bidId
      });
      // Unassign the helper and reopen the task
      await supabase.from('tasks').update({
        status: 'open',
        selected_helper_id: null
      }).eq('id', taskId);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Bid withdrawn',
        description: 'You have withdrawn your bid and the task is now open again.'
      });
    } catch (error) {
      let message = 'Failed to withdraw bid';
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        message = 'Network error: Could not connect to the server.';
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    }
  };

  // Updated withdrawal handler to send 5% to social fund
  const handleWithdraw = async (mobileNumber: string, bankAccount: string) => {
    if (isWithdrawing) return;
    setIsWithdrawing(true);
    try {
      // Log available balance and user id for debugging
      console.log('Attempting withdrawal for user:', userProfile.id, 'Available:', earnings.availableForWithdrawal);
      if (!earnings.availableForWithdrawal || earnings.availableForWithdrawal <= 0) {
        toast({
          title: 'Withdrawal Failed',
          description: 'No funds available for withdrawal.',
          variant: 'destructive'
        });
        setIsWithdrawing(false);
        return;
      }
      // For now, just log the values. In the future, pass them to the backend/API.
      console.log('Processing withdrawal with:', { mobileNumber, bankAccount });
      const result = await withdrawHelperEarnings(userProfile.id);
      toast({
        title: "Withdrawal Successful",
        description: `${result.withdrawnAmount} RWF withdrawn`,
      });
      setIsWithdrawDialogOpen(false);
      // Invalidate helper-earnings query to refresh health insurance and earnings
      queryClient.invalidateQueries({ queryKey: ['helper-earnings', userProfile.id] });
    } catch (error) {
      console.error('Withdrawal error:', error);
      let errorMsg = 'Unknown error';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMsg = (error as any).message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else {
        errorMsg = JSON.stringify(error);
      }
      toast({
        title: "Failed to withdraw earnings",
        description: errorMsg,
        variant: "destructive"
      });
      // Extra debug log
      console.error('Withdrawal error details:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {userProfile.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Manage your tasks and track your earnings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
            {/* Glossy overlay - black gradient */}
            <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(120deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.10) 60%, rgba(0,0,0,0.05) 100%)', zIndex: 1}} />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-md">
                  <Activity className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-white drop-shadow">Active Tasks</p>
                  <p className="text-2xl font-bold text-white drop-shadow">{activeTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
            {/* Glossy overlay - black gradient */}
            <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(120deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.10) 60%, rgba(0,0,0,0.05) 100%)', zIndex: 1}} />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-md">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-white drop-shadow">Completed</p>
                  <p className="text-2xl font-bold text-white drop-shadow">{completedTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
            {/* Glossy overlay - black gradient */}
            <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(120deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.10) 60%, rgba(0,0,0,0.05) 100%)', zIndex: 1}} />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-md">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-white drop-shadow">Pending</p>
                  <p className="text-2xl font-bold text-white drop-shadow">{pendingTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
            {/* Glossy overlay - black gradient */}
            <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(120deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.10) 60%, rgba(0,0,0,0.05) 100%)', zIndex: 1}} />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-md">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-white drop-shadow">Available</p>
                  <p className="text-2xl font-bold text-white drop-shadow">{availableTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Display */}
        <EarningsDisplay
          earnings={displayEarnings}
          onWithdraw={() => setIsWithdrawDialogOpen(true)}
          onSeeAllReviews={() => setIsReviewsModalOpen(true)}
          onShowMedicalCard={() => setIsMedicalCardOpen(true)}
        />
        {/* Medical Aid Card Modal */}
        <Dialog open={isMedicalCardOpen} onOpenChange={setIsMedicalCardOpen}>
          <DialogContent className="max-w-sm bg-yellow-50">
            <DialogHeader>
              <DialogTitle>Virtual Medical Aid Card</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              {/* Lifeline Logo - sits directly on modal background */}
              <img src="/lifeline-logo.png" alt="Lifeline Logo" className="h-20" style={{objectFit: 'contain'}} />
              <div className="w-full max-w-xs rounded-2xl bg-gradient-to-br from-blue-100 via-white to-blue-50 shadow-xl border border-blue-200 p-0 overflow-hidden card-virtual-medical">
                <div className="flex items-center justify-between px-5 pt-4 pb-2 bg-blue-700">
                  <span className="text-lg font-bold text-white tracking-wide">Lifeline Medical Aid</span>
                  <img src="/lifeline-logo.png" alt="Lifeline Logo" className="h-8 ml-2" style={{objectFit: 'contain'}} />
                </div>
                <div className="px-5 py-4 flex flex-col gap-2">
                  <div className="text-base font-semibold text-gray-900 mb-1">{userProfile.full_name}</div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Principle Member</span>
                    <span className="font-mono text-blue-900">{userProfile.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Employer</span>
                    <span className="font-semibold text-blue-700">HouseHand</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Valid From</span>
                    <span className="font-semibold">{new Date().getFullYear()}-01-01</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Valid Till</span>
                    <span className="font-semibold">{new Date().getFullYear()}-12-31</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Subscriptions</span>
                    <span className="font-semibold text-blue-700">Clinical, Pathological</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Gov/National ID</span>
                    <span className="font-semibold text-red-500">KYC Disabled</span>
                  </div>
                </div>
                <div className="px-5 pb-3 flex justify-end">
                  <span className="text-xs text-blue-700 font-semibold">Insured by Lifeline</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reviews Modal */}
        <Dialog open={isReviewsModalOpen} onOpenChange={setIsReviewsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>All Reviews</DialogTitle>
            </DialogHeader>
            <div className="py-2 max-h-[60vh] overflow-y-auto">
              {isLoadingReviews ? (
                <div className="text-center text-muted-foreground">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center text-muted-foreground">No reviews yet.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-md px-3 py-2 bg-muted/50">
                      <div className="flex items-center gap-2">
                        <img
                          src={review.client?.avatar_url || '/placeholder.svg'}
                          alt={review.client?.full_name || 'Client'}
                          className="w-7 h-7 rounded-full object-cover border"
                        />
                        <span className="font-medium text-sm truncate max-w-[100px]">{review.client?.full_name || 'Client'}</span>
                        <span className="text-xs text-muted-foreground ml-2 truncate max-w-[120px]">{review.task?.title || 'Task'}</span>
                        <span className="ml-auto flex items-center gap-1 text-sm">
                          <span className="font-bold text-yellow-600">{review.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </span>
                      </div>
                      {review.comment && (
                        <div className="text-sm text-foreground mt-1">"{review.comment}"</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">{new Date(review.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Task Management */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Updated to use hours and category */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Filters</span>
                  {(selectedHours.length > 0 || selectedCategories.length > 0) && (
                    <Badge variant="secondary" className="ml-auto">
                      {selectedHours.length + selectedCategories.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskFilters
                  selectedHours={selectedHours}
                  selectedCategories={selectedCategories}
                  onHoursChange={handleHoursChange}
                  onCategoryChange={handleCategoryChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Tasks Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b px-6 py-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="available" className="relative">
                        Available Tasks
                        {availableTasks.length > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 text-xs">
                            {availableTasks.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="my_bids" className="relative">
                        My Bids
                        {myBids.length > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 text-xs">
                            {myBids.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="completed" className="relative">
                        Completed
                        {completedTasks.length > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 text-xs">
                            {completedTasks.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    <TabsContent value="available" className="mt-0">
                      {isLoadingAvailable ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : availableTasks.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No available tasks at the moment</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Check back later for new opportunities
                          </p>
                        </div>
                      ) : (
                        <TaskList
                          tasks={availableTasks}
                          userId={userProfile.id}
                          onBidClick={handleBidClick}
                          onStartTask={onStartTask}
                          onCompleteTask={onCompleteTask}
                          onWithdrawBid={() => {}}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="my_bids" className="mt-0">
                      {isLoadingBids ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : myBids.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No active bids</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Browse available tasks to submit your first bid
                          </p>
                        </div>
                      ) : (
                        <TaskList
                          tasks={myBids}
                          userId={userProfile.id}
                          onBidClick={handleBidClick}
                          onStartTask={onStartTask}
                          onCompleteTask={onCompleteTask}
                          onWithdrawBid={handleWithdrawBid}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="completed" className="mt-0">
                      {isLoadingBids ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : completedTasks.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No completed tasks yet</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Completed tasks will appear here
                          </p>
                        </div>
                      ) : (
                        <TaskList
                          tasks={completedTasks}
                          userId={userProfile.id}
                          onBidClick={handleBidClick}
                          onStartTask={onStartTask}
                          onCompleteTask={onCompleteTask}
                          onWithdrawBid={() => {}}
                        />
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialogs */}
        <BidDialog
          isOpen={isBidDialogOpen}
          task={selectedTask}
          onClose={() => {
            setIsBidDialogOpen(false);
            setSelectedTask(null);
          }}
          onSubmit={handleBidSubmit}
        />

        <WithdrawalDialog
          isOpen={isWithdrawDialogOpen}
          isWithdrawing={isWithdrawing}
          onClose={() => setIsWithdrawDialogOpen(false)}
          onConfirm={handleWithdraw}
          earnings={withdrawalEarnings}
        />
      </div>
    </div>
  );
};
