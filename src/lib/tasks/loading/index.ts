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
  const { userId, userType, view, location, effortLevels } = options;  

  // Base query with common relations
  let query = supabase
    .from('tasks')
    .select(`
      *,
      client:profiles!tasks_client_id_fkey(
        id,
        full_name,
        avatar_url,
        phone_number,
        location,
        email,
        created_at,
        updated_at
      ),
      bids:bids(
        id,
        helper_id,
        task_id,
        message,
        proposed_price,
        status,
        created_at,
        accepted_at,
        rejected_at,
        helper:profiles!bids_helper_id_fkey(
          id,
          full_name,
          avatar_url,
          location
        )
      ),
      helper:profiles!tasks_selected_helper_id_fkey(*)
    `);

  let data: any[] = [];
  let error = null;

  if (userType === 'helper') {
    switch (view) {
      case 'available': {
        query = query.eq('status', 'open');

        if (location && location !== 'all') {
          query = query.ilike('location', `%${location}%`);
        }

        // Remove any references to effort_level in queries, filters, and returned data
        // if (options.hours && options.hours.length > 0) {
        //   query = query.in('hours', options.hours);
        // }

        if (options.categories && options.categories.length > 0) {
          query = query.in('category', options.categories);
        }

        const result = await query.order('created_at', { ascending: false });
        
        // Get helper information for each bid
        if (result.data) {
          const helperIds = new Set(result.data.flatMap(task => 
            task.bids.map((bid: any) => bid.helper_id)
          ));

          // Get helper profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, location')
            .in('id', Array.from(helperIds));

          if (profileError) {
            const errorMsg = profileError instanceof Error ? profileError.message : JSON.stringify(profileError);
            console.error('Error fetching profile data:', errorMsg);
          }

          // Map helper data to tasks
          data = result.data.map(task => ({
            ...task,
            bids: task.bids.map((bid: any) => {
              const helper = profileData?.find(h => h.id === bid.helper_id);
              return {
                ...bid,
                helper: helper ? {
                  id: helper.id,
                  full_name: helper.full_name,
                  avatar_url: helper.avatar_url,
                  location: helper.location
                } : null
              };
            })
          }));
        }
        error = result.error;

        // --- Frontend hours filter ---
        if (options.hours && options.hours.length > 0) {
          const normalize = (s: string | null | undefined) => (s || '').trim().toLowerCase();
          data = data.filter(task => options.hours!.map(normalize).includes(normalize(task.hours)));
        }
        break;
      }

      case 'my_bids': {
        // Get all tasks where the helper has bids
        const { data: bidData, error: bidError } = await supabase
          .from('bids')
          .select('*, task:tasks(*, client:profiles!tasks_client_id_fkey(*)), helper:profiles!bids_helper_id_fkey(id, full_name, avatar_url, location)')
          .eq('helper_id', userId)
          .order('created_at', { ascending: false });

        if (bidError) {
          const errorMsg = bidError instanceof Error ? bidError.message : JSON.stringify(bidError);
          console.error('Error fetching bids:', errorMsg);
          throw bidError;
        }

        // Transform the data to match expected format
        data = bidData?.map(bid => ({
          // Defensive: ensure all required TaskWithRelations fields are present
          id: bid.task?.id || '',
          title: bid.task?.title || '',
          description: bid.task?.description || '',
          category: bid.task?.category || '',
          location: bid.task?.location || '',
          budget_min: bid.task?.budget_min || 0,
          budget_max: bid.task?.budget_max || 0,
          hours: bid.task?.hours || '',
          status: bid.task?.status || '',
          payment_status: bid.task?.payment_status || false,
          has_review: bid.task?.has_review || false,
          client_id: bid.task?.client_id || '',
          selected_helper_id: bid.task?.selected_helper_id || null,
          created_at: bid.task?.created_at || '',
          updated_at: bid.task?.updated_at || '',
          completed_at: bid.task?.completed_at,
          payment_amount: bid.task?.payment_amount,
          payment_date: bid.task?.payment_date,
          agreed_amount: bid.task?.agreed_amount,
          client: bid.task?.client,
          helper: bid.helper ? {
            id: bid.helper.id,
            full_name: bid.helper.full_name,
            avatar_url: bid.helper.avatar_url,
            location: bid.helper.location
          } : null,
          bids: [{
            id: bid.id,
            helper_id: bid.helper_id,
            status: bid.status,
            message: bid.message,
            proposed_price: bid.proposed_price,
            created_at: bid.created_at,
            helper: bid.helper ? {
              id: bid.helper.id,
              full_name: bid.helper.full_name,
              avatar_url: bid.helper.avatar_url,
              location: bid.helper.location
            } : null
          }]
        })) || [];
        break;
      }

      case 'completed': {
        query = query
          .eq('status', 'completed')
          .eq('selected_helper_id', userId)
          .order('created_at', { ascending: false });
        
        const result = await query;
        
        // Get helper profiles
        const { data: helperData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, location')
          .eq('id', userId);

        // Transform the data to include helper information
        if (result.data) {
          data = result.data.map(task => ({
            ...task,
            bids: task.bids.map((bid: any) => ({
              ...bid,
              helper: helperData?.[0] ? {
                id: helperData[0].id,
                full_name: helperData[0].full_name,
                avatar_url: helperData[0].avatar_url,
                location: helperData[0].location
              } : null
            }))
          }));
        }
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

  // Client-side filter for `my_bids`
  let filteredData = data;

  if (view === 'my_bids' && userType === 'helper') {
    filteredData = filteredData.filter((task) => {
      if (task.selected_helper_id === userId) return true;
      if (Array.isArray(task.bids) && task.bids.some(b => b.helper_id === userId)) return true;
      return false;
    });
  }

  return filteredData;
}; 