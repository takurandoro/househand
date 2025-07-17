import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";
import { createNotification } from '@/api/notifications';

export const updateTaskStatus = async (options: {
  taskId: string;
  newStatus: Task['status'];
  userId: string;
  userType: 'client' | 'helper';
}) => {
  const { taskId, newStatus, userId, userType } = options;

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
  const validTransitions = {
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

  // Verify selected helper for completion
  if (newStatus === 'completed' && !task.selected_helper_id) {
    throw new Error('Cannot complete task without a selected helper');
  }

  // Update task status
  const updateData: any = {
    status: newStatus,
    payment_status: false, // Reset payment status when task is completed
    updated_at: new Date().toISOString()
  };

  // If task is being completed, ensure selected_helper_id is set
  if (newStatus === 'completed' && acceptedBid) {
    updateData.selected_helper_id = acceptedBid.helper_id;
    updateData.completed_at = new Date().toISOString();
  }

  // Ensure required fields are present (min_price, max_price, etc.)
  // If the task object has these fields, include them in the update
  if (typeof task.min_price !== 'undefined') updateData.min_price = task.min_price;
  if (typeof task.max_price !== 'undefined') updateData.max_price = task.max_price;
  if (typeof task.budget_min !== 'undefined') updateData.budget_min = task.budget_min;
  if (typeof task.budget_max !== 'undefined') updateData.budget_max = task.budget_max;
  if (typeof task.effort_level !== 'undefined') updateData.effort_level = task.effort_level;
  if (typeof task.category !== 'undefined') updateData.category = task.category;
  if (typeof task.location !== 'undefined') updateData.location = task.location;
  if (typeof task.title !== 'undefined') updateData.title = task.title;
  if (typeof task.description !== 'undefined') updateData.description = task.description;
  if (typeof task.client_id !== 'undefined') updateData.client_id = task.client_id;

  console.log('Updating task with data:', updateData);

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Supabase update error:', error);
    throw error;
  }

  // Create notification for client when task is completed
  if (newStatus === 'completed') {
    await createNotification({
      userId: task.client_id,
      type: 'task_completed',
      title: 'Task Completed',
      message: `A task has been marked as completed and requires payment.`,
      related_id: taskId
    });
  }

  return data;
}; 