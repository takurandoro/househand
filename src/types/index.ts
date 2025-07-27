export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  userType: string;
  completedTasks?: number;
}

export interface HelperProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  user_type: string;
  created_at: string;
}



export interface Task {
  id: string;
  title: string;
  description: string;
  client_id: string;
  selected_helper_id: string | null;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: boolean;
  payment_amount?: number;
  payment_date?: string;
  min_price: number;
  max_price: number;
  location: string;
  category: import('./common').TaskCategory;
  hours: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Bid {
  id: string;
  task_id: string;
  helper_id: string;
  status: 'submitted' | 'accepted' | 'rejected' | 'completed';
  proposed_price: number;
  message?: string;
  created_at: string;
  accepted_at?: string;
  rejected_at?: string;
  helper?: HelperProfile | null;
}

export interface TaskApplication {
  id: string;
  task_id: string;
  helper_id: string;
  status: 'submitted' | 'accepted' | 'rejected' | 'completed';
  proposed_price: number;
  message?: string;
  created_at: string;
  accepted_at?: string;
  rejected_at?: string;
  helper?: HelperProfile | null;
}

export interface TaskWithRelations extends Task {
  bids?: Bid[];
}

export interface UserMetadata {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  user_type: string;
  created_at: string;
}

export * from './common';
export * from './task';
export * from './bid';
export * from './user';
export * from './notification'; 