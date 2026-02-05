// Extended backend types that are not yet in the generated backend interface
// These types match the specification but are missing from the current backend

export type Time = bigint;

export type Mood = 
  | { __kind__: 'happy' }
  | { __kind__: 'sad' }
  | { __kind__: 'anxious' }
  | { __kind__: 'calm' }
  | { __kind__: 'angry' }
  | { __kind__: 'grateful' }
  | { __kind__: 'stressed' }
  | { __kind__: 'lonely' }
  | { __kind__: 'hopeful' }
  | { __kind__: 'content' }
  | { __kind__: 'overwhelmed' }
  | { __kind__: 'inspired' }
  | { __kind__: 'relaxed' };

export interface MoodEntry {
  timestamp: Time;
  mood: Mood;
  note?: string;
}

export interface DailyAnalysisEntry {
  timestamp: Time;
  mood: Mood;
  moodScore: bigint;
  stepCount: bigint;
  sleepHours: bigint;
  note?: string;
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

export interface UserProfile {
  userId: string;
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
  sender: string;
  message: string;
  profession?: string;
}

export interface AnalyticsData {
  totalSessions: bigint;
  totalSessionDuration: Time;
  averageSessionDuration: Time;
}

export interface UserData {
  principal: string;
  userId: string;
  profession?: string;
  moodEntryCount: bigint;
  lastActivity?: Time;
}

export interface MoodLogEntry {
  principal: string;
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

export interface ExternalBlob {
  getBytes(): Promise<Uint8Array>;
  getDirectURL(): string;
}

// Helper functions to create mood objects
export const createMood = (moodType: string): Mood => {
  return { __kind__: moodType as any };
};

export const getMoodKind = (mood: Mood): string => {
  return mood.__kind__;
};
