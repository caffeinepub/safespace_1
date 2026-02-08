// Shared guest session store with pub-sub pattern
// Ensures all useGuestAuth hook instances stay in sync

const GUEST_SESSION_KEY = 'safespace_guest_session';

export interface GuestSession {
  userId: string;
  profession: string | null;
  timestamp: number;
  guestId: string;
}

type Listener = (session: GuestSession | null) => void;

// Safe UUID generation with fallback
function generateGuestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `guest-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

class GuestAuthStore {
  private listeners: Set<Listener> = new Set();
  private currentSession: GuestSession | null = null;
  private initialized = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (this.initialized) return;
    
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
          this.currentSession = migratedSession;
          console.log('Guest session migrated with guestId:', migratedSession.guestId);
        } else {
          this.currentSession = session as GuestSession;
          console.log('Guest session loaded with guestId:', this.currentSession.guestId);
        }
      } catch (error) {
        console.error('Failed to parse guest session:', error);
        localStorage.removeItem(GUEST_SESSION_KEY);
        this.currentSession = null;
      }
    }
    
    this.initialized = true;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.currentSession);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.currentSession));
  }

  login(userId: string, profession: string | null): string {
    const guestId = generateGuestId();
    const session: GuestSession = {
      userId,
      profession,
      timestamp: Date.now(),
      guestId,
    };
    
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
    this.currentSession = session;
    console.log('Guest logged in with guestId:', guestId);
    
    // Notify all subscribers immediately
    this.notify();
    
    return guestId;
  }

  logout() {
    localStorage.removeItem(GUEST_SESSION_KEY);
    this.currentSession = null;
    console.log('Guest session cleared');
    
    // Notify all subscribers immediately
    this.notify();
  }

  getSession(): GuestSession | null {
    return this.currentSession;
  }
}

// Singleton instance
export const guestAuthStore = new GuestAuthStore();
