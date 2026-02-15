import type { Principal } from "@dfinity/principal";

export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface http_header {
    value: string;
    name: string;
}

export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}

export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}

export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}

export interface SmokeTestResult {
    returnToDashboard: boolean;
    moodTrackerNavigation: boolean;
    internetIdentityLogin: boolean;
    moodHistoryNavigation: boolean;
    guestLogin: boolean;
    dashboardRender: boolean;
}

export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};

export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}

export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}

export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}

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
    note: Option<string>;
    moodScore: bigint;
}

export interface UserProfile {
    userId: string;
    name: string;
    profession: Option<string>;
}

export interface ChatMessage {
    timestamp: bigint;
    userId: string;
    message: string;
    profession: Option<string>;
}

export interface ChatRoom {
    id: string;
    name: string;
    topic: string;
    messages: Array<ChatMessage>;
    participants: Array<string>;
}

export interface PrivateMessage {
    timestamp: bigint;
    sender: Principal;
    message: string;
    profession: Option<string>;
}

export interface PrivateThread {
    id: string;
    participant1: Principal;
    participant2: Principal;
    messages: Array<PrivateMessage>;
}

export interface AIMessage {
    timestamp: bigint;
    sender: { __kind__: "user" } | { __kind__: "ai" };
    message: string;
}

export interface DailyMoodEntry {
    dayOfWeek: bigint;
    moodScore: bigint;
}

export interface WeeklyMoodChartData {
    weeklyEntries: Array<DailyMoodEntry>;
    weeklyAverage: number;
    averageLabel: string;
    weeklyInsight: string;
}

export interface ActivityEvent {
    timestamp: bigint;
    eventType: { __kind__: "login" } | { __kind__: "createMoodEntry" } | { __kind__: "updateMoodEntry" } | { __kind__: "pageNavigation" } | { __kind__: "interaction" };
    details: string;
}

export interface UserRecord {
    id: string;
    authType: { __kind__: "guest" } | { __kind__: "internetIdentity" };
    moodEntries: Array<MoodEntry>;
    activityLog: Array<ActivityEvent>;
    weeklyAverageMood: number;
}

export interface AppMarketMetadata {
    title: string;
    description: string;
    category: string;
    tags: Array<string>;
    logoUrl: Option<string>;
    screenshotUrls: Array<string>;
    language: string;
}

export interface PricingConfig {
    priceUSDC: bigint;
    currency: string;
    oisyWalletAddress: Option<string>;
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
    weeklySummaries: Array<WeeklySummary>;
    clusters: Array<WeeklyCluster>;
    anomalies: Array<Anomaly>;
}

export interface backendInterface {
    // Auth & Admin
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    
    // User Profile
    getCallerUserProfile(): Promise<Option<UserProfile>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    getUserProfile(userId: string): Promise<Option<UserProfile>>;
    
    // Mood Tracking
    createMoodEntry(mood: Mood, note: Option<string>, moodScore: bigint, guestId: Option<string>): Promise<void>;
    updateMoodEntry(timestamp: bigint, mood: Mood, note: Option<string>, moodScore: bigint, guestId: Option<string>): Promise<void>;
    getMoodHistory(guestId: Option<string>): Promise<Array<MoodEntry>>;
    getWeeklyMoodChartData(guestId: Option<string>): Promise<WeeklyMoodChartData>;
    
    // Chat Rooms
    createChatRoom(id: string, name: string, topic: string): Promise<void>;
    getChatRooms(): Promise<Array<ChatRoom>>;
    getChatMessages(roomId: string): Promise<Array<ChatMessage>>;
    sendChatMessage(roomId: string, message: ChatMessage): Promise<void>;
    
    // Private Chat
    startPrivateThread(otherUser: Principal): Promise<string>;
    getMyPrivateThreads(): Promise<Array<PrivateThread>>;
    getPrivateMessages(threadId: string): Promise<Array<PrivateMessage>>;
    sendPrivateMessage(threadId: string, message: PrivateMessage): Promise<void>;
    
    // AI Companion
    createAISession(sessionId: string): Promise<void>;
    appendAIMessage(sessionId: string, message: AIMessage): Promise<void>;
    getAITranscript(sessionId: string): Promise<Array<AIMessage>>;
    getAITypingStatus(sessionId: string): Promise<boolean>;
    
    // Activity Logging
    logActivity(event: ActivityEvent, guestId: Option<string>): Promise<void>;
    
    // Analytics (Admin)
    getAllUserRecords(): Promise<Array<UserRecord>>;
    getUserRecord(userId: string): Promise<Option<UserRecord>>;
    getAnalyticsSummary(): Promise<{ totalUsers: bigint; totalMoodEntries: bigint; averageMoodScore: number }>;
    
    // Weekly Analysis
    getWeeklyMoodInsights(guestId: Option<string>): Promise<WeeklyMoodAnalysis>;
    
    // App Market (Admin)
    setAppMarketMetadata(metadata: AppMarketMetadata): Promise<void>;
    getAppMarketMetadata(): Promise<Option<AppMarketMetadata>>;
    setPricingConfig(config: PricingConfig): Promise<void>;
    getPricingConfig(): Promise<Option<PricingConfig>>;
    getMarketAnalytics(): Promise<MarketAnalytics>;
    recordMarketView(): Promise<void>;
    
    // Stripe
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    isStripeConfigured(): Promise<boolean>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    
    // Smoke Test
    runSmokeTest(): Promise<SmokeTestResult>;
    
    // Transform
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
