import { useState, useEffect } from 'react';
import { guestAuthStore } from './guestAuthStore';

export function useGuestAuth() {
  const [guestSession, setGuestSession] = useState(() => guestAuthStore.getSession());

  useEffect(() => {
    const unsubscribe = guestAuthStore.subscribe(setGuestSession);
    return unsubscribe;
  }, []);

  const createGuestSession = () => {
    return guestAuthStore.createSession();
  };

  const clearGuestSession = () => {
    guestAuthStore.clearSession();
  };

  return {
    guestSession,
    guestId: guestSession?.guestId,
    isGuest: !!guestSession,
    createGuestSession,
    clearGuestSession,
  };
}
