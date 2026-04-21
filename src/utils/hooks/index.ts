// Export all custom hooks for easy importing
export { useUser, useAuth, useUserRole, useIsStaff, useIsClient, useIsCandidate } from '../../context/UserContext';
export { useFirestoreQuery, useFirestoreLive, useFirestoreDoc, useBatchFirestoreQuery, useFirestoreLiveDoc } from './useFirestore';
export { useErrorHandler, withErrorHandler, validateRequired, validateEmail, validatePhone } from './useErrorHandler';
