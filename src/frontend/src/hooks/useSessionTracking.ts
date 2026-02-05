import { useEffect, useRef } from 'react';
import { useActor } from './useActor';

export function useSessionTracking(userId: string | null) {
  const { actor } = useActor();
  const sessionStartRef = useRef<number>(Date.now());
  const sessionTokenRef = useRef<string>(`session-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  const reportedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!userId) return;

    sessionStartRef.current = Date.now();
    reportedRef.current = false;

    const reportSession = async () => {
      if (!actor || reportedRef.current) return;
      
      // Check if actor has the method
      if (typeof (actor as any).recordSessionDuration !== 'function') {
        console.log('Session tracking not available in backend');
        return;
      }

      const duration = Date.now() - sessionStartRef.current;
      const durationNanos = BigInt(duration) * BigInt(1_000_000);

      try {
        await (actor as any).recordSessionDuration(sessionTokenRef.current, durationNanos);
        reportedRef.current = true;
        console.log('Session duration reported:', duration, 'ms');
      } catch (error) {
        console.error('Failed to report session duration:', error);
      }
    };

    // Report session every 5 minutes
    const intervalId = setInterval(reportSession, 5 * 60 * 1000);

    // Report on page unload
    const handleUnload = () => {
      if (!actor || reportedRef.current) return;
      
      if (typeof (actor as any).recordSessionDuration !== 'function') {
        return;
      }

      const duration = Date.now() - sessionStartRef.current;
      const durationNanos = BigInt(duration) * BigInt(1_000_000);

      try {
        // Use sendBeacon for reliable unload reporting
        const data = JSON.stringify({
          sessionToken: sessionTokenRef.current,
          duration: durationNanos.toString(),
        });
        
        // Fallback to synchronous call if sendBeacon not available
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/session', data);
        } else {
          (actor as any).recordSessionDuration(sessionTokenRef.current, durationNanos).catch((error: any) => {
            console.error('Failed to report session on unload:', error);
          });
        }
        
        reportedRef.current = true;
      } catch (error) {
        console.error('Failed to report session on unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleUnload);
      reportSession();
    };
  }, [userId, actor]);
}
