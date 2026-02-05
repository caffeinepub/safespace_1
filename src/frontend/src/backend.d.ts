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
export interface AIResponse {
    suggestions: Array<string>;
    reflectiveListening: string;
    patterns: Array<string>;
    gentleIntakeQuestions: Array<string>;
    response: string;
    guidance: string;
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
export interface MarketAnalytics {
    totalViews: bigint;
    totalSubscriptions: bigint;
    totalRevenue: bigint;
    totalClones: bigint;
}
export interface ActivityEvent {
    timestamp: Time;
    details: string;
    eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry;
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
export type Principal = Principal;
export interface MoodLogEntry {
    principal: Principal;
    userId: string;
    mood: Mood;
    note?: string;
    timestamp: Time;
}
export interface UserData {
    principal: Principal;
    moodEntryCount: bigint;
    userId: string;
    lastActivity?: Time;
    profession?: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface WeeklyMoodAnalysis {
    anomalies: Array<Anomaly>;
    weeklySummaries: Array<WeeklySummary>;
    clusters: Array<WeeklyCluster>;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createChatRoom(id: string, name: string, topic: string): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createPrivateThread(threadId: string, participant1: Principal, participant2: Principal): Promise<void>;
    getAIConversation(sessionId: string): Promise<Array<AIMessage>>;
    getAggregatedAnalytics(): Promise<AnalyticsData>;
    getAllMoodLogs(): Promise<Array<MoodLogEntry>>;
    getAllUserData(): Promise<Array<UserData>>;
    getAppMarketMetadata(): Promise<AppMarketMetadata | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatMessages(roomId: string): Promise<Array<ChatMessage>>;
    getChatRooms(): Promise<Array<[string, {
            id: string;
            topic: string;
            name: string;
            participantCount: bigint;
        }]>>;
    getDailyAnalysis(): Promise<Array<DailyAnalysisEntry>>;
    getDailyAnalysisGuest(guestId: string): Promise<DailyAnalysisEntry | null>;
    getMarketAnalytics(): Promise<MarketAnalytics>;
    getMoodHistory(): Promise<Array<MoodEntry>>;
    getMoodHistoryGuest(guestId: string): Promise<Array<MoodEntry>>;
    getMyPrivateThreads(): Promise<Array<string>>;
    getPDF(filename: string): Promise<ExternalBlob | null>;
    getPricingConfig(): Promise<PricingConfig | null>;
    getPrivateMessages(threadId: string): Promise<Array<PrivateMessage>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRecordById(userId: string): Promise<UserRecord | null>;
    getUserRecords(): Promise<Array<UserRecord>>;
    getWeeklyMoodChartData(): Promise<WeeklyMoodChartData>;
    getWeeklyMoodInsights(): Promise<Array<WeeklyMoodAnalysis>>;
    incrementAppViews(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    joinChatRoom(roomId: string, userId: string): Promise<void>;
    logGuestActivityPublic(guestId: string, eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry, details: string): Promise<void>;
    logUserActivity(eventType: Variant_pageNavigation_interaction_createMoodEntry_login_updateMoodEntry, details: string): Promise<void>;
    recordCloneRequest(amount: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDailyAnalysis(entry: DailyAnalysisEntry): Promise<void>;
    saveDailyAnalysisGuest(guestId: string, entry: DailyAnalysisEntry): Promise<string>;
    saveMood(entry: MoodEntry): Promise<void>;
    saveMoodGuest(guestId: string, entry: MoodEntry): Promise<string>;
    saveWeeklyAnalysis(analysis: WeeklyMoodAnalysis): Promise<void>;
    sendAIMessage(sessionId: string, message: string): Promise<AIResponse>;
    sendChatMessage(roomId: string, message: ChatMessage): Promise<void>;
    sendPrivateMessage(threadId: string, message: PrivateMessage): Promise<void>;
    setAppMarketMetadata(metadata: AppMarketMetadata): Promise<void>;
    setPricingConfig(config: PricingConfig): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateMood(timestamp: Time, entry: MoodEntry): Promise<void>;
    updateMoodGuest(guestId: string, timestamp: Time, entry: MoodEntry): Promise<string>;
    uploadPDF(filename: string, content: ExternalBlob): Promise<void>;
}
