import { createClient } from '@supabase/supabase-js'
import { Task, TaskCategory } from '@/types'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'househand'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Helper function to get storage URL
export const getStorageUrl = (path: string | null) => {
  if (!path) return null;
  
  // Handle DiceBear URLs
  if (path.startsWith('https://api.dicebear.com')) {
    return path;
  }
  
  // Handle other HTTP URLs
  if (path.startsWith('http')) {
    return path;
  }
  
  // Handle Supabase storage URLs
  if (path.startsWith('/storage/v1/')) {
    return `${supabaseUrl}${path}`;
  }
  
  // Handle relative paths
  if (path.startsWith('/')) {
    return `${supabaseUrl}/storage/v1/object/public${path}`;
  }
  
  // Handle bucket paths
  return `${supabaseUrl}/storage/v1/object/public/avatars/${path}`;
}

// Helper function to get user metadata
export function getUserMetadata(user: { id: string; raw_user_meta_data: any }) {
  console.log('getUserMetadata input:', user);
  
  if (!user || !user.raw_user_meta_data) {
    console.log('No user or metadata, returning null values');
    return {
      id: user?.id || null,
      full_name: null,
      avatar_url: null,
      location: null
    };
  }

  const metadata = user.raw_user_meta_data;
  console.log('Raw metadata:', metadata);
  
  const result = {
    id: user.id,
    full_name: metadata.full_name || null,
    avatar_url: metadata.avatar_url || null,
    location: metadata.location || null
  };
  console.log('Transformed metadata:', result);
  return result;
}

// Helper function to check internet connectivity
export const checkConnectivity = async () => {
  try {
    const response = await fetch(supabaseUrl + '/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Connectivity check failed:', error);
    return false;
  }
}

// Helper function to retry an operation with exponential backoff
export const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const isOnline = await checkConnectivity();
      if (!isOnline) {
        throw new Error('No internet connection');
      }
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const waitTime = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

interface CreateTaskData {
  client_id: string;
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  min_price: number;
  max_price: number;
  hours: string;
  payment_status: boolean;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
}

// Helper function to create a task with retries
export const createTask = async (taskData: CreateTaskData) => {
  return retryOperation(async () => {
    try {
      // First try to create without selecting
      const { error: insertError } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          budget_min: taskData.min_price,
          budget_max: taskData.max_price
        });

      if (insertError) {
        console.error('Error inserting task:', insertError.message, insertError.details, insertError.code, insertError);
        throw insertError;
      }

      // Then fetch the created task
      const { data: tasks, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', taskData.client_id)
        .eq('title', taskData.title)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching created task:', fetchError.message, fetchError.details, fetchError.code, fetchError);
        throw fetchError;
      }

      return tasks[0];
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating task:', error.message, error);
      } else {
        console.error('Error creating task:', error);
      }
      console.error('Task data:', JSON.stringify(taskData, null, 2));
      throw error;
    }
  });
}
