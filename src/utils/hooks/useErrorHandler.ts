import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FirestoreError } from '../../types';

interface ErrorLog {
  code: string;
  message: string;
  operation: string;
  timestamp: string;
  details?: Record<string, any>;
}

/**
 * useErrorHandler - Standardized error handling hook
 * Replaces inconsistent error handling patterns across app
 * Provides toast notifications and logging
 */
export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);

  /**
   * Handle Firestore errors with appropriate messaging
   */
  const handleFirestoreError = useCallback((error: unknown, operation: string) => {
    const err = error instanceof Error ? error : new Error(String(error));
    const firestoreErr = err as any;

    const errorLog: ErrorLog = {
      code: firestoreErr.code || 'UNKNOWN_ERROR',
      message: firestoreErr.message || 'An unexpected error occurred',
      operation,
      timestamp: new Date().toISOString(),
      details: firestoreErr.details,
    };

    // Map Firestore error codes to user-friendly messages
    const getUserMessage = (code: string): string => {
      const messages: Record<string, string> = {
        'permission-denied': 'You do not have permission to perform this action',
        'not-found': 'The requested item was not found',
        'already-exists': 'This item already exists',
        'invalid-argument': 'Invalid data provided. Please check your input',
        'internal': 'An internal server error occurred. Please try again',
        'deadline-exceeded': 'Request took too long. Please try again',
        'unavailable': 'Service temporarily unavailable. Please try again',
        'unauthenticated': 'You need to be logged in to perform this action',
      };

      return messages[code] || 'An error occurred. Please try again';
    };

    const userMessage = getUserMessage(errorLog.code);

    // Log error details
    setErrors((prev) => [...prev, errorLog]);
    console.error(`[${operation}] ${errorLog.code}:`, errorLog.message);

    // Show user-friendly toast
    toast.error(userMessage, {
      duration: 4000,
      icon: '⚠️',
    });

    return errorLog;
  }, []);

  /**
   * Handle validation errors
   */
  const handleValidationError = useCallback((errors: Record<string, string>) => {
    const errorMessages = Object.values(errors)
      .filter(Boolean)
      .join(', ');

    toast.error(`Validation failed: ${errorMessages}`, {
      duration: 4000,
    });

    return errors;
  }, []);

  /**
   * Handle network errors
   */
  const handleNetworkError = useCallback((error: any) => {
    console.error('Network error:', error);

    if (error.message.includes('Failed to fetch')) {
      toast.error('Network error. Please check your connection', {
        duration: 4000,
      });
    } else {
      toast.error('Unable to reach server. Please try again', {
        duration: 4000,
      });
    }
  }, []);

  /**
   * Show custom error message
   */
  const showError = useCallback((message: string, details?: string) => {
    console.error(message, details);
    toast.error(message, {
      duration: 4000,
    });
  }, []);

  /**
   * Show success message
   */
  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  }, []);

  /**
   * Show info message
   */
  const showInfo = useCallback((message: string) => {
    toast(message, {
      duration: 3000,
      icon: 'ℹ️',
    });
  }, []);

  /**
   * Clear error logs
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  /**
   * Get error logs for debugging
   */
  const getErrorLogs = useCallback((): ErrorLog[] => {
    return errors;
  }, [errors]);

  return {
    handleFirestoreError,
    handleValidationError,
    handleNetworkError,
    showError,
    showSuccess,
    showInfo,
    clearErrors,
    getErrorLogs,
  };
};

/**
 * Utility function to safely call async operations with error handling
 */
export const withErrorHandler = async <T,>(
  operation: () => Promise<T>,
  operationName: string,
  handleError?: (error: any) => void
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`[${operationName}] Error:`, error);
    if (handleError) {
      handleError(error);
    } else {
      const err = error as any;
      toast.error(err.message || 'An error occurred');
    }
    return null;
  }
};

/**
 * Utility function to validate required fields
 */
export const validateRequired = (data: Record<string, any>, fields: string[]): Record<string, string> => {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `${field} is required`;
    }
  });

  return errors;
};

/**
 * Utility function to validate email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Utility function to validate phone
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};
