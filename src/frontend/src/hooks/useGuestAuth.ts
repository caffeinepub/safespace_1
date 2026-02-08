import { useState, useEffect, useCallback } from 'react';
import { guestAuthStore, GuestSession } from './guestAuthStore';

export function useGuestAuth() {
  const [guestSession, setGuestSession] = useState<GuestSession | null>(
    () => guestAuthStore.getSession()
  );
  const [isGuest, setIsGuest] = useState(() => guestAuthStore.getSession() !== null);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = guestAuthStore.subscribe((session) => {
      setGuestSession(session);
      setIsGuest(session !== null);
    });

    return unsubscribe;
  }, []);

  const loginAsGuest = useCallback((userId: string, profession: string | null): string => {
    return guestAuthStore.login(userId, profession);
  }, []);

  const clearGuestSession = useCallback(() => {
    guestAuthStore.logout();
  }, []);

  return {
    guestSession,
    isGuest,
    loginAsGuest,
    clearGuestSession,
    guestId: guestSession?.guestId,
  };
}
