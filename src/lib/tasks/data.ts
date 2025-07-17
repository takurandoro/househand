import { supabase } from "@/integrations/supabase/client";

export const checkTaskData = async (helperId: string) => {
  // Get all tasks with bids for this helper
  const { data: tasksWithBids, error: bidsError } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      status,
      payment_status,
      bids!inner (
        id,
        helper_id
      )
    `)
    .eq('bids.helper_id', helperId);

  if (bidsError) {
    const errorMsg = bidsError instanceof Error ? bidsError.message : JSON.stringify(bidsError);
    console.error('Error checking task data (bids):', errorMsg);
    throw bidsError;
  }

  // Get all completed tasks for this helper
  const { data: completedTasks, error: completedError } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      status,
      payment_status
    `)
    .eq('selected_helper_id', helperId)
    .eq('status', 'completed');

  if (completedError) {
    const errorMsg = completedError instanceof Error ? completedError.message : JSON.stringify(completedError);
    console.error('Error checking task data (completed):', errorMsg);
    throw completedError;
  }

  return {
    tasksWithBids: tasksWithBids.length,
    completedTasks: completedTasks.length,
    paidTasks: completedTasks.filter(t => t.payment_status).length
  };
}; 