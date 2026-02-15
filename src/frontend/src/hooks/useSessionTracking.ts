import { useEffect, useRef } from 'react';
import { useLogActivity } from './useQueries';

export function useSessionTracking(guestId?: string) {
  const logActivity = useLogActivity();
  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const sessionStart = sessionStartRef.current;

    const reportSession = () => {
      const duration = Date.now() - sessionStart;
      logActivity.mutate({
        event: {
          timestamp: BigInt(Date.now() * 1000000),
          eventType: 'interaction',
          details: `Session duration: ${Math.floor(duration / 1000)}s`,
        },
        guestId,
      });
    };

    const intervalId = setInterval(reportSession, 60000); // Report every minute

    window.addEventListener('beforeunload', reportSession);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', reportSession);
      reportSession();
    };
  }, [guestId, logActivity]);
}
