import { Principal } from '@dfinity/principal';

// Since the backend types aren't fully exported yet, define them here
export enum Mood {
  happy = "happy",
  sad = "sad",
  anxious = "anxious",
  calm = "calm",
  angry = "angry",
  grateful = "grateful",
  stressed = "stressed",
  lonely = "lonely",
  hopeful = "hopeful",
  content = "content",
  overwhelmed = "overwhelmed",
  inspired = "inspired",
  relaxed = "relaxed"
}

export interface MoodEntry {
  timestamp: bigint;
  mood: Mood;
  note: string | null;
  moodScore: bigint;
}

export interface UserProfile {
  userId: string;
  name: string;
  profession: string | null;
}

export interface ChatMessage {
  timestamp: bigint;
  userId: string;
  message: string;
  profession: string | null;
}

export interface ChatRoom {
  id: string;
  name: string;
  topic: string;
  messages: ChatMessage[];
  participants: string[];
}

export interface PrivateMessage {
  timestamp: bigint;
  sender: Principal;
  message: string;
  profession: string | null;
}

export interface PrivateThread {
  id: string;
  participant1: Principal;
  participant2: Principal;
  messages: PrivateMessage[];
}

export interface AIMessage {
  timestamp: bigint;
  sender: 'user' | 'ai';
  message: string;
}

export interface DailyMoodEntry {
  dayOfWeek: bigint;
  moodScore: bigint;
}

export interface WeeklyMoodChartData {
  weeklyEntries: DailyMoodEntry[];
  weeklyAverage: number;
  averageLabel: string;
  weeklyInsight: string;
}

export interface ActivityEvent {
  timestamp: bigint;
  eventType: 'login' | 'createMoodEntry' | 'updateMoodEntry' | 'pageNavigation' | 'interaction';
  details: string;
}

export interface UserRecord {
  id: string;
  authType: 'guest' | 'internetIdentity';
  moodEntries: MoodEntry[];
  activityLog: ActivityEvent[];
  weeklyAverageMood: number;
}

export interface AppMarketMetadata {
  title: string;
  description: string;
  category: string;
  tags: string[];
  logoUrl: string | null;
  screenshotUrls: string[];
  language: string;
}

export interface PricingConfig {
  priceUSDC: bigint;
  currency: string;
  oisyWalletAddress: string | null;
}

export interface MarketAnalytics {
  totalViews: bigint;
  totalClones: bigint;
  totalSubscriptions: bigint;
  totalRevenue: bigint;
}

export interface WeeklySummary {
  weekStart: bigint;
  averageMoodScore: number;
  totalSteps: bigint;
  averageSleepHours: number;
  weeklyMoodAverage: number;
}

export interface WeeklyCluster {
  weekStart: bigint;
  clusterId: bigint;
}

export interface Anomaly {
  weekStart: bigint;
  typeText: string;
}

export interface WeeklyMoodAnalysis {
  weeklySummaries: WeeklySummary[];
  clusters: WeeklyCluster[];
  anomalies: Anomaly[];
}
