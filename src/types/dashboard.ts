
import { Task as BaseTask } from './index';
import { Bid } from './bid';

export interface DashboardTask extends Omit<BaseTask, 'myBid'> {
  applications?: DashboardTaskApplication[];
  myBid?: DashboardTaskApplication;
  client?: {
    id: string;
    full_name: string;
    avatar_url: string;
    phone_number?: string;
    email?: string;
    location?: string;
  };
}

export interface DashboardTaskApplication extends Bid {
  task: DashboardTask;
  helper?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  client_id: string;
  helper_id: string;
}

export interface TaskApplicationResponse {
  data: DashboardTaskApplication[] | null;
  error: Error | null;
}

export interface LoadTasksOptions {
  userId: string;
  userType: 'client' | 'helper';
  view: 'all' | 'available' | 'my_bids' | 'completed';
  categories?: string[];
}
