import { TaskCategory, EffortLevel, TaskStatus, ISODateString, MonetaryAmount, TaskViewFilter } from './common';
import { Profile } from './user';
import { Bid } from './bid';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  min_price: number;
  max_price: number;
  hours: string;
  status: TaskStatus;
  payment_status: boolean;
  has_review: boolean;
  client_id: string;
  selected_helper_id: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  completed_at?: ISODateString;
  payment_amount?: MonetaryAmount;
  payment_date?: ISODateString;
  agreed_amount?: number;
}

export interface TaskWithRelations extends Task {
  client?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone_number?: string;
  };
  helper?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    location?: string;
  };
  bids?: Array<Bid & {
    helper?: {
      id: string;
      full_name: string;
      avatar_url: string | null;
      location?: string;
    };
  }>;
}

export type { TaskViewFilter };

export interface TaskUpdateOptions {
  taskId: string;
  newStatus: TaskStatus;
  userId: string;
  userType: 'client' | 'helper';
}

export interface TaskCreateOptions {
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  min_price: number;
  max_price: number;
  hours: string;
}

export interface TaskSearchFilters {
  category?: TaskCategory[];
  location?: string;
  budget_range?: {
    min?: number;
    max?: number;
  };
  status?: TaskStatus[];
} 