import { useEffect } from 'react';
import { useLogGuestActivity } from './useQueries';

export function useSessionTracking(guestId?: string) {
  const logGuestActivity = useLogGuestActivity();

  useEffect(() => {
    if (!guestId) return;

    const startTime = Date.now();
    const reportInterval = setInterval(() => {
      const duration = Date.now() - startTime;
      logGuestActivity.mutate({
        sessionId: guestId,
        eventType: 'interaction',
        details: `Session duration: ${Math.floor(duration / 1000)}s`,
      });
    }, 60000);

    const handleUnload = () => {
      const duration = Date.now() - startTime;
      navigator.sendBeacon(
        '/api/log',
        JSON.stringify({
          sessionId: guestId,
          eventType: 'interaction',
          details: `Session ended after ${Math.floor(duration / 1000)}s`,
        })
      );
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(reportInterval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [guestId, logGuestActivity]);
}
