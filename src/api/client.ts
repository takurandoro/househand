import { createClient } from '@supabase/supabase-js';
import { ApiResponse } from '@/types';

// Environment validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Base authentication utilities
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone_number, user_type, email, location, bio, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Storage utilities
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
};

// Connectivity utilities
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
};

// Error handling wrapper
export const handleApiError = (error: any): ApiResponse<null> => {
  console.error('API Error:', error);
  
  if (error.code === 'PGRST301') {
    return {
      data: null,
      error: new Error('Authentication required')
    };
  }
  
  if (error.code === 'PGRST204') {
    return {
      data: null,
      error: new Error('Resource not found')
    };
  }
  
  return {
    data: null,
    error: new Error(error.message || 'An unexpected error occurred')
  };
};

// Retry utility with exponential backoff
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
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
  throw new Error('Operation failed after maximum retries');
}; 