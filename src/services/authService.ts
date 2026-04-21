/**
 * Enhanced Authentication Service
 * Provides password reset, email verification, and session management
 */

import { 
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  applyActionCode,
  confirmPasswordReset,
  User
} from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';

/**
 * Send password reset email
 * Usage: await sendPasswordReset(email)
 */
export const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid email address');
    }

    await sendPasswordResetEmail(auth, email);
    
    const message = `Password reset email sent to ${email}. Check your inbox for the reset link.`;
    toast.success(message, { duration: 5000 });
    
    return { success: true, message };
  } catch (error: any) {
    const errorMessage = error.code === 'auth/user-not-found' 
      ? 'No account found with this email address'
      : error.message || 'Failed to send password reset email';
    
    toast.error(errorMessage);
    return { success: false, message: errorMessage };
  }
};

/**
 * Send email verification
 * Usage: await sendEmailVerification(user)
 */
export const sendEmailVerification = async (user: User | null): Promise<{ success: boolean; message: string }> => {
  try {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (user.emailVerified) {
      return { success: true, message: 'Email already verified' };
    }

    await firebaseSendEmailVerification(user);
    
    const message = `Verification email sent to ${user.email}. Click the link in your email to verify.`;
    toast.success(message, { duration: 5000 });
    
    return { success: true, message };
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to send verification email';
    toast.error(errorMessage);
    return { success: false, message: errorMessage };
  }
};

/**
 * Verify email with action code (from email link)
 * Usage: await verifyEmailWithCode(actionCode)
 */
export const verifyEmailWithCode = async (actionCode: string): Promise<{ success: boolean; message: string }> => {
  try {
    await applyActionCode(auth, actionCode);
    toast.success('Email verified successfully!');
    return { success: true, message: 'Email verified' };
  } catch (error: any) {
    const errorMessage = error.code === 'auth/invalid-action-code'
      ? 'Invalid or expired verification link'
      : error.message || 'Failed to verify email';
    
    toast.error(errorMessage);
    return { success: false, message: errorMessage };
  }
};

/**
 * Reset password with code (from email link)
 * Usage: const result = await resetPasswordWithCode(actionCode, newPassword)
 */
export const resetPasswordWithCode = async (
  actionCode: string, 
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    await confirmPasswordReset(auth, actionCode, newPassword);
    toast.success('Password reset successfully!');
    return { success: true, message: 'Password reset' };
  } catch (error: any) {
    const errorMessage = error.code === 'auth/invalid-action-code'
      ? 'Invalid or expired password reset link'
      : error.code === 'auth/weak-password'
      ? 'Password is too weak. Use at least 6 characters'
      : error.message || 'Failed to reset password';
    
    toast.error(errorMessage);
    return { success: false, message: errorMessage };
  }
};

/**
 * Session management utilities
 */
export const sessionManager = {
  /**
   * Get remaining session time in milliseconds
   */
  getRemainingTime: (sessionStartTime: number, sessionDurationMinutes: number): number => {
    const elapsed = Date.now() - sessionStartTime;
    const remaining = sessionDurationMinutes * 60 * 1000 - elapsed;
    return Math.max(0, remaining);
  },

  /**
   * Check if session is expired
   */
  isSessionExpired: (sessionStartTime: number, sessionDurationMinutes: number): boolean => {
    return sessionManager.getRemainingTime(sessionStartTime, sessionDurationMinutes) <= 0;
  },

  /**
   * Format remaining time for display (e.g., "5 minutes 30 seconds")
   */
  formatRemainingTime: (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes === 0) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
};

export default {
  sendPasswordReset,
  sendEmailVerification,
  verifyEmailWithCode,
  resetPasswordWithCode,
  sessionManager
};
