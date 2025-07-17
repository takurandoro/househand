import { supabase, handleApiError } from './client';
import {
  Profile,
  ClientProfile,
  HelperProfile,
  UserStats,
  UserSearchFilters,
  UserType,
} from '@/types';

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<Profile> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, user_type, email, location, bio, avatar_url, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get client profile with stats
export const getClientProfile = async (userId: string): Promise<ClientProfile> => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        tasks:tasks (count),
        completed_tasks:tasks (count)
      `)
      .eq('id', userId)
      .eq('user_type', 'client')
      .eq('tasks.status', 'completed')
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Client profile not found');

    // Get total amount paid
    const { data: payments, error: paymentsError } = await supabase
      .from('tasks')
      .select('payment_amount')
      .eq('client_id', userId)
      .eq('payment_status', true);

    if (paymentsError) throw paymentsError;

    const totalAmountPaid = payments?.reduce((sum, p) => sum + (p.payment_amount || 0), 0) || 0;

    return {
      ...profile,
      total_tasks_posted: profile.tasks || 0,
      total_tasks_completed: profile.completed_tasks || 0,
      total_amount_paid: { amount: totalAmountPaid, currency: 'RWF' }
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get helper profile with stats
export const getHelperProfile = async (userId: string): Promise<HelperProfile> => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        tasks:tasks (count),
        reviews:reviews (
          rating
        )
      `)
      .eq('id', userId)
      .eq('user_type', 'helper')
      .eq('tasks.status', 'completed')
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Helper profile not found');

    // Calculate average rating
    const ratings = profile.reviews?.map(r => r.rating) || [];
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    // Get earnings
    const { data: earnings, error: earningsError } = await supabase
      .from('helper_earnings')
      .select('amount')
      .eq('helper_id', userId)
      .eq('status', 'paid');

    if (earningsError) throw earningsError;

    const totalEarnings = earnings?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const availableBalance = earnings?.reduce((sum, e) => sum + e.amount, 0) || 0;

    return {
      ...profile,
      helper_since: profile.created_at,
      total_tasks_completed: profile.tasks || 0,
      total_earnings: { amount: totalEarnings, currency: 'RWF' },
      available_balance: { amount: availableBalance, currency: 'RWF' },
      rating: averageRating,
      specialties: profile.specialties || [],
      is_verified: profile.is_verified || false
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update user profile
export const updateProfile = async (
  userId: string,
  profile: Partial<Profile>
): Promise<Profile> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Search for helpers
export const searchHelpers = async (filters: UserSearchFilters): Promise<HelperProfile[]> => {
  try {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        tasks:tasks (count),
        reviews:reviews (
          rating
        )
      `)
      .eq('user_type', 'helper');

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters.specialties?.length) {
      query = query.overlaps('specialties', filters.specialties);
    }
    if (filters.rating_min) {
      query = query.gte('rating', filters.rating_min);
    }
    if (filters.is_verified) {
      query = query.eq('is_verified', true);
    }
    if (filters.has_completed_tasks) {
      query = query.gt('tasks.count', 0);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) throw error;
    return data?.map(profile => ({
      ...profile,
      helper_since: profile.created_at,
      total_tasks_completed: profile.tasks || 0,
      total_earnings: { amount: 0, currency: 'RWF' }, // Don't expose earnings in search
      available_balance: { amount: 0, currency: 'RWF' }, // Don't expose balance in search
      rating: profile.reviews?.reduce((sum, r) => sum + r.rating, 0) / (profile.reviews?.length || 1) || 0,
      specialties: profile.specialties || [],
      is_verified: profile.is_verified || false
    })) || [];
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get user stats
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, user_type, email, location, bio, avatar_url, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    const isHelper = profile.user_type === 'helper';

    // Get tasks count
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('payment_amount')
      .eq(isHelper ? 'selected_helper_id' : 'client_id', userId)
      .eq('status', 'completed');

    if (tasksError) throw tasksError;

    // Calculate stats
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.length || 0;
    const totalAmount = tasks?.reduce((sum, t) => sum + (t.payment_amount || 0), 0) || 0;

    // Get average rating
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq(isHelper ? 'helper_id' : 'client_id', userId);

    if (reviewsError) throw reviewsError;

    const averageRating = reviews?.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : undefined;

    return {
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      total_earnings: isHelper ? { amount: totalAmount, currency: 'RWF' } : undefined,
      total_spent: !isHelper ? { amount: totalAmount, currency: 'RWF' } : undefined,
      average_rating: averageRating,
      member_since: profile.created_at
    };
  } catch (error) {
    throw handleApiError(error);
  }
}; 