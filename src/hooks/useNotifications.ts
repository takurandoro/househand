import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Notification {
  id: string;
  user_id: string;
  type: 'new_bid' | 'bid_accepted' | 'bid_rejected' | 'task_completed';
  title: string;
  message: string;
  task_id?: string;
  application_id?: string;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout: NodeJS.Timeout;
    let mounted = true;
    let currentChannel: RealtimeChannel | null = null;

    // Load existing notifications
    const loadNotifications = async () => {
      try {
        console.log('Loading notifications for user:', userId);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error loading notifications:', error);
          return;
        }

        if (mounted) {
          console.log('Loaded notifications:', data?.length || 0);
          setNotifications(data || []);
          setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        }
      } catch (error) {
        console.error('Error in loadNotifications:', error);
      }
    };

    // Subscribe to real-time notifications
    const setupSubscription = () => {
      try {
        console.log('Setting up notification subscription for user:', userId);
        const channelName = `realtime:notifications:${userId}`;
        console.log('Channel name:', channelName);
        
        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`
            },
            (payload) => {
              if (!mounted) return;

              try {
                console.log('Received notification payload:', payload);
                if (payload.eventType === 'INSERT') {
                  const newNotification = payload.new as Notification;
                  setNotifications(prev => [newNotification, ...prev]);
                  setUnreadCount(prev => prev + 1);
                  
                  toast({
                    title: newNotification.title,
                    description: newNotification.message,
                    variant: newNotification.type === 'bid_rejected' ? 'destructive' : 'default'
                  });
                } else if (payload.eventType === 'UPDATE') {
                  const updatedNotification = payload.new as Notification;
                  setNotifications(prev => 
                    prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
                  );
                } else if (payload.eventType === 'DELETE') {
                  const deletedNotification = payload.old as Notification;
                  setNotifications(prev => 
                    prev.filter(n => n.id !== deletedNotification.id)
                  );
                }
              } catch (error) {
                console.error('Error handling notification update:', error);
              }
            }
          )
          .subscribe(async (status) => {
            console.log('Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to notifications');
              setIsSubscribed(true);
              retryCount = 0; // Reset retry count on successful subscription
            } else if (status === 'CHANNEL_ERROR' && mounted) {
              console.error('Subscription error:', status);
              
              // Retry logic
              if (retryCount < maxRetries) {
                retryCount++;
                const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                console.log(`Will retry subscription in ${delay}ms (attempt ${retryCount})`);
                
                retryTimeout = setTimeout(() => {
                  console.log(`Retrying subscription (attempt ${retryCount})...`);
                  if (currentChannel) {
                    supabase.removeChannel(currentChannel);
                  }
                  setupSubscription();
                }, delay);
              } else {
                setIsSubscribed(false);
                toast({
                  title: "Connection Error",
                  description: "Failed to connect to notification service. Please refresh the page.",
                  variant: "destructive"
                });
              }
            }
          });

        currentChannel = channel;
        return channel;
      } catch (error) {
        console.error('Error setting up subscription:', error);
        return null;
      }
    };

    // Initial setup
    loadNotifications();
    setupSubscription();

    // Cleanup
    return () => {
      console.log('Cleaning up notification subscription');
      mounted = false;
      clearTimeout(retryTimeout);
      if (currentChannel) {
        supabase.removeChannel(currentChannel);
      }
    };
  }, [userId, toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isSubscribed
  };
};
