import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import { useIsCallerAdmin } from './useQueries';

export function useAdminBootstrap() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (identity && isAdmin === false) {
      // User is authenticated but not admin - this is expected for regular users
      console.log('User authenticated as regular user');
    }
  }, [identity, isAdmin, queryClient]);

  return { isAdmin };
}
