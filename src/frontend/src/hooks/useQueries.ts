import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type {
  Mood,
  MoodEntry,
  UserProfile,
  ChatMessage,
  PrivateMessage,
  AIMessage,
  UserRecord,
  AppMarketMetadata,
  PricingConfig,
  MarketAnalytics,
  WeeklyMoodAnalysis,
  WeeklyMoodChartData,
} from '../backend';
import { ChatRoom, PrivateThread } from '../types/backend-extended';
import { Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry, Variant_ai_user } from '../backend';

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

// User Profile Management
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const profile = await actor.getCallerUserProfile();
      return profile || null;
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
      await actor.saveCallerUserProfile(profile);
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
      
      if (guestId) {
        await actor.createGuestMoodEntry(guestId, mood, note, BigInt(moodScore));
      } else {
        await actor.createMoodEntry(mood, note, BigInt(moodScore));
      }
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
    mutationFn: async ({ timestamp, mood, note, moodScore }: { timestamp: bigint; mood: Mood; note: string | null; moodScore: number }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateMoodEntry(timestamp, mood, note, BigInt(moodScore));
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
      
      if (guestId) {
        return await actor.getGuestMoodHistory(guestId);
      } else {
        return await actor.getMoodHistory();
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetWeeklyMoodChart(guestId?: string) {
  const { actor, isFetching } = useActor();

  return useQuery<WeeklyMoodChartData | null>({
    queryKey: ['weeklyMoodChart', guestId],
    queryFn: async () => {
      if (!actor) return null;
      if (guestId) return null;
      return await actor.getWeeklyMoodChart();
    },
    enabled: !!actor && !isFetching && !guestId,
  });
}

export function useGetWeeklyAnalysis() {
  const { actor, isFetching } = useActor();

  return useQuery<WeeklyMoodAnalysis[]>({
    queryKey: ['weeklyMoodInsights'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getWeeklyAnalysis();
    },
    enabled: !!actor && !isFetching,
  });
}

// Chat Rooms
export function useCreateChatRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, topic }: { id: string; name: string; topic: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createChatRoom(id, name, topic);
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
      const rooms = await actor.listChatRooms();
      return rooms.map(([_, room]) => ({
        id: room.id,
        name: room.name,
        topic: room.topic,
        messages: room.messages,
        participants: room.participants,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useJoinChatRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.joinChatRoom(roomId);
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
      if (!actor || !roomId) return [];
      return await actor.getChatRoomMessages(roomId);
    },
    enabled: !!actor && !isFetching && !!roomId,
  });
}

export function useSendChatMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, message }: { roomId: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendChatMessage(roomId, message);
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
      return await actor.startPrivateThread(otherUser);
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
      const threads = await actor.listPrivateThreads();
      return threads.map(([_, thread]) => ({
        id: thread.id,
        participant1: thread.participant1,
        participant2: thread.participant2,
        messages: thread.messages,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPrivateMessages(threadId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PrivateMessage[]>({
    queryKey: ['privateMessages', threadId],
    queryFn: async () => {
      if (!actor || !threadId) return [];
      return await actor.getPrivateMessages(threadId);
    },
    enabled: !!actor && !isFetching && !!threadId,
  });
}

export function useSendPrivateMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, message }: { threadId: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendPrivateMessage(threadId, message);
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
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.createAISession();
    },
  });
}

export function useAppendAIMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, message, sender }: { sessionId: string; message: string; sender: 'user' | 'ai' }) => {
      if (!actor) throw new Error('Actor not available');
      const senderVariant = sender === 'user' ? Variant_ai_user.user : Variant_ai_user.ai;
      await actor.appendAIMessage(sessionId, message, senderVariant);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['aiTranscript', variables.sessionId] });
    },
  });
}

export function useGetAITranscript(sessionId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<AIMessage[]>({
    queryKey: ['aiTranscript', sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return [];
      const messages = await actor.getAITranscript(sessionId);
      return messages.map(msg => ({
        timestamp: msg.timestamp,
        sender: msg.sender === Variant_ai_user.user ? Variant_ai_user.user : Variant_ai_user.ai,
        message: msg.message,
      }));
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useGetAITypingStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['aiTypingStatus'],
    queryFn: async () => {
      if (!actor) return false;
      return await actor.getAITypingStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 1000,
  });
}

export function useGetAIResponse() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (mood: string) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getAIResponse(mood);
    },
  });
}

// Activity Logging
export function useLogActivity() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ eventType, details }: { eventType: 'login' | 'createMoodEntry' | 'updateMoodEntry' | 'pageNavigation' | 'interaction'; details: string }) => {
      if (!actor) throw new Error('Actor not available');
      const eventVariant = Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry[eventType];
      await actor.logActivity(eventVariant, details);
    },
  });
}

export function useLogGuestActivity() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ sessionId, eventType, details }: { sessionId: string; eventType: 'login' | 'createMoodEntry' | 'updateMoodEntry' | 'pageNavigation' | 'interaction'; details: string }) => {
      if (!actor) throw new Error('Actor not available');
      const eventVariant = Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry[eventType];
      await actor.logGuestActivity(sessionId, eventVariant, details);
    },
  });
}

// Analytics and Admin
export function useGetAllUserRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRecord[]>({
    queryKey: ['allUserRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAllUserRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, { totalSessions: bigint; totalSessionDuration: bigint; averageSessionDuration: bigint }]>>({
    queryKey: ['analytics'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

// App Market
export function useGetAppMarketMetadata() {
  const { actor, isFetching } = useActor();

  return useQuery<AppMarketMetadata | null>({
    queryKey: ['appMarketMetadata'],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getAppMarketMetadata();
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
      await actor.setAppMarketMetadata(metadata);
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
      return await actor.getPricingConfig();
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
      await actor.setPricingConfig(config);
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
      if (!actor) return { totalViews: BigInt(0), totalClones: BigInt(0), totalSubscriptions: BigInt(0), totalRevenue: BigInt(0) };
      return await actor.getMarketAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

// PDF Storage
export function useGetPDF(fileId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['pdf', fileId],
    queryFn: async () => {
      if (!actor || !fileId) return null;
      return await actor.getPDF(fileId);
    },
    enabled: !!actor && !isFetching && !!fileId,
  });
}

export function useStorePDF() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, blob }: { fileId: string; blob: any }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.storePDF(fileId, blob);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pdf', variables.fileId] });
    },
  });
}
