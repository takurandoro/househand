import { supabase } from "@/integrations/supabase/client";
import { TaskViewFilter, TaskWithRelations } from "@/types/task";

interface LoadTasksOptions {
  userId: string;
  userType: 'client' | 'helper';
  view: TaskViewFilter;
  location?: string;
  effortLevels?: string[];
  hours?: string[];
  categories?: string[];
}

export const loadTasksForView = async (options: LoadTasksOptions): Promise<TaskWithRelations[]> => {
  const startTime = performance.now();
  const { userId, userType, view, location, effortLevels } = options;  

  // Simple base query without nested relations to avoid RLS recursion
  let query = supabase
    .from('tasks')
    .select('*');

  let data: any[] = [];
  let error = null;

  if (userType === 'helper') {
    switch (view) {
      case 'available': {
        query = query.eq('status', 'open');

        if (location && location !== 'all') {
          query = query.ilike('location', `%${location}%`);
        }

        if (options.categories && options.categories.length > 0) {
          query = query.in('category', options.categories);
        }

        if (options.hours && options.hours.length > 0) {
          query = query.in('hours', options.hours);
          console.log('🔍 Applying hours filter:', options.hours);
        }

        const result = await query.order('created_at', { ascending: false });
        data = result.data || [];
        error = result.error;
        
        console.log('🔍 Available tasks query result:', {
          hoursFilter: options.hours,
          categoriesFilter: options.categories,
          locationFilter: location,
          tasksFound: data.length,
          sampleTask: data.length > 0 ? data[0] : null
        });
        break;
      }

      case 'my_bids': {
        // Get all tasks where the helper has bids
        const { data: bidData, error: bidError } = await supabase
          .from('bids')
          .select('task_id')
          .eq('helper_id', userId);

        if (bidError) {
          console.error('Error fetching bids:', bidError);
          throw bidError;
        }

        const taskIds = bidData?.map(bid => bid.task_id) || [];
        
        if (taskIds.length > 0) {
          const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .select('*')
            .in('id', taskIds)
            .order('created_at', { ascending: false });
          
          data = taskData || [];
          error = taskError;
        } else {
          data = [];
        }
        break;
      }

      case 'completed': {
        query = query
          .eq('status', 'completed')
          .eq('selected_helper_id', userId)
          .order('created_at', { ascending: false });
        
        const result = await query;
        data = result.data || [];
        error = result.error;
        break;
      }

      default: {
        const result = await query.order('created_at', { ascending: false });
        data = result.data || [];
        error = result.error;
      }
    }
  } else if (userType === 'client') {
    // For clients, show their own tasks
    query = query.eq('client_id', userId);
    const result = await query.order('created_at', { ascending: false });
    data = result.data || [];
    error = result.error;
  }

  if (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Error loading tasks:', errorMsg);
    throw error;
  }

  // Optimize by fetching related data in batches instead of individual queries
  if (data.length === 0) {
    return [];
  }

  // Get all unique IDs for batch queries
  const clientIds = [...new Set(data.map(task => task.client_id))];
  const helperIds = [...new Set(data.filter(task => task.selected_helper_id).map(task => task.selected_helper_id!))];
  const taskIds = data.map(task => task.id);

  // Batch fetch all client profiles
  const { data: clientProfiles, error: clientError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, phone_number, location, email, created_at, updated_at')
    .in('id', clientIds);

  console.log('🔍 Client profiles fetch:', {
    clientIds,
    clientProfiles,
    clientError,
    clientCount: clientProfiles?.length || 0
  });

  // Batch fetch all helper profiles
  const { data: helperProfiles, error: helperError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, location')
    .in('id', helperIds);

  console.log('🔍 Helper profiles fetch:', {
    helperIds,
    helperProfiles,
    helperError,
    helperCount: helperProfiles?.length || 0
  });

  // Batch fetch all bids for all tasks
  const { data: allBids } = await supabase
    .from('bids')
    .select('id, helper_id, task_id, message, proposed_price, status, created_at, accepted_at, rejected_at')
    .in('task_id', taskIds);

  // Get all unique helper IDs from bids
  const bidHelperIds = [...new Set(allBids?.map(bid => bid.helper_id) || [])];

  // Batch fetch all helper profiles for bids
  const { data: bidHelperProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, location')
    .in('id', bidHelperIds);

  // Create lookup maps for fast access
  const clientMap = new Map(clientProfiles?.map(client => [client.id, client]) || []);
  const helperMap = new Map(helperProfiles?.map(helper => [helper.id, helper]) || []);
  const bidHelperMap = new Map(bidHelperProfiles?.map(helper => [helper.id, helper]) || []);

  console.log('🔍 Client map created:', {
    clientMapSize: clientMap.size,
    clientMapKeys: Array.from(clientMap.keys()),
    sampleClient: clientMap.size > 0 ? Array.from(clientMap.values())[0] : null
  });

  // Group bids by task ID
  const bidsByTask = new Map();
  allBids?.forEach(bid => {
    if (!bidsByTask.has(bid.task_id)) {
      bidsByTask.set(bid.task_id, []);
    }
    bidsByTask.get(bid.task_id).push({
      ...bid,
      helper: bidHelperMap.get(bid.helper_id)
    });
  });

  // Enrich tasks with related data
  const enrichedData = data.map(task => {
    const client = clientMap.get(task.client_id);
    const helper = task.selected_helper_id ? helperMap.get(task.selected_helper_id) : null;
    const bids = bidsByTask.get(task.id) || [];
    
    console.log('🔍 Enriching task:', {
      taskId: task.id,
      taskTitle: task.title,
      clientId: task.client_id,
      client: client,
      clientName: client?.full_name || 'NO CLIENT FOUND'
    });
    
    return {
      ...task,
      client,
      helper,
      bids
    };
  });

  const endTime = performance.now();
  console.log(`🚀 Tasks loaded in ${(endTime - startTime).toFixed(2)}ms (${data.length} tasks)`);

  return enrichedData;
}; 