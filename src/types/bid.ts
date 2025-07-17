import { BidStatus, ISODateString, MonetaryAmount } from './common';
import { Profile } from './user';
import { Task } from './task';

export interface Bid {
  id: string;
  task_id: string;
  helper_id: string;
  message?: string;
  proposed_price: number;
  status: BidStatus;
  created_at: ISODateString;
  accepted_at?: ISODateString;
  rejected_at?: ISODateString;
}

export interface BidWithRelations extends Bid {
  task: Task;
  helper: Profile;
}

export type BidAction = 'submit' | 'withdraw' | 'accept' | 'reject';

export interface BidActionOptions {
  taskId: string;
  helperId: string;
  message?: string;
  proposedPrice?: MonetaryAmount;
  action: BidAction;
  applicationId?: string;
}

export interface BidSearchFilters {
  taskId?: string;
  helperId?: string;
  status?: BidStatus[];
  dateRange?: {
    start: ISODateString;
    end: ISODateString;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
} 