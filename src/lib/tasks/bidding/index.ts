import { supabase } from "@/integrations/supabase/client";
import { createNotification } from '@/api/notifications';

export interface HandleBidOptions {
  taskId: string;
  helperId: string;
  message?: string;
  proposedPrice?: number;
  action: 'submit' | 'withdraw' | 'accept' | 'reject';
  applicationId?: string;
}

export const handleBid = async (options: HandleBidOptions) => {
  const { taskId, helperId, message, proposedPrice, action, applicationId } = options;

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

  // Verify task is in a valid state for bidding
  if (task.status !== 'open' && action === 'submit') {
    throw new Error('Task is not open for bids');
  }

  switch (action) {
    case 'submit': {
      // Check if helper already has a bid
      const { data: existingBid, error: bidError } = await supabase
        .from('bids')
        .select('*')
        .eq('task_id', taskId)
        .eq('helper_id', helperId)
        .single();

      if (bidError && bidError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error checking existing bid:', bidError);
        throw bidError;
      }

      if (existingBid) {
        throw new Error('You have already bid on this task');
      }

      // Create new bid
      const { error: createError } = await supabase
        .from('bids')
        .insert({
          task_id: taskId,
          helper_id: helperId,
          message,
          proposed_price: proposedPrice,
          status: 'submitted'
        });

      if (createError) {
        console.error('Error creating bid:', createError);
        throw createError;
      }

      // Create notification for task owner
      await createNotification({
        userId: task.client_id,
        type: 'new_bid',
        title: 'New Bid Received',
        message: `A new bid has been submitted for your task.`,
        related_id: taskId
      });

      break;
    }

    case 'withdraw': {
      if (!applicationId) {
        throw new Error('Application ID is required for withdrawal');
      }

      const { error: withdrawError } = await supabase
        .from('bids')
        .delete()
        .eq('id', applicationId)
        .eq('helper_id', helperId);

      if (withdrawError) {
        console.error('Error withdrawing bid:', withdrawError);
        throw withdrawError;
      }

      break;
    }

    case 'accept': {
      if (!applicationId) {
        throw new Error('Application ID is required for acceptance');
      }

      // Get the bid details
      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (bidError) {
        console.error('Error fetching bid:', bidError);
        throw bidError;
      }

      // Update task status and selected helper
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'in_progress',
          selected_helper_id: bid.helper_id
        })
        .eq('id', taskId);

      if (updateError) {
        console.error('Error updating task:', updateError);
        throw updateError;
      }

      // Update bid status
      const { error: bidUpdateError } = await supabase
        .from('bids')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (bidUpdateError) {
        console.error('Error updating bid:', bidUpdateError);
        throw bidUpdateError;
      }

      // Create notification for helper
      await createNotification({
        userId: helperId,
        type: 'bid_accepted',
        title: 'Bid Accepted',
        message: `Your bid has been accepted! You can now start working on the task.`,
        related_id: taskId
      });

      break;
    }

    case 'reject': {
      if (!applicationId) {
        throw new Error('Application ID is required for rejection');
      }

      // Get the bid details
      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (bidError) {
        console.error('Error fetching bid:', bidError);
        throw bidError;
      }

      // Update bid status
      const { error: bidUpdateError } = await supabase
        .from('bids')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (bidUpdateError) {
        console.error('Error updating bid:', bidUpdateError);
        throw bidUpdateError;
      }

      // Create notification for helper
      await createNotification({
        userId: bid.helper_id,
        type: 'bid_rejected',
        title: 'Bid Rejected',
        message: `Your bid has been rejected.`,
        related_id: taskId
      });

      break;
    }

    default:
      throw new Error(`Invalid action: ${action}`);
  }

  return { success: true };
}; 