import { useLogActivity } from './useQueries';
import { Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry } from '../backend';

export function useActivityLogging() {
  const logActivity = useLogActivity();

  const logPageNavigation = (viewName: string) => {
    logActivity.mutate({
      eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry.pageNavigation,
      details: `Navigated to ${viewName}`,
    });
  };

  const logInteraction = (action: string, details?: string) => {
    logActivity.mutate({
      eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry.interaction,
      details: details || action,
    });
  };

  const logLogin = (authType: 'guest' | 'internetIdentity') => {
    logActivity.mutate({
      eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry.login,
      details: `Logged in via ${authType}`,
    });
  };

  return {
    logPageNavigation,
    logInteraction,
    logLogin,
  };
}
