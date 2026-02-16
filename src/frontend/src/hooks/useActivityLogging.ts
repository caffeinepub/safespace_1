import { useLogActivity, useLogGuestActivity } from './useQueries';

export function useActivityLogging() {
  const logActivityMutation = useLogActivity();
  const logGuestActivityMutation = useLogGuestActivity();

  const logLogin = (guestId?: string) => {
    if (guestId) {
      logGuestActivityMutation.mutate({ sessionId: guestId, eventType: 'login', details: 'User logged in' });
    } else {
      logActivityMutation.mutate({ eventType: 'login', details: 'User logged in' });
    }
  };

  const logPageNavigation = (page: string, guestId?: string) => {
    if (guestId) {
      logGuestActivityMutation.mutate({ sessionId: guestId, eventType: 'pageNavigation', details: `Navigated to ${page}` });
    } else {
      logActivityMutation.mutate({ eventType: 'pageNavigation', details: `Navigated to ${page}` });
    }
  };

  const logInteraction = (interaction: string, guestId?: string) => {
    if (guestId) {
      logGuestActivityMutation.mutate({ sessionId: guestId, eventType: 'interaction', details: interaction });
    } else {
      logActivityMutation.mutate({ eventType: 'interaction', details: interaction });
    }
  };

  return { logLogin, logPageNavigation, logInteraction };
}
