
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../../../types/task";
import { createNotification } from '@/api/notifications';

interface UpdateTaskStatusOptions {
  taskId: string;
  newStatus: Task['status'];
  userId: string;
  userType: 'client' | 'helper';
}

export const updateTaskStatus = async (options: UpdateTaskStatusOptions) => {
  const { taskId, newStatus, userId, userType } = options;

  // First, get the current task state
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (taskError) {
    console.error('Error fetching task:', taskError);
    throw taskError;
  }

  // Verify user has permission to update the task
  if (userType === 'client' && task.client_id !== userId) {
    throw new Error('You do not have permission to update this task');
  }

  if (userType === 'helper' && task.selected_helper_id !== userId) {
    throw new Error('You do not have permission to update this task');
  }

  // Verify the status transition is valid
  const validTransitions: Record<Task['status'], Task['status'][]> = {
    open: ['cancelled', 'in_progress'],
    assigned: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  if (!validTransitions[task.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${task.status} to ${newStatus}`);
  }

  // Update the task status
  const { error: updateError } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId);

  if (updateError) {
    console.error('Error updating task status:', updateError);
    throw updateError;
  }

  // If task is completed, create a notification for the client
  if (newStatus === 'completed') {
    await createNotification({
      userId: task.client_id,
      type: 'task_completed',
      title: 'Task Completed',
      message: `Your task has been marked as completed by the helper.`,
      related_id: taskId
    });
  }

  return { success: true };
}; 
