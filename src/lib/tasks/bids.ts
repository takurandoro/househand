import { supabase } from "@/integrations/supabase/client";

export const handleBid = async (options: {
  taskId: string;
  helperId: string;
  message?: string;
  proposedPrice?: number;
  action: 'submit' | 'withdraw' | 'accept' | 'reject';
  applicationId?: string;
}) => {
  const { taskId, helperId, message, proposedPrice, action, applicationId } = options;

  // Verify task status
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (taskError) throw taskError;
  if (!task) throw new Error('Task not found');

  switch (action) {
    case 'submit': {
      if (task.status !== 'open') {
        throw new Error('Can only submit bids for open tasks');
      }

      const { data, error } = await supabase
        .from('bids')
        .insert({
          task_id: taskId,
          helper_id: helperId,
          message,
          proposed_price: proposedPrice,
          status: 'submitted'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    case 'withdraw': {
      if (!applicationId) {
        throw new Error('Application ID is required for withdrawal');
      }

      const { data, error } = await supabase
        .from('bids')
        .delete()
        .eq('id', applicationId)
        .eq('helper_id', helperId) // Security check
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    case 'accept': {
      if (!applicationId) {
        throw new Error('Application ID is required for acceptance');
      }

      // Start a transaction
      const { data, error } = await supabase.rpc('accept_bid', {
        p_task_id: taskId,
        p_bid_id: applicationId
      });

      if (error) throw error;
      return data;
    }

    case 'reject': {
      if (!applicationId) {
        throw new Error('Application ID is required for rejection');
      }

      const { data, error } = await supabase
        .from('bids')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    default:
      throw new Error(`Invalid action: ${action}`);
  }
}; 