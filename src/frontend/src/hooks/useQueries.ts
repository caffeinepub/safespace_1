import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useGuestAuth } from './useGuestAuth';
import type { 
  ChatMessage, 
  MoodEntry, 
  Mood, 
  UserProfile, 
  Time, 
  PrivateMessage, 
  AnalyticsData, 
  UserData, 
  MoodLogEntry, 
  AppMarketMetadata, 
  PricingConfig, 
  MarketAnalytics, 
  ExternalBlob, 
  DailyAnalysisEntry, 
  WeeklyMoodAnalysis,
  Principal,
  UserRecord,
  Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry
} from '../backend';
import { toast } from 'sonner';
import { classifyMoodError, logMoodError } from '../lib/moodErrors';

// Helper function to extract user-friendly error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('Unauthorized')) {
      return 'You do not have permission to perform this action';
    }
    if (error.message.includes('not found')) {
      return 'The requested resource was not found';
    }
    if (error.message.includes('already exists')) {
      return 'This item already exists';
    }
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return 'Network connection issue. Please check your connection and try again';
    }
    if (error.message.includes('rejected') || error.message.includes('trap')) {
      return 'The operation could not be completed. Please try again';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again';
};

// Helper function to show error toast with retry option
const showErrorToast = (message: string, onRetry?: () => void) => {
  toast.error(message, {
    description: onRetry ? 'Click retry to try again' : undefined,
    action: onRetry ? {
      label: 'Retry',
      onClick: onRetry,
    } : undefined,
    duration: 5000,
  });
};

// Chat Rooms
export function useChatRooms() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['chatRooms'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const rooms = await actor.getChatRooms();
        return rooms;
      } catch (error) {
        console.error('Failed to fetch chat rooms:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    retry: 2,
    retryDelay: 500,
  });
}

export function useCreateChatRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, roomName, topic }: { roomId: string; roomName: string; topic: string }) => {
      if (!actor) {
        throw new Error('Chat functionality not available');
      }
      try {
        return await actor.createChatRoom(roomId, roomName, topic);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      toast.success('Chat room created successfully', {
        description: 'You can now start chatting with others',
      });
    },
    onError: (error: Error) => {
      showErrorToast(error.message);
    },
    retry: 1,
  });
}

export function useJoinChatRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, userId }: { roomId: string; userId: string }) => {
      if (!actor) {
        throw new Error('Chat functionality not available');
      }
      try {
        return await actor.joinChatRoom(roomId, userId);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
    onError: (error: Error) => {
      console.error('Failed to join chat room:', error);
    },
    retry: 1,
  });
}

// Messages
export function useMessages(roomId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const messages = await actor.getChatMessages(roomId);
        return messages;
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!roomId,
    refetchInterval: 5000,
    staleTime: 3000,
    retry: 1,
    retryDelay: 500,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, userId, message, profession }: { roomId: string; userId: string; message: string; profession?: string }) => {
      if (!actor) {
        throw new Error('Messaging functionality not available');
      }
      try {
        const chatMessage: ChatMessage = {
          timestamp: BigInt(Date.now() * 1_000_000),
          userId,
          message,
          profession,
        };
        return await actor.sendChatMessage(roomId, chatMessage);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    onMutate: async ({ roomId, userId, message, profession }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', roomId] });
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(['messages', roomId]);
      
      if (previousMessages) {
        const optimisticMessage: ChatMessage = {
          timestamp: BigInt(Date.now() * 1_000_000),
          userId,
          message,
          profession,
        };
        queryClient.setQueryData<ChatMessage[]>(['messages', roomId], [...previousMessages, optimisticMessage]);
      }
      
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', variables.roomId], context.previousMessages);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['userRecords'] });
    },
    retry: 1,
  });
}

// Private Messaging
export function usePrivateThreads() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['privateThreads'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const threads = await actor.getMyPrivateThreads();
        return threads;
      } catch (error) {
        console.error('Failed to fetch private threads:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    retry: 2,
    retryDelay: 500,
  });
}

export function useCreatePrivateThread() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, participant1, participant2 }: { threadId: string; participant1: Principal; participant2: Principal }) => {
      if (!actor) {
        throw new Error('Private messaging not available');
      }
      try {
        return await actor.createPrivateThread(threadId, participant1, participant2);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateThreads'] });
      toast.success('Private conversation started', {
        description: 'You can now chat privately with this user',
      });
    },
    onError: (error: Error) => {
      showErrorToast(error.message);
    },
    retry: 1,
  });
}

export function usePrivateMessages(threadId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['privateMessages', threadId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const messages = await actor.getPrivateMessages(threadId);
        return messages;
      } catch (error) {
        console.error('Failed to fetch private messages:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!threadId,
    refetchInterval: 5000,
    staleTime: 3000,
    retry: 1,
    retryDelay: 500,
  });
}

export function useSendPrivateMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ threadId, message, profession }: { threadId: string; message: string; profession?: string }) => {
      if (!actor) {
        throw new Error('Private messaging not available');
      }
      if (!identity) {
        throw new Error('Authentication required');
      }
      try {
        const privateMessage: PrivateMessage = {
          timestamp: BigInt(Date.now() * 1_000_000),
          sender: identity.getPrincipal(),
          message,
          profession,
        };
        return await actor.sendPrivateMessage(threadId, privateMessage);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    onMutate: async ({ threadId, message, profession }) => {
      await queryClient.cancelQueries({ queryKey: ['privateMessages', threadId] });
      const previousMessages = queryClient.getQueryData<PrivateMessage[]>(['privateMessages', threadId]);
      
      if (previousMessages && identity) {
        const optimisticMessage: PrivateMessage = {
          timestamp: BigInt(Date.now() * 1_000_000),
          sender: identity.getPrincipal(),
          message,
          profession,
        };
        queryClient.setQueryData<PrivateMessage[]>(['privateMessages', threadId], [...previousMessages, optimisticMessage]);
      }
      
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['privateMessages', variables.threadId], context.previousMessages);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['privateMessages', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['userRecords'] });
    },
    retry: 1,
  });
}

// Mood Tracking - Routes to guest or user endpoints based on auth mode
export function useSaveMood() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { isGuest, guestId } = useGuestAuth();

  return useMutation({
    mutationFn: async (entry: MoodEntry) => {
      if (!actor) {
        throw new Error('Mood tracking not available');
      }
      
      try {
        if (isGuest && guestId) {
          console.log('💾 [Guest Path] Saving mood with guestId:', guestId);
          const result = await actor.saveMoodGuest(guestId, entry);
          console.log('✅ [Guest Path] Mood saved successfully');
          return result;
        } else {
          console.log('💾 [User Path] Saving mood for authenticated user');
          const result = await actor.saveMood(entry);
          console.log('✅ [User Path] Mood saved successfully');
          return result;
        }
      } catch (error) {
        console.error(`❌ [${isGuest ? 'Guest' : 'User'} Path] Failed to save mood:`, error);
        const moodError = classifyMoodError(error);
        logMoodError(moodError, 'useSaveMood');
        throw new Error(moodError.userMessage);
      }
    },
    onSuccess: () => {
      const queryKey = isGuest && guestId ? ['moodHistory', 'guest', guestId] : ['moodHistory'];
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['allMoodLogs'] });
      queryClient.invalidateQueries({ queryKey: ['userRecords'] });
      toast.success('Mood saved successfully');
    },
    onError: (error: Error) => {
      console.error('Mood save error - showing toast:', error.message);
      showErrorToast(error.message);
    },
    retry: 2,
    retryDelay: 500,
  });
}

export function useUpdateMood() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { isGuest, guestId } = useGuestAuth();

  return useMutation({
    mutationFn: async ({ timestamp, entry }: { timestamp: Time; entry: MoodEntry }) => {
      if (!actor) {
        throw new Error('Mood tracking not available');
      }
      
      if (typeof timestamp !== 'bigint') {
        throw new Error('Invalid timestamp format');
      }
      
      try {
        if (isGuest && guestId) {
          console.log('🔄 [Guest Path] Updating mood with guestId:', guestId);
          const result = await actor.updateMoodGuest(guestId, timestamp, entry);
          console.log('✅ [Guest Path] Mood updated successfully');
          return result;
        } else {
          console.log('🔄 [User Path] Updating mood for authenticated user');
          const result = await actor.updateMood(timestamp, entry);
          console.log('✅ [User Path] Mood updated successfully');
          return result;
        }
      } catch (error) {
        console.error(`❌ [${isGuest ? 'Guest' : 'User'} Path] Failed to update mood:`, error);
        const moodError = classifyMoodError(error);
        logMoodError(moodError, 'useUpdateMood');
        throw new Error(moodError.userMessage);
      }
    },
    onSuccess: () => {
      const queryKey = isGuest && guestId ? ['moodHistory', 'guest', guestId] : ['moodHistory'];
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['allMoodLogs'] });
      queryClient.invalidateQueries({ queryKey: ['userRecords'] });
      toast.success('Mood updated successfully');
    },
    onError: (error: Error) => {
      console.error('Mood update error - showing toast:', error.message);
      showErrorToast(error.message);
    },
    retry: 2,
    retryDelay: 500,
  });
}

export function useMoodHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isGuest, guestId } = useGuestAuth();

  const query = useQuery({
    queryKey: isGuest && guestId ? ['moodHistory', 'guest', guestId] : ['moodHistory'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Mood tracking not available');
      }
      
      try {
        if (isGuest && guestId) {
          console.log('📖 [Guest Path] Fetching mood history with guestId:', guestId);
          const history = await actor.getMoodHistoryGuest(guestId);
          console.log(`✅ [Guest Path] Retrieved ${history.length} mood entries`);
          return history;
        } else {
          console.log('📖 [User Path] Fetching mood history for authenticated user');
          const history = await actor.getMoodHistory();
          console.log(`✅ [User Path] Retrieved ${history.length} mood entries`);
          return history;
        }
      } catch (error) {
        console.error(`❌ [${isGuest ? 'Guest' : 'User'} Path] Failed to fetch mood history:`, error);
        const moodError = classifyMoodError(error);
        logMoodError(moodError, 'useMoodHistory');
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && (!isGuest || !!guestId),
    retry: 2,
    retryDelay: 500,
    staleTime: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

// Daily Analysis - Routes to guest or user endpoints based on auth mode
export function useSaveDailyAnalysis() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { isGuest, guestId } = useGuestAuth();

  return useMutation({
    mutationFn: async (entry: DailyAnalysisEntry) => {
      if (!actor) {
        throw new Error('Daily analysis not available');
      }
      
      try {
        if (isGuest && guestId) {
          console.log('💾 [Guest Path] Saving daily analysis with guestId:', guestId);
          const result = await actor.saveDailyAnalysisGuest(guestId, entry);
          console.log('✅ [Guest Path] Daily analysis saved successfully');
          return result;
        } else {
          console.log('💾 [User Path] Saving daily analysis for authenticated user');
          const result = await actor.saveDailyAnalysis(entry);
          console.log('✅ [User Path] Daily analysis saved successfully');
          return result;
        }
      } catch (error) {
        console.error(`❌ [${isGuest ? 'Guest' : 'User'} Path] Failed to save daily analysis:`, error);
        const moodError = classifyMoodError(error);
        logMoodError(moodError, 'useSaveDailyAnalysis');
        throw new Error(moodError.userMessage);
      }
    },
    onSuccess: () => {
      const queryKey = isGuest && guestId ? ['dailyAnalysis', 'guest', guestId] : ['dailyAnalysis'];
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      console.error('Daily analysis save error:', error.message);
      // Don't show toast for daily analysis failures - they're optional
    },
    retry: 2,
    retryDelay: 500,
  });
}

export function useDailyAnalysis() {
  const { actor, isFetching } = useActor();
  const { isGuest, guestId } = useGuestAuth();

  return useQuery({
    queryKey: isGuest && guestId ? ['dailyAnalysis', 'guest', guestId] : ['dailyAnalysis'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        if (isGuest && guestId) {
          console.log('📖 [Guest Path] Fetching daily analysis with guestId:', guestId);
          const analysis = await actor.getDailyAnalysisGuest(guestId);
          return analysis ? [analysis] : [];
        } else {
          console.log('📖 [User Path] Fetching daily analysis for authenticated user');
          const analysis = await actor.getDailyAnalysis();
          return analysis;
        }
      } catch (error) {
        console.error(`❌ [${isGuest ? 'Guest' : 'User'} Path] Failed to fetch daily analysis:`, error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && (!isGuest || !!guestId),
    retry: 1,
    retryDelay: 500,
  });
}

// User Profile
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

  // Return custom state that properly reflects actor dependency
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
      if (!actor) {
        throw new Error('Profile functionality not available');
      }
      
      // Validate name field
      if (!profile.name || !profile.name.trim()) {
        throw new Error('Name is required');
      }
      
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userRecords'] });
    },
    onError: (error: Error) => {
      console.error('Failed to save profile:', error);
      showErrorToast(error.message);
    },
    retry: 1,
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: Infinity,
    retry: 1,
  });
}

export function useGetAllUserData() {
  const { actor, isFetching } = useActor();

  return useQuery<UserData[]>({
    queryKey: ['allUserData'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllUserData();
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    retry: 1,
  });
}

export function useGetAllMoodLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<MoodLogEntry[]>({
    queryKey: ['allMoodLogs'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllMoodLogs();
      } catch (error) {
        console.error('Failed to fetch mood logs:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    retry: 1,
  });
}

export function useGetAggregatedAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsData>({
    queryKey: ['aggregatedAnalytics'],
    queryFn: async () => {
      if (!actor) {
        return {
          totalSessions: BigInt(0),
          totalSessionDuration: BigInt(0),
          averageSessionDuration: BigInt(0),
        };
      }
      try {
        return await actor.getAggregatedAnalytics();
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        return {
          totalSessions: BigInt(0),
          totalSessionDuration: BigInt(0),
          averageSessionDuration: BigInt(0),
        };
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    retry: 1,
  });
}

export function useGetWeeklyMoodInsights() {
  const { actor, isFetching } = useActor();

  return useQuery<WeeklyMoodAnalysis[]>({
    queryKey: ['weeklyMoodInsights'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getWeeklyMoodInsights();
      } catch (error) {
        console.error('Failed to fetch weekly insights:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    retry: 1,
  });
}

export function useGetUserRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRecord[]>({
    queryKey: ['userRecords'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUserRecords();
      } catch (error) {
        console.error('Failed to fetch user records:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    retry: 1,
  });
}

export function useGetUserRecordById(userId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<UserRecord | null>({
    queryKey: ['userRecord', userId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getUserRecordById(userId);
      } catch (error) {
        console.error('Failed to fetch user record:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!userId,
    staleTime: 30000,
    retry: 1,
  });
}

// App Market
export function useGetAppMarketMetadata() {
  const { actor, isFetching } = useActor();

  return useQuery<AppMarketMetadata | null>({
    queryKey: ['appMarketMetadata'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getAppMarketMetadata();
      } catch (error) {
        console.error('Failed to fetch app market metadata:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
    retry: 1,
  });
}

export function useSetAppMarketMetadata() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metadata: AppMarketMetadata) => {
      if (!actor) {
        throw new Error('App market functionality not available');
      }
      try {
        return await actor.setAppMarketMetadata(metadata);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appMarketMetadata'] });
      toast.success('App market metadata updated successfully');
    },
    onError: (error: Error) => {
      showErrorToast(error.message);
    },
    retry: 1,
  });
}

export function useGetPricingConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<PricingConfig | null>({
    queryKey: ['pricingConfig'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getPricingConfig();
      } catch (error) {
        console.error('Failed to fetch pricing config:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
    retry: 1,
  });
}

export function useSetPricingConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: PricingConfig) => {
      if (!actor) {
        throw new Error('Pricing functionality not available');
      }
      try {
        return await actor.setPricingConfig(config);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricingConfig'] });
      toast.success('Pricing configuration updated successfully');
    },
    onError: (error: Error) => {
      showErrorToast(error.message);
    },
    retry: 1,
  });
}

export function useGetMarketAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<MarketAnalytics>({
    queryKey: ['marketAnalytics'],
    queryFn: async () => {
      if (!actor) {
        return {
          totalViews: BigInt(0),
          totalClones: BigInt(0),
          totalSubscriptions: BigInt(0),
          totalRevenue: BigInt(0),
        };
      }
      try {
        return await actor.getMarketAnalytics();
      } catch (error) {
        console.error('Failed to fetch market analytics:', error);
        return {
          totalViews: BigInt(0),
          totalClones: BigInt(0),
          totalSubscriptions: BigInt(0),
          totalRevenue: BigInt(0),
        };
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    retry: 1,
  });
}
