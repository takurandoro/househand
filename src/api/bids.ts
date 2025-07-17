import { supabase, handleApiError } from './client';
import {
  Bid,
  BidWithRelations,
  BidActionOptions,
  BidSearchFilters,
} from '@/types';
import { createNotification } from '@/api/notifications';

// Handle bid actions (submit, withdraw, accept, reject)
export const handleBid = async (options: BidActionOptions): Promise<Bid | null> => {
  const { taskId, helperId, message, proposedPrice, action, applicationId } = options;

  try {
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
          throw new Error('Task is not open for bids');
        }

        if (!message || !proposedPrice) {
          throw new Error('Message and proposed price are required');
        }

        // Validate proposed price is within budget range
        if (proposedPrice.amount < task.budget_min || proposedPrice.amount > task.budget_max) {
          throw new Error(`Proposed price must be between ${task.budget_min} and ${task.budget_max}`);
        }

        // Check for existing bid
        const { data: existingBid, error: bidCheckError } = await supabase
          .from('bids')
          .select('id')
          .eq('task_id', taskId)
          .eq('helper_id', helperId)
          .eq('status', 'submitted')
          .maybeSingle();

        if (bidCheckError) throw bidCheckError;
        if (existingBid) throw new Error('You already have a pending bid for this task');

        const { data, error } = await supabase
          .from('bids')
          .insert({
            task_id: taskId,
            helper_id: helperId,
            message: message.trim(),
            proposed_price: proposedPrice.amount,
            status: 'submitted',
            created_at: new Date().toISOString()
          })
          .select(`
            *,
            helper:profiles!bids_helper_id_fkey (
              id,
              full_name,
              avatar_url,
              location
            )
          `)
          .single();

        if (error) throw error;

        // Create notification for client
        await createNotification({
          userId: task.client_id,
          type: 'new_bid',
          title: 'New Bid Received',
          message: `A new bid has been submitted for your task.`,
          related_id: taskId
        });

        return data;
      }

      case 'withdraw': {
        const { error } = await supabase
          .from('bids')
          .delete()
          .eq('task_id', taskId)
          .eq('helper_id', helperId)
          .eq('status', 'submitted');

        if (error) throw error;
        return null;
      }

      case 'accept': {
        if (!applicationId) {
          throw new Error('Application ID required for acceptance');
        }

        // Get the bid details
        const { data: bid, error: bidError } = await supabase
          .from('bids')
          .select('*')
          .eq('id', applicationId)
          .single();
        if (bidError) throw bidError;

        // Update task status and selected helper
        const { error: updateError } = await supabase
          .from('tasks')
          .update({
            status: 'in_progress',
            selected_helper_id: bid.helper_id
          })
          .eq('id', taskId);
        if (updateError) throw updateError;

        // Update bid status
        const { error: bidUpdateError } = await supabase
          .from('bids')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('id', applicationId);
        if (bidUpdateError) throw bidUpdateError;

        // Fetch client profile to get phone number
        const { data: clientProfile, error: clientError } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', task.client_id)
          .single();
        let clientPhone = '';
        if (!clientError && clientProfile && clientProfile.phone) {
          clientPhone = clientProfile.phone;
        }

        // Create notification for helper, include client phone in metadata
        await createNotification({
          userId: helperId,
          type: 'bid_accepted',
          title: 'Bid Accepted',
          message: `Your bid has been accepted! You can now start working on the task.`,
          related_id: taskId,
          metadata: clientPhone ? { clientPhone } : undefined
        });

        return bid;
      }

      case 'reject': {
        if (!applicationId) {
          throw new Error('Application ID required for rejection');
        }

        const { data, error } = await supabase
          .from('bids')
          .update({
            status: 'rejected',
            rejected_at: new Date().toISOString()
          })
          .eq('id', applicationId)
          .select(`
            *,
            helper:profiles!bids_helper_id_fkey (
              id,
              full_name,
              avatar_url,
              location
            )
          `)
          .single();

        if (error) throw error;

        // Create notification for helper
        await supabase.from('notifications').insert({
          user_id: helperId,
          type: 'bid_rejected',
          title: 'Bid Rejected',
          message: `Your bid has been rejected.`,
          related_id: taskId,
          created_at: new Date().toISOString()
        });

        return data;
      }

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get bids for a specific task
export const getBidsByTaskId = async (taskId: string): Promise<BidWithRelations[]> => {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        helper:profiles!bids_helper_id_fkey (
          id,
          full_name,
          avatar_url,
          location
        ),
        task:tasks!inner (
          id,
          title,
          description,
          status,
          location,
          budget_min,
          budget_max
        )
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get bids made by a helper
export const getBidsByHelperId = async (
  helperId: string,
  filters?: BidSearchFilters
): Promise<BidWithRelations[]> => {
  try {
    let query = supabase
      .from('bids')
      .select(`
        *,
        task:tasks!inner (
          id,
          title,
          description,
          status,
          location,
          budget_min,
          budget_max,
          client:profiles!tasks_client_id_fkey (
            id,
            full_name,
            avatar_url,
            location
          )
        )
      `)
      .eq('helper_id', helperId);

    // Apply filters
    if (filters) {
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.taskId) {
        query = query.eq('task_id', filters.taskId);
      }
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }
      if (filters.priceRange) {
        if (filters.priceRange.min) {
          query = query.gte('proposed_price', filters.priceRange.min);
        }
        if (filters.priceRange.max) {
          query = query.lte('proposed_price', filters.priceRange.max);
        }
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleApiError(error);
  }
}; 