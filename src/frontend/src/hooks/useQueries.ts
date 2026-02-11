import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  MoodEntry,
  UserProfile,
  ChatMessage,
  PrivateMessage,
  DailyAnalysisEntry,
  WeeklyMoodAnalysis,
  AnalyticsData,
  UserData,
  MoodLogEntry,
  AppMarketMetadata,
  PricingConfig,
  MarketAnalytics,
  AIResponse,
  WeeklyMoodChartData,
  UserRecord,
  StripeConfiguration,
  ShoppingItem,
} from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetMoodHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<MoodEntry[]>({
    queryKey: ['moodHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMoodHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMoodHistoryGuest(guestId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MoodEntry[]>({
    queryKey: ['moodHistoryGuest', guestId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMoodHistoryGuest(guestId);
    },
    enabled: !!actor && !isFetching && !!guestId,
  });
}

export function useSaveMood() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: MoodEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveMood(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodHistory'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyMoodChartData'] });
    },
  });
}

export function useSaveMoodGuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ guestId, entry }: { guestId: string; entry: MoodEntry }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveMoodGuest(guestId, entry);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['moodHistoryGuest', variables.guestId] });
    },
  });
}

export function useUpdateMood() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ timestamp, entry }: { timestamp: bigint; entry: MoodEntry }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMood(timestamp, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodHistory'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyMoodChartData'] });
    },
  });
}

export function useUpdateMoodGuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ guestId, timestamp, entry }: { guestId: string; timestamp: bigint; entry: MoodEntry }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMoodGuest(guestId, timestamp, entry);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['moodHistoryGuest', variables.guestId] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      if (!profile.name || profile.name.trim().length === 0) {
        throw new Error('Name is required');
      }
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetChatRooms() {
  const { actor, isFetching } = useActor();

  return useQuery<[string, { id: string; name: string; topic: string; participantCount: bigint }][]>({
    queryKey: ['chatRooms'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatRooms();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateChatRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, topic }: { id: string; name: string; topic: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createChatRoom(id, name, topic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}

export function useJoinChatRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, userId }: { roomId: string; userId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinChatRoom(roomId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}

export function useGetChatMessages(roomId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['chatMessages', roomId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatMessages(roomId);
    },
    enabled: !!actor && !isFetching && !!roomId,
    refetchInterval: 5000,
  });
}

export function useSendChatMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, message }: { roomId: string; message: ChatMessage }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendChatMessage(roomId, message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.roomId] });
    },
  });
}

export function useGetMyPrivateThreads() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['myPrivateThreads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPrivateThreads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePrivateThread() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      participant1,
      participant2,
    }: {
      threadId: string;
      participant1: Principal;
      participant2: Principal;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPrivateThread(threadId, participant1, participant2);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPrivateThreads'] });
    },
  });
}

export function useGetPrivateMessages(threadId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PrivateMessage[]>({
    queryKey: ['privateMessages', threadId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPrivateMessages(threadId);
    },
    enabled: !!actor && !isFetching && !!threadId,
    refetchInterval: 5000,
  });
}

export function useSendPrivateMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, message }: { threadId: string; message: PrivateMessage }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendPrivateMessage(threadId, message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['privateMessages', variables.threadId] });
    },
  });
}

export function useGetAggregatedAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsData>({
    queryKey: ['aggregatedAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAggregatedAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUserData() {
  const { actor, isFetching } = useActor();

  return useQuery<UserData[]>({
    queryKey: ['allUserData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllUserData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMoodLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<MoodLogEntry[]>({
    queryKey: ['allMoodLogs'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllMoodLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetWeeklyMoodInsights() {
  const { actor, isFetching } = useActor();

  return useQuery<WeeklyMoodAnalysis[]>({
    queryKey: ['weeklyMoodInsights'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWeeklyMoodInsights();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAppMarketMetadata() {
  const { actor, isFetching } = useActor();

  return useQuery<AppMarketMetadata | null>({
    queryKey: ['appMarketMetadata'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAppMarketMetadata();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAppMarketMetadata() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metadata: AppMarketMetadata) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAppMarketMetadata(metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appMarketMetadata'] });
    },
  });
}

export function useGetPricingConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<PricingConfig | null>({
    queryKey: ['pricingConfig'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPricingConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPricingConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: PricingConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPricingConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricingConfig'] });
    },
  });
}

export function useGetMarketAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<MarketAnalytics>({
    queryKey: ['marketAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMarketAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIncrementAppViews() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementAppViews();
    },
  });
}

export function useRecordCloneRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordCloneRequest(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketAnalytics'] });
    },
  });
}

export function useSendAIMessage() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendAIMessage(sessionId, message);
    },
  });
}

export function useGetWeeklyMoodChartData() {
  const { actor, isFetching } = useActor();

  return useQuery<WeeklyMoodChartData>({
    queryKey: ['weeklyMoodChartData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWeeklyMoodChartData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetUserRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRecord[]>({
    queryKey: ['userRecords'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserRecordById(userId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<UserRecord | null>({
    queryKey: ['userRecord', userId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserRecordById(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: {
      items: ShoppingItem[];
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}
