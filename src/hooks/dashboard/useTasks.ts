import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { TaskWithRelations, loadTasksForView, handleBid } from '@/lib/tasks';
// import { getUnpaidTasks } from '@/lib/paymentUtils';
import { HandleBidOptions } from '@/lib/tasks/bidding';

interface TaskFilters {
  location?: string;
  effortLevels?: string[];
}

export const useTasks = (userId: string | undefined, userType: 'client' | 'helper' | null) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    location: undefined,
    effortLevels: []
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', userType, userId, filters],
    queryFn: async () => {
      if (!userId || !userType) {
        return [];
      }

      try {
        const tasks = await loadTasksForView({
          userId,
          userType,
          view: userType === 'client' ? 'all' : 'available',
          location: filters.location,
          effortLevels: filters.effortLevels
        });

        return tasks;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
        console.error('Error loading tasks:', errorMsg);
        throw error;
      }
    },
    enabled: !!userId && !!userType,
    staleTime: 2 * 60 * 1000, // 2 minutes - match data/useTasks
    gcTime: 10 * 60 * 1000, // 10 minutes - match data/useTasks
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts
    // Keep previous data while loading to prevent flickering
    placeholderData: (previousData) => previousData
  });

  // Query for unpaid tasks (for clients)
  const { data: unpaidTasks = [] } = useQuery({
    queryKey: ['unpaid-tasks', userId],
    queryFn: async () => {
      if (!userId) return [];
      // Fetch all tasks for the client and filter for unpaid completed tasks
      const allTasks = await loadTasksForView({
        userId,
        userType: 'client',
        view: 'all'
      });
      return allTasks.filter(task => task.status === 'completed' && !task.payment_status);
    },
    enabled: !!userId && userType === 'client',
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData
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
        // Unpaid completed tasks first
        if (a.status === 'completed' && !a.payment_status && b.status !== 'completed') return -1;
        if (b.status === 'completed' && !b.payment_status && a.status !== 'completed') return 1;
        
        // Then sort by status priority
        const statusPriority = {
          in_progress: 0,
          assigned: 1,
          open: 2,
          completed: 3,
          cancelled: 4
        };
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];
        if (statusDiff !== 0) return statusDiff;

        // Finally sort by date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    // For helpers, show all tasks including completed ones
    if (userType === 'helper') {
      return filtered.sort((a, b) => {
        // Sort by status priority
        const statusPriority = {
          in_progress: 0,
          assigned: 1,
          open: 2,
          completed: 3,
          cancelled: 4
        };
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];
        if (statusDiff !== 0) return statusDiff;

        // Then sort by date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return filtered;
  }, [tasks, filters, userType]);

  // Mutations for bid actions
  const acceptBidMutation = useMutation({
    mutationFn: async ({ taskId, applicationId }: { taskId: string; applicationId: string }) => {
      return handleBid({
        taskId,
        helperId: applicationId,
        action: 'accept',
        applicationId
      } as HandleBidOptions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Bid accepted successfully",
      });
    },
    onError: (error) => {
      console.error('Error accepting bid:', error);
      toast({
        title: "Error",
        description: "Failed to accept bid",
        variant: "destructive"
      });
    }
  });

  const rejectBidMutation = useMutation({
    mutationFn: async ({ taskId, applicationId }: { taskId: string; applicationId: string }) => {
      return handleBid({
        taskId,
        helperId: applicationId,
        action: 'reject',
        applicationId
      } as HandleBidOptions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Bid rejected successfully",
      });
    },
    onError: (error) => {
      console.error('Error rejecting bid:', error);
      toast({
        title: "Error",
        description: "Failed to reject bid",
        variant: "destructive"
      });
    }
  });

  return {
    tasks: filteredTasks,
    unpaidTasks,
    isLoadingTasks,
    expandedTaskId,
    setExpandedTaskId,
    filters,
    setFilters,
    acceptBid: acceptBidMutation.mutate,
    rejectBid: rejectBidMutation.mutate
  };
}; 