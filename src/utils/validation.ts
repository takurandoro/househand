import { Task, Bid } from '@/types';

export const validateTaskInput = (task: Partial<Task>): string | null => {
  if (!task.title?.trim()) {
    return 'Title is required';
  }

  if (!task.description?.trim()) {
    return 'Description is required';
  }

  if (!task.location?.trim()) {
    return 'Location is required';
  }

  if (!task.budget_min || !task.budget_max) {
    return 'Budget range is required';
  }

  if (task.budget_min < 0 || task.budget_max < 0) {
    return 'Budget cannot be negative';
  }

  if (task.budget_min > task.budget_max) {
    return 'Minimum budget cannot be greater than maximum budget';
  }

  return null;
};

export const validateBidInput = (bid: Partial<Bid>, task: Task): string | null => {
  if (!bid.message?.trim()) {
    return 'Message is required';
  }

  if (!bid.proposed_price) {
    return 'Proposed price is required';
  }

  if (bid.proposed_price < task.budget_min || bid.proposed_price > task.budget_max) {
    return `Price must be between ${task.budget_min} and ${task.budget_max} RWF`;
  }

  return null;
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Rwanda phone number format: +250 78X XXX XXX or 07X XXX XXXX
  const pattern = /^(?:\+250|0)7[2348]\d{7}$/;
  return pattern.test(phone.replace(/\s/g, ''));
};

export const validateEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }

  return null;
}; 