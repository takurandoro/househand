import { Task, Bid } from '@/types';

export const validateTask = (task: any): string | null => {
  if (!task.title || !task.description || !task.location) {
    return 'Title, description, and location are required';
  }

  if (!task.min_price || !task.max_price) {
    return 'Minimum and maximum prices are required';
  }

  if (task.min_price < 0 || task.max_price < 0) {
    return 'Prices must be positive numbers';
  }

  if (task.min_price > task.max_price) {
    return 'Minimum price cannot be greater than maximum price';
  }

  return null;
};

export const validateBid = (bid: any, task: any): string | null => {
  if (!bid.message || !bid.proposed_price) {
    return 'Message and proposed price are required';
  }

  if (bid.proposed_price < task.min_price || bid.proposed_price > task.max_price) {
    return `Price must be between ${task.min_price} and ${task.max_price} RWF`;
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