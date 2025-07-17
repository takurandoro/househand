import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import * as notificationsApi from '@/api/notifications';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationPreferences } from '@/types';

const RETRY_DELAY_BASE = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds
const MAX_RETRIES = 5;

export const useNotifications = (userId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Query for notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => notificationsApi.getNotifications(userId!),
    enabled: !!userId,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Mark single notification as read
  const markAsRead = useMutation({
    mutationFn: notificationsApi.markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(['notifications', userId], (old: Notification[] | undefined) => {
        return old?.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read.',
        variant: 'destructive',
      });
    },
  });

  // Mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: () => userId ? notificationsApi.markAllNotificationsAsRead(userId) : Promise.reject('No user ID'),
    onSuccess: () => {
      queryClient.setQueryData(['notifications', userId], (old: Notification[] | undefined) => {
        return old?.map(n => ({ ...n, is_read: true }));
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read.',
        variant: 'destructive',
      });
    },
  });

  // Update notification preferences
  const updatePreferences = useMutation({
    mutationFn: (preferences: Partial<NotificationPreferences>) => {
      if (!userId) throw new Error('No user ID');
      return notificationsApi.updateNotificationPreferences(userId, preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences', userId] });
      toast({
        title: 'Success',
        description: 'Notification preferences updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      });
    },
  });

  // Handle real-time subscription
  useEffect(() => {
    if (!userId) return;

    const setupSubscription = async () => {
      try {
        // Clean up existing subscription if any
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
        }

        const channel = supabase
          .channel(`notifications:${userId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          }, (payload) => {
            const notification = payload.new as Notification;
            
            // Update cache
            queryClient.setQueryData(['notifications', userId], (old: Notification[] | undefined) => {
              return [notification, ...(old || [])];
            });

            // Show toast
            toast({
              title: notification.title,
              description: notification.message,
              variant: notification.type === 'bid_rejected' ? 'destructive' : 'default',
            });
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to notifications');
              retryCountRef.current = 0;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Subscription error:', status);
              
              // Retry logic with exponential backoff
              if (retryCountRef.current < MAX_RETRIES) {
                retryCountRef.current++;
                const delay = Math.min(
                  RETRY_DELAY_BASE * Math.pow(2, retryCountRef.current),
                  MAX_RETRY_DELAY
                );

                console.log(`Retrying subscription in ${delay}ms (attempt ${retryCountRef.current})`);
                
                retryTimeoutRef.current = setTimeout(() => {
                  console.log(`Retrying subscription (attempt ${retryCountRef.current})`);
                  setupSubscription();
                }, delay);
              } else {
                toast({
                  title: 'Connection Error',
                  description: 'Failed to connect to notification service. Please refresh the page.',
                  variant: 'destructive',
                });
              }
            }
          });

        channelRef.current = channel;
      } catch (error) {
        console.error('Error setting up notification subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      clearTimeout(retryTimeoutRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, queryClient, toast]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    updatePreferences: updatePreferences.mutate,
  };
}; 