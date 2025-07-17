import { UserType, ISODateString, MonetaryAmount } from './common';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  phone_number: string;
  location: string;
  bio?: string;
  user_type: UserType;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ClientProfile extends Profile {
  total_tasks_posted: number;
  total_tasks_completed: number;
  total_amount_paid: MonetaryAmount;
}

export interface HelperProfile extends Profile {
  helper_since: ISODateString;
  total_tasks_completed: number;
  total_earnings: MonetaryAmount;
  available_balance: MonetaryAmount;
  rating: number;
  specialties: string[];
  is_verified: boolean;
}

export interface UserSettings {
  userId: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
  currency: string;
  timezone: string;
}

export interface UserStats {
  total_tasks: number;
  completed_tasks: number;
  total_earnings?: MonetaryAmount;
  total_spent?: MonetaryAmount;
  average_rating?: number;
  member_since: ISODateString;
}

export interface UserSearchFilters {
  userType?: UserType;
  location?: string;
  specialties?: string[];
  rating_min?: number;
  is_verified?: boolean;
  has_completed_tasks?: boolean;
} 