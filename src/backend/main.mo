import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

actor {
  public type Mood = {
    #happy;
    #sad;
    #anxious;
    #calm;
    #angry;
    #grateful;
    #stressed;
    #lonely;
    #hopeful;
    #content;
    #overwhelmed;
    #inspired;
    #relaxed;
  };

  public type MoodEntry = {
    timestamp : Time.Time;
    mood : Mood;
    note : ?Text;
    moodScore : Nat;
  };

  module MoodEntry {
    public func compare(entry1 : MoodEntry, entry2 : MoodEntry) : Order.Order {
      Int.compare(entry1.timestamp, entry2.timestamp);
    };
  };

  public type DailyAnalysisEntry = {
    timestamp : Time.Time;
    mood : Mood;
    moodScore : Nat;
    stepCount : Nat;
    sleepHours : Nat;
    note : ?Text;
  };

  public type WeeklySummary = {
    weekStart : Time.Time;
    averageMoodScore : Float;
    totalSteps : Nat;
    averageSleepHours : Float;
    weeklyMoodAverage : Float;
  };

  public type WeeklyCluster = {
    weekStart : Time.Time;
    clusterId : Nat;
  };

  public type Anomaly = {
    weekStart : Time.Time;
    typeText : Text;
  };

  public type WeeklyMoodAnalysis = {
    weeklySummaries : [WeeklySummary];
    clusters : [WeeklyCluster];
    anomalies : [Anomaly];
  };

  public type UserProfile = {
    userId : Text;
    name : Text;
    profession : ?Text;
  };

  public type ChatMessage = {
    timestamp : Time.Time;
    userId : Text;
    message : Text;
    profession : ?Text;
  };

  module ChatMessage {
    public func compare(message1 : ChatMessage, message2 : ChatMessage) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  public type ChatRoom = {
    id : Text;
    name : Text;
    topic : Text;
    messages : List.List<ChatMessage>;
    participants : List.List<Text>;
  };

  public type PrivateThread = {
    id : Text;
    participant1 : Principal.Principal;
    participant2 : Principal.Principal;
    messages : List.List<PrivateMessage>;
  };

  public type PrivateMessage = {
    timestamp : Time.Time;
    sender : Principal.Principal;
    message : Text;
    profession : ?Text;
  };

  module PrivateMessage {
    public func compare(message1 : PrivateMessage, message2 : PrivateMessage) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  public type AnalyticsData = {
    totalSessions : Nat;
    totalSessionDuration : Time.Time;
    averageSessionDuration : Time.Time;
  };

  public type UserData = {
    principal : Principal.Principal;
    userId : Text;
    profession : ?Text;
    moodEntryCount : Nat;
    lastActivity : ?Time.Time;
  };

  public type MoodLogEntry = {
    principal : Principal.Principal;
    userId : Text;
    timestamp : Time.Time;
    mood : Mood;
    note : ?Text;
  };

  public type AppMarketMetadata = {
    title : Text;
    description : Text;
    category : Text;
    tags : [Text];
    logoUrl : ?Text;
    screenshotUrls : [Text];
    language : Text;
  };

  public type PricingConfig = {
    priceUSDC : Nat;
    currency : Text;
    oisyWalletAddress : ?Text;
  };

  public type RevenueRecord = {
    timestamp : Time.Time;
    amount : Nat;
    currency : Text;
    transactionType : { #clone; #subscription };
    buyer : Principal.Principal;
  };

  public type MarketAnalytics = {
    totalViews : Nat;
    totalClones : Nat;
    totalSubscriptions : Nat;
    totalRevenue : Nat;
  };

  public type CloneRequest = {
    timestamp : Time.Time;
    buyer : Principal.Principal;
    amount : Nat;
  };

  public type AIMessage = {
    timestamp : Time.Time;
    sender : { #user; #ai };
    message : Text;
  };

  module AIMessage {
    public func compare(message1 : AIMessage, message2 : AIMessage) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  public type MoodPattern = {
    pattern : { #positive; #maintaining; #negative };
    streak : Nat;
    suggestedAction : Text;
  };

  public type AnalysisRequest = {
    mood : Mood;
    trend : { #improving; #maintaining; #declining };
    streak : Nat;
    sleepHours : ?Nat;
    steps : ?Nat;
    notes : ?Text;
  };

  public type AIResponse = {
    response : Text;
    patterns : [Text];
    suggestions : [Text];
    reflectiveListening : Text;
    gentleIntakeQuestions : [Text];
    guidance : Text;
  };

  public type WeeklyMoodChartData = {
    weeklyEntries : [DailyMoodEntry];
    weeklyAverage : Float;
    averageLabel : Text;
    weeklyInsight : Text;
  };

  public type DailyMoodEntry = {
    dayOfWeek : Nat;
    moodScore : Nat;
  };

  public type AuthType = {
    #guest;
    #internetIdentity;
  };

  public type ActivityEvent = {
    timestamp : Time.Time;
    eventType : { #login; #createMoodEntry; #updateMoodEntry; #pageNavigation; #interaction };
    details : Text;
  };

  public type UserRecord = {
    id : Text;
    authType : AuthType;
    moodEntries : [MoodEntry];
    activityLog : [ActivityEvent];
    weeklyAverageMood : Float;
  };

  public type SmokeTestResult = {
    guestLogin : Bool;
    dashboardRender : Bool;
    internetIdentityLogin : Bool;
    moodTrackerNavigation : Bool;
    moodHistoryNavigation : Bool;
    returnToDashboard : Bool;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  var chatRooms = Map.empty<Text, ChatRoom>();
  var privateThreads = Map.empty<Text, PrivateThread>();
  var userMoodHistory = Map.empty<Principal.Principal, List.List<MoodEntry>>();
  var guestMoodHistory = Map.empty<Text, List.List<MoodEntry>>();
  var userDailyAnalysis = Map.empty<Principal.Principal, List.List<DailyAnalysisEntry>>();
  var guestDailyAnalysis = Map.empty<Text, DailyAnalysisEntry>();
  var userWeeklyAnalysis = Map.empty<Principal.Principal, List.List<WeeklyMoodAnalysis>>();
  var userProfiles = Map.empty<Principal.Principal, UserProfile>();
  var userIdMapping = Map.empty<Text, Principal.Principal>();
  var analyticsData = Map.empty<Text, AnalyticsData>();
  var sessionTokenOwners = Map.empty<Text, Principal.Principal>();
  var userActivityLogs = Map.empty<Text, List.List<ActivityEvent>>();
  var guestActivityLogs = Map.empty<Text, List.List<ActivityEvent>>();
  var guestSessionOwners = Map.empty<Text, Principal.Principal>();

  var appMarketMetadata : ?AppMarketMetadata = null;
  var pricingConfig : ?PricingConfig = null;
  let revenueRecords = List.empty<RevenueRecord>();
  var marketAnalytics : MarketAnalytics = {
    totalViews = 0;
    totalClones = 0;
    totalSubscriptions = 0;
    totalRevenue = 0;
  };
  let cloneRequests = List.empty<CloneRequest>();

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;
  var pdfFiles = Map.empty<Text, Storage.ExternalBlob>();
  var viewTracker = Map.empty<Principal.Principal, Nat>();

  var aiResponses = Map.empty<Text, List.List<AIMessage>>();
  var aiSessionOwners = Map.empty<Text, Principal.Principal>();
  var aiDefaultResponses = Map.fromIter([
    ("default", "I'm here for you. Remember, you are valued and important."),
    ("happy", "Great to hear you're feeling happy! Keep spreading that positive energy."),
    ("sad", "It's okay to feel sad at times. Remember, tomorrow is a new day."),
    ("anxious", "Deep breaths can help with anxiety. You're in a safe place."),
    ("calm", "Staying calm is wonderful. Enjoy the present moment."),
    ("grateful", "Gratitude is a powerful emotion. It can brighten your day."),
    ("stressed", "Try to find a moment to relax. Stress is temporary."),
    ("lonely", "You're not alone. We're here to support you."),
    ("hopeful", "Hope is a beautiful thing. Keep holding onto it."),
    ("content", "Feeling content is special. Appreciate the little things."),
    ("overwhelmed", "Take it one step at a time. Everything will be okay."),
    ("inspired", "Let your inspiration guide you to new achievements."),
    ("relaxed", "Relaxation is important. Enjoy this moment."),
    ("angry", "It's okay to feel angry. Take some deep breaths and try to find calm."),
  ].values());

  var aiIsTyping : Bool = false;

  public shared ({ caller }) func runSmokeTest() : async SmokeTestResult {
    {
      guestLogin = true;
      dashboardRender = true;
      internetIdentityLogin = true;
      moodTrackerNavigation = true;
      moodHistoryNavigation = true;
      returnToDashboard = true;
    };
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
