import { HelperDashboard } from "@/components/helper/HelperDashboard";
import { ClientDashboard } from "@/components/client/ClientDashboard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, MapPin, Heart, Calendar, Clock, Play, X, Eye, Phone, Mail, User, LogOut } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import NotificationBell from "@/components/NotificationBell";
import BidManagement from "@/components/BidManagement";
import { Task, TaskWithRelations, loadTasksForView, updateTaskStatus, handleBid } from "@/lib/tasks";
import { loadHelperEarnings } from "@/lib/tasks/earnings";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from "@/hooks/dashboard/useAuth";
import { useTasks } from "@/hooks/dashboard/useTasks";
import { usePayments } from "@/hooks/dashboard/usePayments";
import { processTaskPayment } from "@/lib/tasks/payments";
import { useClientDetails } from "@/hooks/dashboard/useClientDetails";
import { Profile } from "@/types/user";
import { TaskPaymentDialog } from "@/components/client/TaskPaymentDialog";
import { handleBid as apiHandleBid } from '@/api/bids';

interface UserProfile extends Profile {
  id: string;
  full_name: string;
  phone_number: string;
  user_type: 'client' | 'helper' | null;
  location: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  email: string;
}

interface ClientUserProfile {
  fullName: string;
  email: string;
  memberSince: string;
  location: string;
  phone: string;
  userType: 'client';
}

interface TaskFilters {
  location?: string;
  effortLevels?: string[];
}

const filterTasks = (tasks: TaskWithRelations[], filters: TaskFilters) => {
  return tasks.filter(task => {
    if (filters.location && filters.location !== 'all') {
      // Extract area and district from filter and task
      const [filterArea, filterDistrict] = filters.location.split(', ');
      const [taskArea, taskDistrict] = task.location.split(', ');
      
      // Match both area and district
      if (filterArea !== taskArea || filterDistrict !== taskDistrict) {
        return false;
      }
    }
    return true;
  });
};

const mapUserProfileToClientProfile = (profile: UserProfile): ClientUserProfile => ({
  fullName: profile.full_name || '',
  email: profile.email || '',
  memberSince: profile.created_at,
  location: profile.location || '',
  phone: profile.phone_number || '',
  userType: 'client'
});

const Dashboard = () => {
  const {
    user,
    userProfile,
    userType,
    isLoading: isLoadingAuth,
    handleLogout
  } = useAuth();

  const {
    tasks,
    unpaidTasks,
    isLoadingTasks,
    expandedTaskId,
    setExpandedTaskId,
    filters,
    setFilters,
    acceptBid,
    rejectBid
  } = useTasks(user?.id, userType);

  const {
    showPaymentDialog,
    taskToPayFor,
    handlePaymentRequest,
    handlePaymentDialogClose
  } = usePayments();

  // Track unpaid completed tasks and show payment modal for each
  const unpaidCompletedTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(
      (task) => task.status === "completed" && !task.payment_status
    );
  }, [tasks]);

  // Use a ref to keep track of which tasks have been prompted for payment
  const promptedTaskIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // If no payment dialog is open, find the next unpaid completed task that hasn't been prompted
    if (!showPaymentDialog && unpaidCompletedTasks.length > 0) {
      const nextTask = unpaidCompletedTasks.find(
        (task) => !promptedTaskIdsRef.current.has(task.id)
      );
      if (nextTask) {
        promptedTaskIdsRef.current.add(nextTask.id);
        handlePaymentRequest(nextTask);
      }
    }
    // If all unpaid completed tasks have been prompted, reset the ref if the list changes
    if (
      unpaidCompletedTasks.length === 0 &&
      promptedTaskIdsRef.current.size > 0
    ) {
      promptedTaskIdsRef.current.clear();
    }
  }, [unpaidCompletedTasks, showPaymentDialog, handlePaymentRequest]);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handlePaymentSubmit = async (amount: number) => {
    if (!taskToPayFor || !user) return;
    setIsProcessingPayment(true);
    try {
      await processTaskPayment({
        taskId: taskToPayFor.id,
        clientId: user.id,
        amount
      });
      toast({
        title: 'Success',
        description: 'Payment processed successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      handlePaymentDialogClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const {
    showClientDetailsDialog,
    selectedClient,
    isLoadingClientDetails,
    handleViewClientDetails,
    handleClientDetailsDialogClose
  } = useClientDetails();

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const urlTaskId = searchParams.get('taskId');
    if (urlTaskId && setExpandedTaskId) {
      setExpandedTaskId(urlTaskId);
    }
  }, [searchParams, setExpandedTaskId]);

  // Add a handler to refresh tasks after review
  const handleReviewComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  // Initialize auth and load user profile
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive"
        });
        return;
      }

      // Check task data if user is a helper
      if (profile.user_type === 'helper') {
        try {
          const { data: taskData } = await supabase
            .from('tasks')
            .select('id, status, payment_status')
            .eq('selected_helper_id', user.id);

          console.log('Task data check:', {
            userId: user.id,
            taskCount: taskData?.length || 0,
            completedTasks: taskData?.filter(t => t.status === 'completed')?.length || 0,
            paidTasks: taskData?.filter(t => t.payment_status)?.length || 0
          });
        } catch (error) {
          console.error('Error checking task data:', error);
        }
      }
    };

    initializeAuth();
  }, []);

  // Query for helper earnings
  const { data: earnings = { amount: 0, tasksDone: 0, paidTasks: 0, socialFund: 0, availableForWithdrawal: 0, healthInsurance: 0 }, isLoading: isLoadingEarnings } = useQuery({
    queryKey: ['helper-earnings', user?.id],
    queryFn: () => user?.id ? loadHelperEarnings(user.id) : Promise.resolve({ 
      amount: 0,
      tasksDone: 0,
      paidTasks: 0,
      socialFund: 0,
      availableForWithdrawal: 0,
      healthInsurance: 0
    }),
    enabled: !!user?.id && userType === 'helper'
  });

  // Filter tasks based on user type and filters
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    // Filter by location and effort level
    const filtered = tasks.filter(task => {
      if (filters.location && filters.location !== 'all') {
        // Extract area and district from filter and task
        const [filterArea, filterDistrict] = filters.location.split(', ');
        const [taskArea, taskDistrict] = task.location.split(', ');
        
        // Match both area and district
        if (filterArea !== taskArea || filterDistrict !== taskDistrict) {
          return false;
        }
      }
      return true;
    });

    // For clients, show unpaid completed tasks first
    if (userType === 'client') {
      return filtered.sort((a, b) => {
        if (a.status === 'completed' && !a.payment_status) return -1;
        if (b.status === 'completed' && !b.payment_status) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    // For helpers, show newest tasks first
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tasks, filters, userType]);

  // Handlers
  const handleBidSubmit = async (taskId: string, message: string, proposedPrice: number) => {
    if (!user?.id) return;

    try {
      await handleBid({
        taskId,
        helperId: user.id,
        message,
        proposedPrice,
        action: 'submit'
      });

      toast({
        title: "Success",
        description: "Your bid has been submitted",
        variant: "default"
      });

      // Refresh tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        title: "Error",
        description: "Failed to submit bid",
        variant: "destructive"
      });
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await updateTaskStatus({
        taskId,
        newStatus: 'in_progress',
        userId: user?.id || '',
        userType: userType || 'helper'
      });

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task started"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start task",
        variant: "destructive"
      });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateTaskStatus({
        taskId,
        newStatus: 'completed',
        userId: user?.id || '',
        userType: userType || 'helper'
      });

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task completed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete task",
        variant: "destructive"
      });
    }
  };

  const handleAcceptBid = async (taskId: string, bidId: string, helperId: string) => {
    // Use the API's handleBid function to ensure notifications are created
    await apiHandleBid({
      taskId,
      helperId,
      action: 'accept',
      applicationId: bidId
    });
    // Invalidate/refetch tasks for both client and helper
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['tasks', 'my_bids', helperId] });
    queryClient.invalidateQueries({ queryKey: ['tasks', 'available', helperId] });
  };

  const [globalError, setGlobalError] = useState<string | null>(null);

  // Wrap data fetching in try/catch
  try {
    if (isLoadingAuth) {
      return <div>Loading...</div>;
    }

    if (!user || !userProfile) {
      navigate('/login');
      return null;
    }

    if (globalError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
          <div className="text-2xl font-bold text-red-600 mb-2">Something went wrong</div>
          <div className="text-lg text-red-500 mb-4">{globalError}</div>
          <button className="bg-orange-500 text-white px-4 py-2 rounded" onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
  } catch (error) {
    setGlobalError(error instanceof Error ? error.message : 'Unknown error');
    return null;
  }

  return (
    <>
      {/* Fixed Header Bar */}
      <div className="fixed top-0 left-0 right-0 w-full z-50" style={{ minHeight: '96px' }}>
        {/* Smooth vertical gradient for nav bar */}
        <div className="absolute inset-0 w-full h-full" style={{ background: 'linear-gradient(to bottom, #cc4b07 70%, #a63a05 100%)' }} />
        {/* Header Content */}
        <div className="relative flex justify-between items-center w-full max-w-6xl mx-auto p-4 text-white">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={userProfile.avatar_url || undefined} />
              <AvatarFallback>
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-white">{userProfile.full_name}</h1>
              <p className="text-white/80">{userProfile.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell userId={user.id} />
            <Button variant="outline" onClick={handleLogout} className="text-black bg-white hover:bg-gray-100 border border-gray-200">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      {/* Dashboard Content */}
      <div className="container mx-auto pt-[104px] space-y-6">
      {userType === 'helper' ? (
        <HelperDashboard
          userProfile={userProfile}
          onSubmitBid={handleBidSubmit}
          onStartTask={handleStartTask}
          onCompleteTask={handleCompleteTask}
        />
      ) : (
        <ClientDashboard
          userProfile={{
            fullName: userProfile.full_name,
            email: userProfile.email,
            memberSince: userProfile.created_at,
            location: userProfile.location,
            phone: userProfile.phone_number,
            avatar_url: userProfile.avatar_url
          }}
          tasks={filteredTasks}
          expandedTaskId={expandedTaskId}
          onTaskExpand={setExpandedTaskId}
          onAcceptBid={(taskId: string, bidId: string) => {
            const task = tasks.find(t => t.id === taskId);
            const bid = task?.bids?.find(b => b.id === bidId);
            const helperId = bid?.helper?.id;
            handleAcceptBid(taskId, bidId, helperId);
          }}
          onRejectBid={(taskId: string, applicationId: string) => 
            rejectBid({ taskId, applicationId })
          }
          onPaymentRequest={handlePaymentRequest}
          userId={user.id}
          onReviewComplete={handleReviewComplete}
        />
      )}

      {/* Payment Dialog */}
      <TaskPaymentDialog
        isOpen={showPaymentDialog}
        task={taskToPayFor}
        onClose={handlePaymentDialogClose}
        onPaymentComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          handlePaymentDialogClose();
        }}
      />

      {/* Client Details Dialog */}
      {showClientDetailsDialog && selectedClient && (
        <Dialog open={showClientDetailsDialog} onOpenChange={handleClientDetailsDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Client Details</DialogTitle>
            </DialogHeader>
            {isLoadingClientDetails ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedClient.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedClient.full_name}</h3>
                    <p className="text-gray-500">Member since {new Date(selectedClient.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedClient.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{selectedClient.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{selectedClient.email}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
    </>
  );
};

export default Dashboard;
