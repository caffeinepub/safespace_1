import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import { Mood, MoodEntry, UserProfile, ChatMessage, ChatRoom, PrivateMessage, PrivateThread, AIMessage, ActivityEvent, UserRecord, AppMarketMetadata, PricingConfig, MarketAnalytics, WeeklyMoodAnalysis, WeeklyMoodChartData } from '../types/backend-extended';

// Admin Check
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
}

// Placeholder hooks - backend not yet implemented
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      return null;
    },
    enabled: false, // Disabled until backend is ready
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
      // Backend method not yet implemented
      console.log('Save profile:', profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Mood Tracking
export function useCreateMoodEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mood, note, moodScore, guestId }: { mood: Mood; note: string | null; moodScore: number; guestId?: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      console.log('Create mood:', { mood, note, moodScore, guestId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodHistory'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyMoodChart'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyMoodInsights'] });
    },
  });
}

export function useUpdateMoodEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ timestamp, mood, note, moodScore, guestId }: { timestamp: bigint; mood: Mood; note: string | null; moodScore: number; guestId?: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      console.log('Update mood:', { timestamp, mood, note, moodScore, guestId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodHistory'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyMoodChart'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyMoodInsights'] });
    },
  });
}

export function useGetMoodHistory(guestId?: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MoodEntry[]>({
    queryKey: ['moodHistory', guestId],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useGetWeeklyMoodChart(guestId?: string) {
  const { actor, isFetching } = useActor();

  return useQuery<WeeklyMoodChartData | null>({
    queryKey: ['weeklyMoodChart', guestId],
    queryFn: async () => {
      if (!actor) return null;
      // Backend method not yet implemented
      return null;
    },
    enabled: false, // Disabled until backend is ready
  });
}

// Chat Rooms
export function useCreateChatRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, topic }: { id: string; name: string; topic: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      console.log('Create chat room:', { id, name, topic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}

export function useGetChatRooms() {
  const { actor, isFetching } = useActor();

  return useQuery<ChatRoom[]>({
    queryKey: ['chatRooms'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useGetChatMessages(roomId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['chatMessages', roomId],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useSendChatMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, message }: { roomId: string; message: ChatMessage }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      console.log('Send chat message:', { roomId, message });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}

// Private Chat
export function useStartPrivateThread() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUser: Principal) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      console.log('Start private thread:', otherUser.toString());
      return 'thread-id';
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateThreads'] });
    },
  });
}

export function useGetMyPrivateThreads() {
  const { actor, isFetching } = useActor();

  return useQuery<PrivateThread[]>({
    queryKey: ['privateThreads'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useGetPrivateMessages(threadId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PrivateMessage[]>({
    queryKey: ['privateMessages', threadId],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useSendPrivateMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, message }: { threadId: string; message: PrivateMessage }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      console.log('Send private message:', { threadId, message });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['privateMessages', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['privateThreads'] });
    },
  });
}

// AI Companion
export function useCreateAISession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      console.log('Create AI session:', sessionId);
    },
  });
}

export function useAppendAIMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: AIMessage }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      console.log('Append AI message:', { sessionId, message });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['aiTranscript', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['aiTypingStatus', variables.sessionId] });
    },
  });
}

export function useGetAITranscript(sessionId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<AIMessage[]>({
    queryKey: ['aiTranscript', sessionId],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useGetAITypingStatus(sessionId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['aiTypingStatus', sessionId],
    queryFn: async () => {
      if (!actor) return false;
      // Backend method not yet implemented
      return false;
    },
    enabled: false, // Disabled until backend is ready
    refetchInterval: 1000,
  });
}

// Activity Logging
export function useLogActivity() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ event, guestId }: { event: ActivityEvent; guestId?: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      console.log('Log activity:', { event, guestId });
    },
  });
}

// Analytics (Admin)
export function useGetAllUserRecords() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<UserRecord[]>({
    queryKey: ['allUserRecords'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useGetUserRecord(userId: string) {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<UserRecord | null>({
    queryKey: ['userRecord', userId],
    queryFn: async () => {
      if (!actor) return null;
      // Backend method not yet implemented
      return null;
    },
    enabled: false, // Disabled until backend is ready
  });
}

// Weekly Analysis
export function useGetWeeklyMoodInsights(guestId?: string) {
  const { actor, isFetching } = useActor();

  return useQuery<WeeklyMoodAnalysis | null>({
    queryKey: ['weeklyMoodInsights', guestId],
    queryFn: async () => {
      if (!actor) return null;
      // Backend method not yet implemented
      return null;
    },
    enabled: false, // Disabled until backend is ready
  });
}

// App Market (Admin)
export function useSetAppMarketMetadata() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metadata: AppMarketMetadata) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      console.log('Set app market metadata:', metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appMarketMetadata'] });
    },
  });
}

export function useGetAppMarketMetadata() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<AppMarketMetadata | null>({
    queryKey: ['appMarketMetadata'],
    queryFn: async () => {
      if (!actor) return null;
      // Backend method not yet implemented
      return null;
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useSetPricingConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: PricingConfig) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      console.log('Set pricing config:', config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricingConfig'] });
    },
  });
}

export function useGetPricingConfig() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<PricingConfig | null>({
    queryKey: ['pricingConfig'],
    queryFn: async () => {
      if (!actor) return null;
      // Backend method not yet implemented
      return null;
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useGetMarketAnalytics() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<MarketAnalytics | null>({
    queryKey: ['marketAnalytics'],
    queryFn: async () => {
      if (!actor) return null;
      // Backend method not yet implemented
      return null;
    },
    enabled: false, // Disabled until backend is ready
  });
}
