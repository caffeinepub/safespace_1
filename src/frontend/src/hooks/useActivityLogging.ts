import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useGuestAuth } from './useGuestAuth';
import { Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry } from '../backend';

export function useActivityLogging() {
  const { actor } = useActor();
  const { isGuest, guestId } = useGuestAuth();

  const logActivity = useMutation({
    mutationFn: async ({
      eventType,
      details,
      explicitGuestId,
    }: {
      eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry;
      details: string;
      explicitGuestId?: string;
    }) => {
      if (!actor) return;

      // Use explicit guestId if provided (for immediate logging after guest creation)
      // Otherwise fall back to the guestId from context
      const activeGuestId = explicitGuestId || guestId;

      if (isGuest && activeGuestId) {
        await actor.logGuestActivityPublic(activeGuestId, eventType, details);
      } else if (!isGuest) {
        await actor.logUserActivity(eventType, details);
      }
    },
  });

  const logLogin = async (authType: 'guest' | 'internetIdentity', explicitGuestId?: string) => {
    await logActivity.mutateAsync({
      eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry.login,
      details: `Logged in via ${authType}`,
      explicitGuestId,
    });
  };

  const logPageNavigation = (pageName: string) => {
    logActivity.mutate({
      eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry.pageNavigation,
      details: `Navigated to ${pageName}`,
    });
  };

  const logInteraction = (interactionDetails: string) => {
    logActivity.mutate({
      eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry.interaction,
      details: interactionDetails,
    });
  };

  return {
    logLogin,
    logPageNavigation,
    logInteraction,
  };
}
