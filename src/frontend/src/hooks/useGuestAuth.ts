import { useState, useEffect, useCallback } from 'react';

const GUEST_SESSION_KEY = 'safespace_guest_session';

interface GuestSession {
  userId: string;
  profession: string | null;
  timestamp: number;
  guestId: string;
}

// Safe UUID generation with fallback
function generateGuestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `guest-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function useGuestAuth() {
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  // Load guest session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(GUEST_SESSION_KEY);
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as Partial<GuestSession>;
        
        // Migrate old sessions without guestId
        if (!session.guestId) {
          console.log('Migrating guest session: adding guestId');
          const migratedSession: GuestSession = {
            userId: session.userId || 'Guest',
            profession: session.profession || null,
            timestamp: session.timestamp || Date.now(),
            guestId: generateGuestId(),
          };
          localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(migratedSession));
          setGuestSession(migratedSession);
          setIsGuest(true);
          console.log('Guest session migrated with guestId:', migratedSession.guestId);
        } else {
          // Session already has guestId
          const validSession = session as GuestSession;
          setGuestSession(validSession);
          setIsGuest(true);
          console.log('Guest session loaded with guestId:', validSession.guestId);
        }
      } catch (error) {
        console.error('Failed to parse guest session:', error);
        localStorage.removeItem(GUEST_SESSION_KEY);
      }
    }
  }, []);

  const loginAsGuest = useCallback((userId: string, profession: string | null) => {
    const guestId = generateGuestId();
    const session: GuestSession = {
      userId,
      profession,
      timestamp: Date.now(),
      guestId,
    };
    
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
    setGuestSession(session);
    setIsGuest(true);
    console.log('Guest logged in with guestId:', guestId);
  }, []);

  const clearGuestSession = useCallback(() => {
    localStorage.removeItem(GUEST_SESSION_KEY);
    setGuestSession(null);
    setIsGuest(false);
    console.log('Guest session cleared');
  }, []);

  return {
    guestSession,
    isGuest,
    loginAsGuest,
    clearGuestSession,
    guestId: guestSession?.guestId,
  };
}
