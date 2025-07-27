import { supabase, handleApiError, retryOperation } from './client';
import {
  Task,
  TaskWithRelations,
  TaskStatus,
  TaskViewFilter,
  TaskCreateOptions,
  TaskUpdateOptions,
  TaskSearchFilters,
} from '@/types';

// Load tasks for a specific view with filters
export const loadTasksForView = async (options: {
  userId: string;
  userType: 'client' | 'helper';
  view: TaskViewFilter;
  filters?: TaskSearchFilters;
}): Promise<TaskWithRelations[]> => {
  const { userId, userType, view, filters } = options;

  let query = supabase
    .from('tasks')
    .select(`
      *,
      bids (
        id,
        helper_id,
        status,
        message,
        proposed_price,
        created_at,
        helper:profiles!bids_helper_id_fkey (
          id,
          full_name,
          avatar_url,
          location
        )
      ),
      client:profiles!tasks_client_id_fkey (
        id,
        full_name,
        avatar_url,
        location
      ),
      helper:profiles!tasks_selected_helper_id_fkey (
        id,
        full_name,
        avatar_url,
        location
      )
    `);

  // Apply view-specific filters
  if (userType === 'helper') {
    switch (view) {
      case 'available':
        query = query.eq('status', 'open');
        break;
      case 'my_bids':
        query = query.eq('bids.helper_id', userId);
        break;
      case 'completed':
        query = query
          .eq('status', 'completed')
          .eq('selected_helper_id', userId);
        break;
    }
  } else {
    query = query.eq('client_id', userId);
  }

  // Apply additional filters
  if (filters) {
    if (filters.category?.length) {
      query = query.in('category', filters.category);
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters.budget_range) {
      if (filters.budget_range.min) {
        query = query.gte('min_price', filters.budget_range.min);
      }
      if (filters.budget_range.max) {
        query = query.lte('max_price', filters.budget_range.max);
      }
    }
  }

  try {
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get a single task by ID with relations
export const getTaskById = async (taskId: string): Promise<TaskWithRelations> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        bids (
          id,
          helper_id,
          status,
          message,
          proposed_price,
          created_at,
          helper:profiles!bids_helper_id_fkey (
            id,
            full_name,
            avatar_url,
            location
          )
        ),
        client:profiles!tasks_client_id_fkey (
          id,
          full_name,
          avatar_url,
          location
        ),
        helper:profiles!tasks_selected_helper_id_fkey (
          id,
          full_name,
          avatar_url,
          location
        )
      `)
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create a new task
export const createTask = async (options: TaskCreateOptions): Promise<Task> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...options,
        client_id: user.id,
        status: 'open',
        payment_status: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    // Log the error for debugging
    console.error('Task creation error:', error);
    
    // If it's already an Error object, throw it directly
    if (error instanceof Error) {
      throw error;
    }
    
    // If it's a Supabase error, extract the message
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(error.message as string);
    }
    
    // Fallback error
    throw new Error('Failed to create task');
  }
};

// Update task status with validation
export const updateTaskStatus = async (options: TaskUpdateOptions): Promise<Task> => {
  const { taskId, newStatus, userId, userType } = options;

  try {
    // Verify task ownership/assignment
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        bids (
          id,
          helper_id,
          status
        )
      `)
      .eq('id', taskId)
      .single();

    if (taskError) throw taskError;
    if (!task) throw new Error('Task not found');

    // Verify permissions
    if (userType === 'client' && task.client_id !== userId) {
      throw new Error('Not authorized to update this task');
    }
    if (userType === 'helper' && task.selected_helper_id !== userId) {
      throw new Error('Not authorized to update this task');
    }

    // Verify status transition
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      open: ['assigned', 'cancelled'],
      assigned: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[task.status].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${task.status} to ${newStatus}`);
    }

    // Get the accepted bid to ensure selected_helper_id is set
    const acceptedBid = task.bids?.find(b => b.status === 'accepted');

    // Update task status
    const updateData: Partial<Task> = {
      status: newStatus,
      payment_status: false,
      updated_at: new Date().toISOString()
    };

    // If task is being completed, ensure selected_helper_id is set
    if (newStatus === 'completed' && acceptedBid) {
      updateData.selected_helper_id = acceptedBid.helper_id;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}; 