import { useLogActivity } from './useQueries';
import { ActivityEvent } from '../types/backend-extended';

export function useActivityLogging() {
  const logActivityMutation = useLogActivity();

  const logLogin = (guestId?: string) => {
    const event: ActivityEvent = {
      timestamp: BigInt(Date.now() * 1000000),
      eventType: 'login',
      details: 'User logged in',
    };
    logActivityMutation.mutate({ event, guestId });
  };

  const logPageNavigation = (page: string, guestId?: string) => {
    const event: ActivityEvent = {
      timestamp: BigInt(Date.now() * 1000000),
      eventType: 'pageNavigation',
      details: `Navigated to ${page}`,
    };
    logActivityMutation.mutate({ event, guestId });
  };

  const logInteraction = (action: string, guestId?: string) => {
    const event: ActivityEvent = {
      timestamp: BigInt(Date.now() * 1000000),
      eventType: 'interaction',
      details: action,
    };
    logActivityMutation.mutate({ event, guestId });
  };

  return {
    logLogin,
    logPageNavigation,
    logInteraction,
  };
}
