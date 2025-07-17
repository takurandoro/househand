import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { Task, TaskStatus, TaskViewFilter, TaskUpdateOptions, TaskWithRelations } from '@/types';
import * as tasksApi from '@/api/tasks';
import { useToast } from '@/hooks/use-toast';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export const useTasks = (
  options: {
    userId: string;
    userType: 'client' | 'helper';
    view: TaskViewFilter;
    location?: string;
    effortLevels?: string[];
  },
  queryOptions?: Omit<UseQueryOptions<TaskWithRelations[], Error>, 'queryKey' | 'queryFn'>
) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['tasks', options],
    queryFn: () => tasksApi.loadTasksForView(options),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: (failureCount, error) => {
      // Don't retry on 404 or 403
      if (error instanceof Error && 
          (error.message.includes('not found') || error.message.includes('forbidden'))) {
        return false;
      }
      return failureCount < 3;
    },
    ...queryOptions,
  });
};

export const useTask = (
  taskId: string,
  queryOptions?: Omit<UseQueryOptions<TaskWithRelations, Error>, 'queryKey' | 'queryFn'>
) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getTaskById(taskId),
    enabled: !!taskId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: (failureCount, error) => {
      if (error instanceof Error && 
          (error.message.includes('not found') || error.message.includes('forbidden'))) {
        return false;
      }
      return failureCount < 3;
    },
    ...queryOptions,
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: tasksApi.updateTaskStatus,
    onMutate: async (variables: TaskUpdateOptions) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['task', variables.taskId] });
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData<Task>(['task', variables.taskId]);

      // Optimistically update the task
      if (previousTask) {
        const updatedTask = {
          ...previousTask,
          status: variables.newStatus,
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData(['task', variables.taskId], updatedTask);

        // Also update the task in the tasks list
        queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: Task[] | undefined) => {
          if (!old) return old;
          return old.map(task => 
            task.id === variables.taskId ? updatedTask : task
          );
        });
      }

      return { previousTask };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['task', variables.taskId], data);
      
      // Show success message based on status
      const statusMessages: Record<TaskStatus, string> = {
        'open': 'Task reopened',
        'assigned': 'Task assigned',
        'in_progress': 'Task marked as in progress',
        'completed': 'Task marked as completed',
        'cancelled': 'Task cancelled',
      };

      toast({
        title: 'Success',
        description: statusMessages[variables.newStatus] || 'Task status updated successfully',
      });
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousTask) {
        queryClient.setQueryData(['task', variables.taskId], context.previousTask);
        
        // Also revert in the tasks list
        queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: Task[] | undefined) => {
          if (!old) return old;
          return old.map(task => 
            task.id === variables.taskId ? context.previousTask : task
          );
        });
      }

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update task status',
        variant: 'destructive',
      });
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: (newTask) => {
      // Update tasks cache with new task
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: Task[] | undefined) => {
        if (!old) return [newTask];
        return [newTask, ...old];
      });

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    },
  });
}; 