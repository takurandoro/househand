import { ISODateString } from './common';

export type NotificationType = 
  | 'new_bid'
  | 'bid_accepted'
  | 'bid_rejected'
  | 'task_started'
  | 'task_completed'
  | 'payment_received'
  | 'payment_sent'
  | 'task_cancelled'
  | 'review_received'
  | 'profile_verified'
  | 'earnings_available';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string; // Can be task_id, bid_id, etc.
  metadata?: Record<string, unknown>;
  is_read: boolean;
  created_at: ISODateString;
  read_at?: ISODateString;
}

export interface NotificationPreferences {
  userId: string;
  email_enabled: boolean;
  push_enabled: boolean;
  types: {
    [K in NotificationType]: boolean;
  };
  quiet_hours?: {
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
  };
}

export interface NotificationFilters {
  type?: NotificationType[];
  is_read?: boolean;
  dateRange?: {
    start: ISODateString;
    end: ISODateString;
  };
  related_id?: string;
} 