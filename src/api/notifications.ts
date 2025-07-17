import { supabase, handleApiError } from './client';
import {
  Notification,
  NotificationType,
  NotificationPreferences,
  NotificationFilters,
} from '@/types';

// Get user notifications with filters
export const getNotifications = async (
  userId: string,
  filters?: NotificationFilters
): Promise<Notification[]> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (filters) {
      if (filters.type?.length) {
        query = query.in('type', filters.type);
      }
      if (typeof filters.is_read === 'boolean') {
        query = query.eq('is_read', filters.is_read);
      }
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }
      if (filters.related_id) {
        query = query.eq('related_id', filters.related_id);
      }
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleApiError(error);
  }
};

// Mark a single notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Unified notification utility
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  related_id,
  metadata
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string;
  metadata?: Record<string, unknown>;
}) => {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    related_id,
    metadata,
    is_read: false,
    created_at: new Date().toISOString()
  });
  if (error) console.error('Error creating notification:', JSON.stringify(error, null, 2));
};

// Subscribe to real-time notifications
export const subscribeToNotifications = (
  userId: string,
  onNotification: (notification: Notification) => void
) => {
  return supabase
    .channel(`user-notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          onNotification(payload.new as Notification);
        }
      }
    )
    .subscribe();
};

// Get user notification preferences
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update user notification preferences
export const updateNotificationPreferences = async (
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    throw handleApiError(error);
  }
}; 