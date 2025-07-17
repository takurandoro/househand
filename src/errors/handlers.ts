import { PostgrestError } from '@supabase/supabase-js';
import { AppError, ValidationError, AuthenticationError, NotFoundError } from './types';
import { API_ERROR_MESSAGES } from '@/utils/constants';

export const handleSupabaseError = (error: PostgrestError): AppError => {
  switch (error.code) {
    case '23505': // unique_violation
      return new ValidationError('A record with this value already exists');
    case '23503': // foreign_key_violation
      return new ValidationError('Referenced record does not exist');
    case '42703': // undefined_column
      return new ValidationError('Invalid field specified');
    case '22P02': // invalid_text_representation
      return new ValidationError('Invalid data type');
    case '23502': // not_null_violation
      return new ValidationError('Required field missing');
    default:
      console.error('Unhandled database error:', error);
      return new AppError(
        API_ERROR_MESSAGES.SERVER_ERROR,
        'DATABASE_ERROR',
        500,
        error
      );
  }
};

export const handleAuthError = (error: Error): AppError => {
  if (error.message.includes('JWT')) {
    return new AuthenticationError('Invalid or expired session');
  }
  if (error.message.includes('credentials')) {
    return new ValidationError('Invalid email or password');
  }
  return new AppError(error.message, 'AUTH_ERROR', 401);
};

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('not found')) {
      return new NotFoundError();
    }
    if (error.message.includes('permission')) {
      return new AuthenticationError();
    }
    if (error.message.includes('validation')) {
      return new ValidationError(error.message);
    }

    // Generic error
    console.error('Unhandled error:', error);
    return new AppError(
      API_ERROR_MESSAGES.SERVER_ERROR,
      'UNKNOWN_ERROR',
      500,
      error
    );
  }

  // Unknown error type
  console.error('Unknown error type:', error);
  return new AppError(
    API_ERROR_MESSAGES.SERVER_ERROR,
    'UNKNOWN_ERROR',
    500,
    error
  );
}; 