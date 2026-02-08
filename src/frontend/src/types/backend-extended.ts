import type { Mood, Time, Principal } from '../backend';

// Extended type definitions that match the backend structure
export type { Mood, Time, Principal };

export interface MoodEntry {
  timestamp: Time;
  mood: Mood;
  note?: string;
  moodScore: bigint;
}

export interface UserProfile {
  userId: string;
  name: string;
  profession?: string;
}

export interface ChatMessage {
  timestamp: Time;
  userId: string;
  message: string;
  profession?: string;
}

export interface PrivateMessage {
  timestamp: Time;
  sender: Principal;
  message: string;
  profession?: string;
}

export interface DailyAnalysisEntry {
  timestamp: Time;
  mood: Mood;
  note?: string;
  moodScore: bigint;
  stepCount: bigint;
  sleepHours: bigint;
}

export interface WeeklySummary {
  weekStart: Time;
  averageMoodScore: number;
  totalSteps: bigint;
  averageSleepHours: number;
  weeklyMoodAverage: number;
}

export interface WeeklyCluster {
  weekStart: Time;
  clusterId: bigint;
}

export interface Anomaly {
  weekStart: Time;
  typeText: string;
}

export interface WeeklyMoodAnalysis {
  weeklySummaries: WeeklySummary[];
  clusters: WeeklyCluster[];
  anomalies: Anomaly[];
}

export interface AnalyticsData {
  totalSessions: bigint;
  totalSessionDuration: Time;
  averageSessionDuration: Time;
}

export interface UserData {
  principal: Principal;
  userId: string;
  profession?: string;
  moodEntryCount: bigint;
  lastActivity?: Time;
}

export interface MoodLogEntry {
  principal: Principal;
  userId: string;
  timestamp: Time;
  mood: Mood;
  note?: string;
}

export interface AppMarketMetadata {
  title: string;
  description: string;
  category: string;
  tags: string[];
  logoUrl?: string;
  screenshotUrls: string[];
  language: string;
}

export interface PricingConfig {
  priceUSDC: bigint;
  currency: string;
  oisyWalletAddress?: string;
}

export interface MarketAnalytics {
  totalViews: bigint;
  totalClones: bigint;
  totalSubscriptions: bigint;
  totalRevenue: bigint;
}

export type AuthType = 'guest' | 'internetIdentity';

export interface ActivityEvent {
  timestamp: Time;
  eventType: 'login' | 'createMoodEntry' | 'updateMoodEntry' | 'pageNavigation' | 'interaction';
  details: string;
}

export interface UserRecord {
  id: string;
  authType: AuthType;
  moodEntries: MoodEntry[];
  activityLog: ActivityEvent[];
  weeklyAverageMood: number;
}
