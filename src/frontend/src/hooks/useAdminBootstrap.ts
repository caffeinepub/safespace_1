import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useClaimAdminForCaller, useIsCallerAdmin } from './useQueries';
import { useInternetIdentity } from './useInternetIdentity';

export interface AdminBootstrapResult {
  isAttempting: boolean;
  error: string | null;
}

/**
 * Orchestrates the admin bootstrap flow after Internet Identity login.
 * 
 * This hook:
 * 1. Detects successful Internet Identity authentication
 * 2. Checks if the current user is already an admin
 * 3. Attempts to claim admin role if not already admin
 * 4. Invalidates and refetches admin status on success
 * 5. Provides user-friendly error messages when claim fails
 */
export function useAdminBootstrap(): AdminBootstrapResult {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const claimAdmin = useClaimAdminForCaller();
  const queryClient = useQueryClient();
  const attemptedRef = useRef(false);

  useEffect(() => {
    // Only attempt once per identity session
    if (attemptedRef.current) return;
    
    // Wait for identity and admin status to be available
    if (!identity || isAdminLoading) return;
    
    // If already admin, no need to claim
    if (isAdmin === true) return;

    // Attempt to claim admin role
    attemptedRef.current = true;
    
    claimAdmin.mutate(undefined, {
      onSuccess: () => {
        // Refetch admin status to update UI
        queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      },
      onError: (error: Error) => {
        // Error is already captured in mutation state
        console.error('Admin claim failed:', error.message);
      },
    });
  }, [identity, isAdmin, isAdminLoading, claimAdmin, queryClient]);

  // Reset attempt flag when identity changes (logout/login)
  useEffect(() => {
    if (!identity) {
      attemptedRef.current = false;
    }
  }, [identity]);

  // Normalize error message for UI display
  const errorMessage = claimAdmin.error
    ? claimAdmin.error.message.includes('Admin has already been initialized')
      ? 'This Internet Identity is not an admin. An existing admin must grant you access.'
      : claimAdmin.error.message
    : null;

  return {
    isAttempting: claimAdmin.isPending,
    error: errorMessage,
  };
}
