import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface AnalyticsData {
    totalSessionDuration: Time;
    averageSessionDuration: Time;
    totalSessions: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface ChatRoomView {
    id: string;
    participants: Array<string>;
    topic: string;
    messages: Array<ChatMessage>;
    name: string;
}
export interface UserRecord {
    id: string;
    authType: AuthType;
    moodEntries: Array<MoodEntry>;
    weeklyAverageMood: number;
    activityLog: Array<ActivityEvent>;
}
export interface MoodEntry {
    mood: Mood;
    note?: string;
    timestamp: Time;
    moodScore: bigint;
}
export interface WeeklySummary {
    weeklyMoodAverage: number;
    averageSleepHours: number;
    totalSteps: bigint;
    weekStart: Time;
    averageMoodScore: number;
}
export interface DailyMoodEntry {
    dayOfWeek: bigint;
    moodScore: bigint;
}
export interface PricingConfig {
    oisyWalletAddress?: string;
    currency: string;
    priceUSDC: bigint;
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
export interface MarketAnalytics {
    totalViews: bigint;
    totalSubscriptions: bigint;
    totalRevenue: bigint;
    totalClones: bigint;
}
export interface ChatMessage {
    userId: string;
    profession?: string;
    message: string;
    timestamp: Time;
}
export interface WeeklyCluster {
    clusterId: bigint;
    weekStart: Time;
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
export interface AppMarketMetadata {
    screenshotUrls: Array<string>;
    title: string;
    tags: Array<string>;
    description: string;
    language: string;
    logoUrl?: string;
    category: string;
}
export interface ActivityEvent {
    timestamp: Time;
    details: string;
    eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry;
}
export interface Anomaly {
    typeText: string;
    weekStart: Time;
}
export interface DailyAnalysisEntry {
    mood: Mood;
    note?: string;
    timestamp: Time;
    moodScore: bigint;
    stepCount: bigint;
    sleepHours: bigint;
}
export interface PrivateThreadView {
    id: string;
    participant1: Principal;
    participant2: Principal;
    messages: Array<PrivateMessage>;
}
export type Principal = Principal;
export interface WeeklyMoodAnalysis {
    anomalies: Array<Anomaly>;
    weeklySummaries: Array<WeeklySummary>;
    clusters: Array<WeeklyCluster>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PrivateMessage {
    profession?: string;
    sender: Principal;
    message: string;
    timestamp: Time;
}
export interface AIMessage {
    sender: Variant_ai_user;
    message: string;
    timestamp: Time;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface WeeklyMoodChartData {
    weeklyAverage: number;
    weeklyEntries: Array<DailyMoodEntry>;
    averageLabel: string;
    weeklyInsight: string;
}
export interface UserProfile {
    userId: string;
    name: string;
    profession?: string;
}
export enum AuthType {
    internetIdentity = "internetIdentity",
    guest = "guest"
}
export enum Mood {
    sad = "sad",
    hopeful = "hopeful",
    inspired = "inspired",
    content = "content",
    anxious = "anxious",
    happy = "happy",
    angry = "angry",
    calm = "calm",
    relaxed = "relaxed",
    grateful = "grateful",
    lonely = "lonely",
    overwhelmed = "overwhelmed",
    stressed = "stressed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_ai_user {
    ai = "ai",
    user = "user"
}
export enum Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry {
    pageNavigation = "pageNavigation",
    interaction = "interaction",
    createMoodEntry = "createMoodEntry",
    login = "login",
    updateMoodEntry = "updateMoodEntry"
}
export interface backendInterface {
    appendAIMessage(sessionId: string, message: string, sender: Variant_ai_user): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAISession(): Promise<string>;
    createChatRoom(id: string, name: string, topic: string): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createGuestMoodEntry(sessionId: string, mood: Mood, note: string | null, moodScore: bigint): Promise<void>;
    createMoodEntry(mood: Mood, note: string | null, moodScore: bigint): Promise<void>;
    getAIResponse(mood: string): Promise<string>;
    getAITranscript(sessionId: string): Promise<Array<AIMessage>>;
    getAITypingStatus(): Promise<boolean>;
    getAllUserRecords(): Promise<Array<UserRecord>>;
    getAnalytics(): Promise<Array<[string, AnalyticsData]>>;
    getAppMarketMetadata(): Promise<AppMarketMetadata | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatRoomMessages(roomId: string): Promise<Array<ChatMessage>>;
    getChatRoomParticipants(roomId: string): Promise<Array<string>>;
    getDailyAnalysis(): Promise<Array<DailyAnalysisEntry>>;
    getGuestMoodHistory(sessionId: string): Promise<Array<MoodEntry>>;
    getMarketAnalytics(): Promise<MarketAnalytics>;
    getMoodHistory(): Promise<Array<MoodEntry>>;
    getPDF(fileId: string): Promise<ExternalBlob | null>;
    getPricingConfig(): Promise<PricingConfig | null>;
    getPrivateMessages(threadId: string): Promise<Array<PrivateMessage>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklyAnalysis(): Promise<Array<WeeklyMoodAnalysis>>;
    getWeeklyMoodChart(): Promise<WeeklyMoodChartData>;
    incrementViewCount(): Promise<void>;
    isAuthenticated(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    joinChatRoom(roomId: string): Promise<void>;
    listChatRooms(): Promise<Array<[string, ChatRoomView]>>;
    listPrivateThreads(): Promise<Array<[string, PrivateThreadView]>>;
    logActivity(eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry, details: string): Promise<void>;
    logGuestActivity(sessionId: string, eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry, details: string): Promise<void>;
    runSmokeTest(): Promise<SmokeTestResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendChatMessage(roomId: string, message: string): Promise<void>;
    sendPrivateMessage(threadId: string, message: string): Promise<void>;
    setAppMarketMetadata(metadata: AppMarketMetadata): Promise<void>;
    setPricingConfig(config: PricingConfig): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    startPrivateThread(otherUser: Principal): Promise<string>;
    storePDF(fileId: string, blob: ExternalBlob): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateMoodEntry(timestamp: Time, mood: Mood, note: string | null, moodScore: bigint): Promise<void>;
}
