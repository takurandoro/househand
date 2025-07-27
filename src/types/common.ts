export type TaskCategory = 
  | 'cleaning'
  | 'gardening'
  | 'home_maintenance'
  | 'moving'
  | 'painting'
  | 'other';

export type EffortLevel = 'easy' | 'medium' | 'hard';

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  metadata?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Common status types
export type TaskStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type BidStatus = 'submitted' | 'accepted' | 'rejected' | 'withdrawn';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type UserType = 'client' | 'helper';

// Common view filters
export type TaskViewFilter = 'available' | 'my_bids' | 'completed' | 'all';

// Common date formats
export type ISODateString = string; // YYYY-MM-DDTHH:mm:ss.sssZ

// Common monetary types
export interface MonetaryAmount {
  amount: number;
  currency: string; // Default: 'RWF'
} 