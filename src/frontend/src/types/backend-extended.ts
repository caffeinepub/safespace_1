// Import and re-export types from the generated backend interface
import type {
  MoodEntry,
  UserProfile,
  ChatMessage,
  ChatRoomView,
  PrivateMessage,
  PrivateThreadView,
  AIMessage,
  DailyMoodEntry,
  WeeklyMoodChartData,
  ActivityEvent,
  UserRecord,
  AppMarketMetadata,
  PricingConfig,
  MarketAnalytics,
  WeeklySummary,
  WeeklyCluster,
  Anomaly,
  WeeklyMoodAnalysis,
  AuthType,
  UserRole,
} from '../backend';

// Re-export Mood enum for both type and value usage
export { Mood } from '../backend';

// Re-export all types
export type {
  MoodEntry,
  UserProfile,
  ChatMessage,
  ChatRoomView,
  PrivateMessage,
  PrivateThreadView,
  AIMessage,
  DailyMoodEntry,
  WeeklyMoodChartData,
  ActivityEvent,
  UserRecord,
  AppMarketMetadata,
  PricingConfig,
  MarketAnalytics,
  WeeklySummary,
  WeeklyCluster,
  Anomaly,
  WeeklyMoodAnalysis,
  AuthType,
  UserRole,
};

// Frontend-specific interfaces that match backend structure
export interface ChatRoom {
  id: string;
  name: string;
  topic: string;
  messages: ChatMessage[];
  participants: string[];
}

export interface PrivateThread {
  id: string;
  participant1: import('@dfinity/principal').Principal;
  participant2: import('@dfinity/principal').Principal;
  messages: PrivateMessage[];
}
