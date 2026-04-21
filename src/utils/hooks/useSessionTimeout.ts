/**
 * Session Timeout Hook
 * Automatically logs out user after specified inactivity period
 */

import { useEffect, useRef, useCallback } from 'react';
import { auth } from '../firebase';
import toast from 'react-hot-toast';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onWarning?: (remainingTime: string) => void;
  onTimeout?: () => void;
}

/**
 * useSessionTimeout - Manage session expiration
 * 
 * Usage:
 * ```typescript
 * function App() {
 *   useSessionTimeout({
 *     timeoutMinutes: 30,
 *     warningMinutes: 5,
 *     onWarning: (time) => console.log(`Session expires in ${time}`),
 *     onTimeout: () => console.log('Session expired')
 *   });
 *   
 *   return <AppContent />;
 * }
 * ```
 */
export const useSessionTimeout = (options: UseSessionTimeoutOptions = {}) => {
  const {
    timeoutMinutes = 30,
    warningMinutes = 5,
    onWarning,
    onTimeout
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  const logout = useCallback(async () => {
    try {
      toast.success('Session expired. Please log in again.');
      await auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Set new timeout
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

    // Warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      const remainingTime = `${warningMinutes} minute${warningMinutes !== 1 ? 's' : ''}`;
      toast.error(`Your session will expire in ${remainingTime}`, {
        duration: 5000,
        icon: '⏰'
      });
      onWarning?.(remainingTime);
    }, warningMs);

    // Actual timeout
    timeoutRef.current = setTimeout(() => {
      logout();
      onTimeout?.();
    }, timeoutMs);
  }, [timeoutMinutes, warningMinutes, onWarning, onTimeout, logout]);

  useEffect(() => {
    // Only set up timers if user is logged in
    if (!auth.currentUser) return;

    // Set initial timers
    resetTimers();

    // Track user activity
    const handleUserActivity = () => {
      resetTimers();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [resetTimers]);
};

export default useSessionTimeout;
