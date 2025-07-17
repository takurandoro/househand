export const TASK_CATEGORIES = [
  'cleaning',
  'gardening',
  'maintenance',
  'moving',
  'painting',
  'other'
] as const;

export const EFFORT_LEVELS = [
  'easy',
  'medium',
  'hard'
] as const;

export const TASK_STATUS_LABELS = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
} as const;

export const BID_STATUS_LABELS = {
  submitted: 'Submitted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn'
} as const;

export const NOTIFICATION_TYPES = {
  new_bid: 'New Bid',
  bid_accepted: 'Bid Accepted',
  bid_rejected: 'Bid Rejected',
  task_started: 'Task Started',
  task_completed: 'Task Completed',
  payment_received: 'Payment Received',
  payment_sent: 'Payment Sent'
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  FIND_WORK: '/find-work',
  GET_HELP: '/get-help',
  ABOUT: '/about',
  PROFILE: '/profile'
} as const;

export const API_ERROR_MESSAGES = {
  UNAUTHORIZED: 'Please log in to continue',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  SERVER_ERROR: 'Something went wrong. Please try again later'
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50
} as const; 