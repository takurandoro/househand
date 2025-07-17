import { supabase } from "@/integrations/supabase/client";
import { TaskViewFilter, TaskWithRelations } from "@/types";

export const loadTasksForView = async (options: {
  userId: string;
  userType: 'client' | 'helper';
  view: TaskViewFilter;
  location?: string;
  effortLevels?: string[];
}) => {
  const { userId, userType, view, location, effortLevels } = options;

  // Base query with essential fields
  let query = supabase
    .from('tasks')
    .select(`
      *,
      client:profiles!tasks_client_id_fkey (
        id,
        full_name,
        avatar_url
      ),
      bids (
        id,
        helper_id,
        proposed_price,
        status,
        created_at,
        helper:profiles (
          id,
          full_name,
          avatar_url
        )
      )
    `);

  // Apply filters based on user type
  if (userType === 'client') {
    query = query
      .eq('client_id', userId)
      .order('created_at', { ascending: false });
  } else {
    // Helper view
    if (view === 'available') {
      query = query.eq('status', 'open');
      
      if (location && location !== 'all') {
        query = query.ilike('location', `%${location}%`);
      }
      
      if (effortLevels?.length) {
        query = query.in('effort_level', effortLevels);
      }
    } else if (view === 'my_bids') {
      query = query.neq('status', 'completed');
    } else if (view === 'completed') {
      query = query
        .eq('status', 'completed')
        .eq('selected_helper_id', userId);
    }
    
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error loading tasks:', error);
    throw error;
  }

  // Filter my_bids view after fetching
  if (userType === 'helper' && view === 'my_bids' && data) {
    return data.filter(task => 
      task.bids?.some(bid => bid.helper_id === userId)
    );
  }

  return data || [];
}; 