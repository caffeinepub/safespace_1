type GuestSession = {
  guestId: string;
  createdAt: number;
};

type Subscriber = (session: GuestSession | null) => void;

class GuestAuthStore {
  private subscribers: Set<Subscriber> = new Set();
  private currentSession: GuestSession | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('safespace_guest_session');
      if (stored) {
        this.currentSession = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load guest session:', error);
    }
  }

  private saveToStorage() {
    try {
      if (this.currentSession) {
        localStorage.setItem('safespace_guest_session', JSON.stringify(this.currentSession));
      } else {
        localStorage.removeItem('safespace_guest_session');
      }
    } catch (error) {
      console.error('Failed to save guest session:', error);
    }
  }

  private notify() {
    this.subscribers.forEach(subscriber => subscriber(this.currentSession));
  }

  subscribe(subscriber: Subscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.currentSession);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  getSession(): GuestSession | null {
    return this.currentSession;
  }

  createSession(): GuestSession {
    const session: GuestSession = {
      guestId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    this.currentSession = session;
    this.saveToStorage();
    this.notify();
    return session;
  }

  clearSession() {
    this.currentSession = null;
    this.saveToStorage();
    this.notify();
  }
}

export const guestAuthStore = new GuestAuthStore();
