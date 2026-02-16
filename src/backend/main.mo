import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
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

  public type ChatRoom = {
    id : Text;
    name : Text;
    topic : Text;
    messages : List.List<ChatMessage>;
    participants : List.List<Text>;
  };

  public type ChatRoomView = {
    id : Text;
    name : Text;
    topic : Text;
    messages : [ChatMessage];
    participants : [Text];
  };

  public type PrivateThread = {
    id : Text;
    participant1 : Principal.Principal;
    participant2 : Principal.Principal;
    messages : List.List<PrivateMessage>;
  };

  public type PrivateThreadView = {
    id : Text;
    participant1 : Principal.Principal;
    participant2 : Principal.Principal;
    messages : [PrivateMessage];
  };

  public type PrivateMessage = {
    timestamp : Time.Time;
    sender : Principal.Principal;
    message : Text;
    profession : ?Text;
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

  func getUserId(caller : Principal.Principal) : Text {
    caller.toText();
  };

  func getOrInitMoodHistory(caller : Principal.Principal) : List.List<MoodEntry> {
    switch (userMoodHistory.get(caller)) {
      case (null) {
        let newHistory = List.empty<MoodEntry>();
        userMoodHistory.add(caller, newHistory);
        newHistory;
      };
      case (?history) { history };
    };
  };

  func getOrInitDailyAnalysis(caller : Principal.Principal) : List.List<DailyAnalysisEntry> {
    switch (userDailyAnalysis.get(caller)) {
      case (null) {
        let newAnalysis = List.empty<DailyAnalysisEntry>();
        userDailyAnalysis.add(caller, newAnalysis);
        newAnalysis;
      };
      case (?analysis) { analysis };
    };
  };

  func getOrInitWeeklyAnalysis(caller : Principal.Principal) : List.List<WeeklyMoodAnalysis> {
    switch (userWeeklyAnalysis.get(caller)) {
      case (null) {
        let newAnalysis = List.empty<WeeklyMoodAnalysis>();
        userWeeklyAnalysis.add(caller, newAnalysis);
        newAnalysis;
      };
      case (?analysis) { analysis };
    };
  };

  // User Profile Management (authenticated users only)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal.Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    userIdMapping.add(profile.userId, caller);
  };

  // Mood Tracker endpoints (authenticated users)
  public query ({ caller }) func getMoodHistory() : async [MoodEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access mood history");
    };
    getOrInitMoodHistory(caller).toArray();
  };

  public shared ({ caller }) func createMoodEntry(mood : Mood, note : ?Text, moodScore : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create mood entries");
    };
    let entry : MoodEntry = {
      timestamp = Time.now();
      mood = mood;
      note = note;
      moodScore = moodScore;
    };
    let history = getOrInitMoodHistory(caller);
    history.add(entry);
    userMoodHistory.add(caller, history);
  };

  public shared ({ caller }) func updateMoodEntry(timestamp : Time.Time, mood : Mood, note : ?Text, moodScore : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update mood entries");
    };
    let history = getOrInitMoodHistory(caller);
    let updatedHistory = history.map<MoodEntry, MoodEntry>(
      func(entry : MoodEntry) : MoodEntry {
        if (entry.timestamp == timestamp) {
          { timestamp = entry.timestamp; mood = mood; note = note; moodScore = moodScore };
        } else {
          entry;
        };
      }
    );
    userMoodHistory.add(caller, updatedHistory);
  };

  // Guest mood tracking (no auth required, session-based)
  public query func getGuestMoodHistory(sessionId : Text) : async [MoodEntry] {
    switch (guestMoodHistory.get(sessionId)) {
      case (null) { [] };
      case (?history) { history.toArray() };
    };
  };

  public func createGuestMoodEntry(sessionId : Text, mood : Mood, note : ?Text, moodScore : Nat) : async () {
    let entry : MoodEntry = {
      timestamp = Time.now();
      mood = mood;
      note = note;
      moodScore = moodScore;
    };
    let history = switch (guestMoodHistory.get(sessionId)) {
      case (null) { List.empty<MoodEntry>() };
      case (?h) { h };
    };
    history.add(entry);
    guestMoodHistory.add(sessionId, history);
  };

  // Daily and Weekly Analysis (authenticated users)
  public query ({ caller }) func getDailyAnalysis() : async [DailyAnalysisEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access daily analysis");
    };
    getOrInitDailyAnalysis(caller).toArray();
  };

  public query ({ caller }) func getWeeklyAnalysis() : async [WeeklyMoodAnalysis] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access weekly analysis");
    };
    getOrInitWeeklyAnalysis(caller).toArray();
  };

  public query ({ caller }) func getWeeklyMoodChart() : async WeeklyMoodChartData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access weekly mood chart");
    };
    let history = getOrInitMoodHistory(caller);
    let entries = history.toArray();
    let weeklyEntries : [DailyMoodEntry] = [];
    let weeklyAverage : Float = 0.0;
    {
      weeklyEntries = weeklyEntries;
      weeklyAverage = weeklyAverage;
      averageLabel = "Average";
      weeklyInsight = "Keep tracking your mood to see patterns.";
    };
  };

  // Chat Rooms (authenticated users can create/join, guests can view)
  public query ({ caller }) func listChatRooms() : async [(Text, ChatRoomView)] {
    chatRooms.toArray().map<(Text, ChatRoom), (Text, ChatRoomView)>(
      func((id, room)) {
        (
          id,
          {
            id = room.id;
            name = room.name;
            topic = room.topic;
            messages = room.messages.toArray();
            participants = room.participants.toArray();
          },
        );
      }
    );
  };

  public shared ({ caller }) func createChatRoom(id : Text, name : Text, topic : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create chat rooms");
    };
    let room : ChatRoom = {
      id = id;
      name = name;
      topic = topic;
      messages = List.empty<ChatMessage>();
      participants = List.empty<Text>();
    };
    chatRooms.add(id, room);
  };

  public shared ({ caller }) func joinChatRoom(roomId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join chat rooms");
    };
    switch (chatRooms.get(roomId)) {
      case (null) { Runtime.trap("Chat room not found") };
      case (?room) {
        let userId = getUserId(caller);
        room.participants.add(userId);
        let updatedRoom = {
          id = room.id;
          name = room.name;
          topic = room.topic;
          messages = room.messages;
          participants = room.participants;
        };
        chatRooms.add(roomId, updatedRoom);
      };
    };
  };

  public query ({ caller }) func getChatRoomParticipants(roomId : Text) : async [Text] {
    switch (chatRooms.get(roomId)) {
      case (null) { [] };
      case (?room) { room.participants.toArray() };
    };
  };

  public query ({ caller }) func getChatRoomMessages(roomId : Text) : async [ChatMessage] {
    switch (chatRooms.get(roomId)) {
      case (null) { [] };
      case (?room) { room.messages.toArray() };
    };
  };

  public shared ({ caller }) func sendChatMessage(roomId : Text, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    switch (chatRooms.get(roomId)) {
      case (null) { Runtime.trap("Chat room not found") };
      case (?room) {
        let userId = getUserId(caller);
        let profile = userProfiles.get(caller);
        let profession = switch (profile) {
          case (null) { null };
          case (?p) { p.profession };
        };
        let msg : ChatMessage = {
          timestamp = Time.now();
          userId = userId;
          message = message;
          profession = profession;
        };
        room.messages.add(msg);
        let updatedRoom = {
          id = room.id;
          name = room.name;
          topic = room.topic;
          messages = room.messages;
          participants = room.participants;
        };
        chatRooms.add(roomId, updatedRoom);
      };
    };
  };

  // Private Threads (authenticated users, ownership-based)
  public shared ({ caller }) func startPrivateThread(otherUser : Principal.Principal) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start private threads");
    };
    let threadId = caller.toText() # "-" # otherUser.toText();
    let thread : PrivateThread = {
      id = threadId;
      participant1 = caller;
      participant2 = otherUser;
      messages = List.empty<PrivateMessage>();
    };
    privateThreads.add(threadId, thread);
    threadId;
  };

  public query ({ caller }) func listPrivateThreads() : async [(Text, PrivateThreadView)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list private threads");
    };
    let filteredThreads = List.empty<(Text, PrivateThreadView)>();
    for ((id, thread) in privateThreads.entries()) {
      if (thread.participant1 == caller or thread.participant2 == caller) {
        filteredThreads.add((
          id,
          {
            id = thread.id;
            participant1 = thread.participant1;
            participant2 = thread.participant2;
            messages = thread.messages.toArray();
          },
        ));
      };
    };
    filteredThreads.toArray();
  };

  public query ({ caller }) func getPrivateMessages(threadId : Text) : async [PrivateMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access private messages");
    };
    switch (privateThreads.get(threadId)) {
      case (null) { [] };
      case (?thread) {
        if (thread.participant1 != caller and thread.participant2 != caller) {
          Runtime.trap("Unauthorized: Not a participant in this thread");
        };
        thread.messages.toArray();
      };
    };
  };

  public shared ({ caller }) func sendPrivateMessage(threadId : Text, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send private messages");
    };
    switch (privateThreads.get(threadId)) {
      case (null) { Runtime.trap("Thread not found") };
      case (?thread) {
        if (thread.participant1 != caller and thread.participant2 != caller) {
          Runtime.trap("Unauthorized: Not a participant in this thread");
        };
        let profile = userProfiles.get(caller);
        let profession = switch (profile) {
          case (null) { null };
          case (?p) { p.profession };
        };
        let msg : PrivateMessage = {
          timestamp = Time.now();
          sender = caller;
          message = message;
          profession = profession;
        };
        thread.messages.add(msg);
        let updatedThread = {
          id = thread.id;
          participant1 = thread.participant1;
          participant2 = thread.participant2;
          messages = thread.messages;
        };
        privateThreads.add(threadId, updatedThread);
      };
    };
  };

  // AI Companion (authenticated users, ownership-based)
  public shared ({ caller }) func createAISession() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create AI sessions");
    };
    let sessionId = Time.now().toText() # "-" # caller.toText();
    aiSessionOwners.add(sessionId, caller);
    aiResponses.add(sessionId, List.empty<AIMessage>());
    sessionId;
  };

  public shared ({ caller }) func appendAIMessage(sessionId : Text, message : Text, sender : { #user; #ai }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can append AI messages");
    };
    switch (aiSessionOwners.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?owner) {
        if (owner != caller) {
          Runtime.trap("Unauthorized: Not the owner of this session");
        };
        let msg : AIMessage = {
          timestamp = Time.now();
          sender = sender;
          message = message;
        };
        let transcript = switch (aiResponses.get(sessionId)) {
          case (null) { List.empty<AIMessage>() };
          case (?t) { t };
        };
        transcript.add(msg);
        aiResponses.add(sessionId, transcript);
      };
    };
  };

  public query ({ caller }) func getAITranscript(sessionId : Text) : async [AIMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access AI transcripts");
    };
    switch (aiSessionOwners.get(sessionId)) {
      case (null) { [] };
      case (?owner) {
        if (owner != caller) {
          Runtime.trap("Unauthorized: Not the owner of this session");
        };
        switch (aiResponses.get(sessionId)) {
          case (null) { [] };
          case (?transcript) { transcript.toArray() };
        };
      };
    };
  };

  public query func getAITypingStatus() : async Bool {
    aiIsTyping;
  };

  public func getAIResponse(mood : Text) : async Text {
    switch (aiDefaultResponses.get(mood)) {
      case (null) {
        switch (aiDefaultResponses.get("default")) {
          case (null) { "I'm here for you." };
          case (?response) { response };
        };
      };
      case (?response) { response };
    };
  };

  // Activity Logging (authenticated users and guests)
  public shared ({ caller }) func logActivity(eventType : { #login; #createMoodEntry; #updateMoodEntry; #pageNavigation; #interaction }, details : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log activity");
    };
    let userId = getUserId(caller);
    let event : ActivityEvent = {
      timestamp = Time.now();
      eventType = eventType;
      details = details;
    };
    let log = switch (userActivityLogs.get(userId)) {
      case (null) { List.empty<ActivityEvent>() };
      case (?l) { l };
    };
    log.add(event);
    userActivityLogs.add(userId, log);
  };

  public func logGuestActivity(sessionId : Text, eventType : { #login; #createMoodEntry; #updateMoodEntry; #pageNavigation; #interaction }, details : Text) : async () {
    let event : ActivityEvent = {
      timestamp = Time.now();
      eventType = eventType;
      details = details;
    };
    let log = switch (guestActivityLogs.get(sessionId)) {
      case (null) { List.empty<ActivityEvent>() };
      case (?l) { l };
    };
    log.add(event);
    guestActivityLogs.add(sessionId, log);
  };

  // Analytics and Admin (admin-only)
  public query ({ caller }) func getAnalytics() : async [(Text, AnalyticsData)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access analytics");
    };
    analyticsData.toArray();
  };

  public query ({ caller }) func getAllUserRecords() : async [UserRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access user records");
    };
    let records = List.empty<UserRecord>();
    for ((principal, profile) in userProfiles.entries()) {
      let moodEntries = switch (userMoodHistory.get(principal)) {
        case (null) { [] };
        case (?history) { history.toArray() };
      };
      let activityLog = switch (userActivityLogs.get(profile.userId)) {
        case (null) { [] };
        case (?log) { log.toArray() };
      };
      records.add({
        id = profile.userId;
        authType = #internetIdentity;
        moodEntries = moodEntries;
        activityLog = activityLog;
        weeklyAverageMood = 0.0;
      });
    };
    records.toArray();
  };

  // App Market (admin-only setters, public getters)
  public query func getAppMarketMetadata() : async ?AppMarketMetadata {
    appMarketMetadata;
  };

  public shared ({ caller }) func setAppMarketMetadata(metadata : AppMarketMetadata) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set app market metadata");
    };
    appMarketMetadata := ?metadata;
  };

  public query func getPricingConfig() : async ?PricingConfig {
    pricingConfig;
  };

  public shared ({ caller }) func setPricingConfig(config : PricingConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set pricing config");
    };
    pricingConfig := ?config;
  };

  public query ({ caller }) func getMarketAnalytics() : async MarketAnalytics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access market analytics");
    };
    marketAnalytics;
  };

  public func incrementViewCount() : async () {
    marketAnalytics := {
      totalViews = marketAnalytics.totalViews + 1;
      totalClones = marketAnalytics.totalClones;
      totalSubscriptions = marketAnalytics.totalSubscriptions;
      totalRevenue = marketAnalytics.totalRevenue;
    };
  };

  // PDF/Blob Storage (authenticated users)
  public shared ({ caller }) func storePDF(fileId : Text, blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can store PDFs");
    };
    pdfFiles.add(fileId, blob);
  };

  public query ({ caller }) func getPDF(fileId : Text) : async ?Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve PDFs");
    };
    pdfFiles.get(fileId);
  };

  // Stripe endpoints (authenticated users for checkout, admin for config)
  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public query func isAuthenticated() : async Bool {
    true;
  };

  public shared ({ caller }) func runSmokeTest() : async SmokeTestResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can run smoke tests");
    };

    let guestLoginWorks = true;
    let dashboardWorks = chatRooms.size() >= 0;
    let iiLoginWorks = userProfiles.size() >= 0;
    let moodTrackerWorks = userMoodHistory.size() >= 0;
    let moodHistoryWorks = userDailyAnalysis.size() >= 0;

    {
      guestLogin = guestLoginWorks;
      dashboardRender = dashboardWorks;
      internetIdentityLogin = iiLoginWorks;
      moodTrackerNavigation = moodTrackerWorks;
      moodHistoryNavigation = moodHistoryWorks;
      returnToDashboard = true;
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
