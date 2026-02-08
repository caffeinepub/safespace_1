import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import Float "mo:core/Float";



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

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let chatRooms = Map.empty<Text, ChatRoom>();
  let privateThreads = Map.empty<Text, PrivateThread>();
  let userMoodHistory = Map.empty<Principal.Principal, List.List<MoodEntry>>();
  let guestMoodHistory = Map.empty<Text, List.List<MoodEntry>>();
  let userDailyAnalysis = Map.empty<Principal.Principal, List.List<DailyAnalysisEntry>>();
  let guestDailyAnalysis = Map.empty<Text, DailyAnalysisEntry>();
  let userWeeklyAnalysis = Map.empty<Principal.Principal, List.List<WeeklyMoodAnalysis>>();
  let userProfiles = Map.empty<Principal.Principal, UserProfile>();
  let userIdMapping = Map.empty<Text, Principal.Principal>();
  let analyticsData = Map.empty<Text, AnalyticsData>();
  let sessionTokenOwners = Map.empty<Text, Principal.Principal>();
  let userActivityLogs = Map.empty<Text, List.List<ActivityEvent>>();
  let guestActivityLogs = Map.empty<Text, List.List<ActivityEvent>>();

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

  let pdfFiles = Map.empty<Text, Storage.ExternalBlob>();

  let viewTracker = Map.empty<Principal.Principal, Nat>();

  let aiResponses = Map.empty<Text, List.List<AIMessage>>();
  let aiDefaultResponses = Map.fromIter([
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

  private func logActivity(userId : Text, eventType : { #login; #createMoodEntry; #updateMoodEntry; #pageNavigation; #interaction }, details : Text) {
    let event : ActivityEvent = {
      timestamp = Time.now();
      eventType = eventType;
      details = details;
    };

    let currentLog = switch (userActivityLogs.get(userId)) {
      case (null) { List.empty<ActivityEvent>() };
      case (?log) { log };
    };
    currentLog.add(event);
    userActivityLogs.add(userId, currentLog);
  };

  private func logGuestActivity(guestId : Text, eventType : { #login; #createMoodEntry; #updateMoodEntry; #pageNavigation; #interaction }, details : Text) {
    let event : ActivityEvent = {
      timestamp = Time.now();
      eventType = eventType;
      details = details;
    };

    let currentLog = switch (guestActivityLogs.get(guestId)) {
      case (null) { List.empty<ActivityEvent>() };
      case (?log) { log };
    };
    currentLog.add(event);
    guestActivityLogs.add(guestId, currentLog);
  };

  public shared ({ caller }) func logUserActivity(eventType : { #login; #createMoodEntry; #updateMoodEntry; #pageNavigation; #interaction }, details : Text) : async () {
    let userId = switch (userProfiles.get(caller)) {
      case (null) { caller.toText() };
      case (?profile) { profile.userId };
    };
    logActivity(userId, eventType, details);
  };

  public shared func logGuestActivityPublic(guestId : Text, eventType : { #login; #createMoodEntry; #updateMoodEntry; #pageNavigation; #interaction }, details : Text) : async () {
    validateGuestAccess(guestId);
    logGuestActivity(guestId, eventType, details);
  };

  public query ({ caller }) func getUserRecords() : async [UserRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access user records");
    };

    let records = List.empty<UserRecord>();
    var currentRecords = records;

    let guestMoodEntries = guestMoodHistory.entries();
    for ((guestId, moodEntries) in guestMoodEntries) {
      let activityLog = switch (guestActivityLogs.get(guestId)) {
        case (null) { List.empty<ActivityEvent>() };
        case (?log) { log };
      };
      currentRecords.add({
        id = guestId;
        authType = #guest;
        moodEntries = moodEntries.toArray();
        activityLog = activityLog.toArray();
        weeklyAverageMood = calculateWeeklyAverage(moodEntries.toArray());
      });
    };

    let userMoodEntries = userMoodHistory.entries();
    for ((principal, moodEntries) in userMoodEntries) {
      let userId = switch (userProfiles.get(principal)) {
        case (null) { principal.toText() };
        case (?profile) { profile.userId };
      };
      let activityLog = switch (userActivityLogs.get(userId)) {
        case (null) { List.empty<ActivityEvent>() };
        case (?log) { log };
      };
      currentRecords.add({
        id = userId;
        authType = #internetIdentity;
        moodEntries = moodEntries.toArray();
        activityLog = activityLog.toArray();
        weeklyAverageMood = calculateWeeklyAverage(moodEntries.toArray());
      });
    };

    currentRecords.toArray();
  };

  public query ({ caller }) func getUserRecordById(userId : Text) : async ?UserRecord {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access user records");
    };

    switch (guestMoodHistory.get(userId)) {
      case (?moodEntries) {
        let activityLog = switch (guestActivityLogs.get(userId)) {
          case (null) { List.empty<ActivityEvent>() };
          case (?log) { log };
        };
        return ?{
          id = userId;
          authType = #guest;
          moodEntries = moodEntries.toArray();
          activityLog = activityLog.toArray();
          weeklyAverageMood = calculateWeeklyAverage(moodEntries.toArray());
        };
      };
      case (null) {};
    };

    switch (userIdMapping.get(userId)) {
      case (?principal) {
        switch (userMoodHistory.get(principal)) {
          case (?moodEntries) {
            let activityLog = switch (userActivityLogs.get(userId)) {
              case (null) { List.empty<ActivityEvent>() };
              case (?log) { log };
            };
            return ?{
              id = userId;
              authType = #internetIdentity;
              moodEntries = moodEntries.toArray();
              activityLog = activityLog.toArray();
              weeklyAverageMood = calculateWeeklyAverage(moodEntries.toArray());
            };
          };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };

  private func calculateWeeklyAverage(entries : [MoodEntry]) : Float {
    let now = Time.now();
    let weekStartTime = now - (now / 86_400_000_000_000 % 7) * 86_400_000_000_000;
    let weeklyEntries = entries.filter(
      func(entry) {
        entry.timestamp >= weekStartTime and entry.timestamp < weekStartTime + (7 * 86_400_000_000_000);
      }
    );

    if (weeklyEntries.size() == 0) {
      return 0.0;
    };

    var sum = 0;
    for (entry in weeklyEntries.values()) {
      sum += entry.moodScore;
    };
    sum.toFloat() / weeklyEntries.size().toInt().toFloat();
  };

  private func validateGuestAccess(guestId : Text) {
    if (guestId.size() == 0) {
      Runtime.trap("Guest ID cannot be empty");
    };
  };

  public shared ({ caller }) func saveMood(entry : MoodEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save mood entries");
    };
    let currentHistory = switch (userMoodHistory.get(caller)) {
      case (null) { List.empty<MoodEntry>() };
      case (?history) { history };
    };
    currentHistory.add(entry);
    userMoodHistory.add(caller, currentHistory);

    let userId = switch (userProfiles.get(caller)) {
      case (null) { caller.toText() };
      case (?profile) { profile.userId };
    };
    logActivity(userId, #createMoodEntry, "Mood entry created");
  };

  public shared ({ caller }) func updateMood(timestamp : Time.Time, entry : MoodEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update mood entries");
    };
    let currentHistory = switch (userMoodHistory.get(caller)) {
      case (null) { List.empty<MoodEntry>() };
      case (?history) { history };
    };

    let filteredHistory = currentHistory.filter(func(e) { e.timestamp != timestamp });
    filteredHistory.add(entry);
    userMoodHistory.add(caller, filteredHistory);

    let userId = switch (userProfiles.get(caller)) {
      case (null) { caller.toText() };
      case (?profile) { profile.userId };
    };
    logActivity(userId, #updateMoodEntry, "Mood entry updated");
  };

  public query ({ caller }) func getMoodHistory() : async [MoodEntry] {
    switch (userMoodHistory.get(caller)) {
      case (null) { [] };
      case (?history) {
        let arr = history.toArray();
        arr.sort();
      };
    };
  };

  public shared ({ caller }) func saveDailyAnalysis(entry : DailyAnalysisEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save daily analysis");
    };
    let currentAnalysis = switch (userDailyAnalysis.get(caller)) {
      case (null) { List.empty<DailyAnalysisEntry>() };
      case (?analysis) { analysis };
    };
    currentAnalysis.add(entry);
    userDailyAnalysis.add(caller, currentAnalysis);
  };

  public query ({ caller }) func getDailyAnalysis() : async [DailyAnalysisEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily analysis");
    };
    switch (userDailyAnalysis.get(caller)) {
      case (null) { [] };
      case (?analysis) { analysis.toArray() };
    };
  };

  public shared ({ caller }) func saveWeeklyAnalysis(analysis : WeeklyMoodAnalysis) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save weekly analysis");
    };
    let currentAnalysis = switch (userWeeklyAnalysis.get(caller)) {
      case (null) { List.empty<WeeklyMoodAnalysis>() };
      case (?analyses) { analyses };
    };
    currentAnalysis.add(analysis);
    userWeeklyAnalysis.add(caller, currentAnalysis);
  };

  public query ({ caller }) func getWeeklyMoodChartData() : async WeeklyMoodChartData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view weekly mood chart data");
    };
    switch (userMoodHistory.get(caller)) {
      case (null) { Runtime.trap("No mood entries found") };
      case (?history) {
        let weekStartTime = getCurrentWeekStart();
        let weeklyEntries = history.values().toArray().filter(
          func(entry) {
            entry.timestamp >= weekStartTime and entry.timestamp < weekStartTime + (7 * 86_400_000_000_000);
          }
        );

        let moodScores = Array.tabulate(7, func(_) { 0 });

        let updatedMoodScores = weeklyEntries.foldLeft(
          moodScores,
          func(scores, entry) {
            let dayOffset = getDayOfWeek(entry.timestamp, weekStartTime);
            if (dayOffset < 7) {
              var current = scores[dayOffset];
              current += entry.moodScore;
              scores;
            } else {
              scores;
            };
          },
        );

        var weeklySum = 0;
        for (score in weeklyEntries.values()) {
          weeklySum += score.moodScore;
        };

        let weeklyAverage = if (weeklyEntries.size() > 0) {
          weeklySum.toFloat() / weeklyEntries.size().toInt().toFloat();
        } else {
          0.0;
        };

        let chartData = {
          weeklyEntries = Array.tabulate(
            7,
            func(i) {
              {
                dayOfWeek = i;
                moodScore = if (i < updatedMoodScores.size()) { updatedMoodScores[i] } else { 0 };
              };
            },
          );
          weeklyAverage = weeklyAverage;
          averageLabel = deriveAverageLabel(weeklyAverage);
          weeklyInsight = deriveWeeklyInsight(weeklyAverage);
        };

        chartData;
      };
    };
  };

  func getCurrentWeekStart() : Time.Time {
    let now = Time.now();
    let currentDayCount = now / 86_400_000_000_000;
    let daysSinceMonday = (currentDayCount + 6) % 7;
    now - (daysSinceMonday * 86_400_000_000_000);
  };

  func getDayOfWeek(timestamp : Time.Time, weekStart : Time.Time) : Nat {
    let dayOffset = ((timestamp - weekStart) / 86_400_000_000_000).toNat();
    if (dayOffset < 7) { dayOffset } else { 0 };
  };

  func deriveAverageLabel(averageMood : Float) : Text {
    if (averageMood >= 8.0) {
      "Very Positive";
    } else if (averageMood >= 6.0) {
      "Positive";
    } else if (averageMood >= 4.0) {
      "Neutral";
    } else if (averageMood >= 2.0) {
      "Low";
    } else {
      "Very Low";
    };
  };

  func deriveWeeklyInsight(averageMood : Float) : Text {
    if (averageMood >= 8.0) {
      "You have had a consistently positive week.";
    } else if (averageMood >= 6.0) {
      "Your mood trend shows overall positivity.";
    } else if (averageMood >= 4.0) {
      "You have maintained a balanced mood range.";
    } else if (averageMood >= 2.0) {
      "This week shows a noticeable trend towards challenges.";
    } else {
      "Your mood entries indicate a significant challenge this week.";
    };
  };

  public shared func saveMoodGuest(guestId : Text, entry : MoodEntry) : async Text {
    validateGuestAccess(guestId);
    let currentHistory = switch (guestMoodHistory.get(guestId)) {
      case (null) { List.empty<MoodEntry>() };
      case (?history) { history };
    };
    currentHistory.add(entry);
    guestMoodHistory.add(guestId, currentHistory);
    logGuestActivity(guestId, #createMoodEntry, "Mood entry created");
    "Mood entry saved successfully for guest " # guestId;
  };

  public shared func updateMoodGuest(guestId : Text, timestamp : Time.Time, entry : MoodEntry) : async Text {
    validateGuestAccess(guestId);
    let currentHistory = switch (guestMoodHistory.get(guestId)) {
      case (null) { List.empty<MoodEntry>() };
      case (?history) { history };
    };

    let filteredHistory = currentHistory.filter(func(e) { e.timestamp != timestamp });
    filteredHistory.add(entry);
    guestMoodHistory.add(guestId, filteredHistory);
    logGuestActivity(guestId, #updateMoodEntry, "Mood entry updated");
    "Mood entry successfully updated for guest " # guestId;
  };

  public query func getMoodHistoryGuest(guestId : Text) : async [MoodEntry] {
    validateGuestAccess(guestId);
    switch (guestMoodHistory.get(guestId)) {
      case (null) { [] };
      case (?history) {
        let arr = history.toArray();
        arr.sort();
      };
    };
  };

  public shared func saveDailyAnalysisGuest(guestId : Text, entry : DailyAnalysisEntry) : async Text {
    validateGuestAccess(guestId);
    guestDailyAnalysis.add(guestId, entry);
    "Daily analysis saved successfully for guest " # guestId;
  };

  public query ({ caller }) func getDailyAnalysisGuest(guestId : Text) : async ?DailyAnalysisEntry {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access guest daily analysis");
    };
    validateGuestAccess(guestId);
    guestDailyAnalysis.get(guestId);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  public query func getChatRooms() : async [(Text, { id : Text; name : Text; topic : Text; participantCount : Nat })] {
    let rooms = chatRooms.entries();
    rooms.toArray().map<(Text, ChatRoom), (Text, { id : Text; name : Text; topic : Text; participantCount : Nat })>(
      func((key, room)) {
        (
          key,
          {
            id = room.id;
            name = room.name;
            topic = room.topic;
            participantCount = room.participants.size();
          },
        );
      },
    );
  };

  public shared ({ caller }) func joinChatRoom(roomId : Text, userId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join chat rooms");
    };
    switch (chatRooms.get(roomId)) {
      case (null) { Runtime.trap("Chat room not found") };
      case (?room) {
        if (not room.participants.any(func(p : Text) : Bool { p == userId })) {
          room.participants.add(userId);
        };
      };
    };
  };

  public shared ({ caller }) func sendChatMessage(roomId : Text, message : ChatMessage) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send chat messages");
    };
    switch (chatRooms.get(roomId)) {
      case (null) { Runtime.trap("Chat room not found") };
      case (?room) {
        room.messages.add(message);
      };
    };

    let userId = switch (userProfiles.get(caller)) {
      case (null) { caller.toText() };
      case (?profile) { profile.userId };
    };
    logActivity(userId, #interaction, "Sent chat message in room " # roomId);
  };

  public query func getChatMessages(roomId : Text) : async [ChatMessage] {
    switch (chatRooms.get(roomId)) {
      case (null) { [] };
      case (?room) {
        let arr = room.messages.toArray();
        arr.sort();
      };
    };
  };

  public shared ({ caller }) func createPrivateThread(threadId : Text, participant1 : Principal.Principal, participant2 : Principal.Principal) : async () {
    if (caller != participant1 and caller != participant2) {
      Runtime.trap("Unauthorized: You must be a participant to create this thread");
    };

    let thread : PrivateThread = {
      id = threadId;
      participant1 = participant1;
      participant2 = participant2;
      messages = List.empty<PrivateMessage>();
    };
    privateThreads.add(threadId, thread);
  };

  public shared ({ caller }) func sendPrivateMessage(threadId : Text, message : PrivateMessage) : async () {
    switch (privateThreads.get(threadId)) {
      case (null) { Runtime.trap("Private thread not found") };
      case (?thread) {
        if (caller != thread.participant1 and caller != thread.participant2) {
          Runtime.trap("Unauthorized: You are not a participant in this thread");
        };
        if (caller != message.sender) {
          Runtime.trap("Unauthorized: Sender mismatch");
        };
        thread.messages.add(message);
      };
    };

    let userId = switch (userProfiles.get(caller)) {
      case (null) { caller.toText() };
      case (?profile) { profile.userId };
    };
    logActivity(userId, #interaction, "Sent private message in thread " # threadId);
  };

  public query ({ caller }) func getPrivateMessages(threadId : Text) : async [PrivateMessage] {
    switch (privateThreads.get(threadId)) {
      case (null) { [] };
      case (?thread) {
        if (caller != thread.participant1 and caller != thread.participant2) {
          Runtime.trap("Unauthorized: You are not a participant in this thread");
        };
        let arr = thread.messages.toArray();
        arr.sort();
      };
    };
  };

  public query ({ caller }) func getMyPrivateThreads() : async [Text] {
    let threads = privateThreads.entries();
    let myThreads = threads.toArray().filter(
      func((_, thread)) {
        thread.participant1 == caller or thread.participant2 == caller;
      },
    );
    myThreads.map<(Text, PrivateThread), Text>(func((id, _)) { id });
  };

  public shared ({ caller }) func sendAIMessage(sessionId : Text, message : Text) : async AIResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send AI messages");
    };

    let aiMessage : AIMessage = {
      timestamp = Time.now();
      sender = #user;
      message = message;
    };

    let currentMessages = switch (aiResponses.get(sessionId)) {
      case (null) { List.empty<AIMessage>() };
      case (?messages) { messages };
    };

    currentMessages.add(aiMessage);
    aiResponses.add(sessionId, currentMessages);

    let response = generateAIResponse(message);

    let aiResponseMessage : AIMessage = {
      timestamp = Time.now();
      sender = #ai;
      message = response.response;
    };

    currentMessages.add(aiResponseMessage);
    aiResponses.add(sessionId, currentMessages);

    let userId = switch (userProfiles.get(caller)) {
      case (null) { caller.toText() };
      case (?profile) { profile.userId };
    };
    logActivity(userId, #interaction, "Sent AI message");

    response;
  };

  public query ({ caller }) func getAIConversation(sessionId : Text) : async [AIMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view AI conversations");
    };
    switch (aiResponses.get(sessionId)) {
      case (null) { [] };
      case (?messages) {
        let arr = messages.toArray();
        arr.sort();
      };
    };
  };

  private func generateAIResponse(userMessage : Text) : AIResponse {
    let nonClinicalSuggestions = [
      "Practice slow, deep breaths.",
      "Take a moment for yourself.",
      "Reach out to someone you trust.",
      "Try a calming activity.",
    ];

    let empatheticReflections = [
      "It's normal to feel this way. Your feelings are valid.",
      "Acknowledge your emotions but don't let them control you.",
    ];

    let calmCrisisSupport = "If you're having a hard time, you are not alone. Try some calming techniques and reflect on what helps you." # " Consider talking to someone you trust, if you feel comfortable. Take care of yourself, always.";

    var psychologistAlignedResponse = switch (aiDefaultResponses.get("default")) {
      case (null) { "I'm here for you." };
      case (?r) { r };
    };

    psychologistAlignedResponse := switch (aiDefaultResponses.get("default")) {
      case (null) { "I'm here to support you. What has been most supportive for you so far?" };
      case (?r) { r };
    };

    psychologistAlignedResponse := switch (aiDefaultResponses.get("default")) {
      case (null) { "I'm glad you reached out. Is there something that has helped in the past when you felt like this?" };
      case (?r) { r };
    };

    if (userMessage.contains(#text "happy")) {
      psychologistAlignedResponse := switch (aiDefaultResponses.get("happy")) {
        case (null) { psychologistAlignedResponse };
        case (?r) { r };
      };
    } else if (userMessage.contains(#text "sad")) {
      psychologistAlignedResponse := switch (aiDefaultResponses.get("sad")) {
        case (null) { psychologistAlignedResponse };
        case (?r) { r };
      };
    } else if (userMessage.contains(#text "anxious") or userMessage.contains(#text "anxiety")) {
      psychologistAlignedResponse := switch (aiDefaultResponses.get("anxious")) {
        case (null) { psychologistAlignedResponse };
        case (?r) { r };
      };
    } else if (userMessage.contains(#text "stressed") or userMessage.contains(#text "stress")) {
      psychologistAlignedResponse := switch (aiDefaultResponses.get("stressed")) {
        case (null) { psychologistAlignedResponse };
        case (?r) { r };
      };
    } else if (userMessage.contains(#text "lonely")) {
      psychologistAlignedResponse := switch (aiDefaultResponses.get("lonely")) {
        case (null) { psychologistAlignedResponse };
        case (?r) { r };
      };
    } else if (userMessage.contains(#text "angry")) {
      psychologistAlignedResponse := switch (aiDefaultResponses.get("angry")) {
        case (null) { psychologistAlignedResponse };
        case (?r) { r };
      };
    };

    let empathyIter = empatheticReflections.values();
    let empathyList = List.fromIter(empathyIter);

    let response = {
      response = psychologistAlignedResponse;
      patterns = ["empathetic", "supportive"];
      suggestions = nonClinicalSuggestions;
      reflectiveListening = empathyList.reverse().foldRight(
        "",
        func(acc, curr) {
          acc # "\n " # curr;
        },
      );
      gentleIntakeQuestions = [
        "What makes you feel most supported?",
        "What do you need right now?",
        "Who can you talk to for support?",
        "What self-care might help in this moment?",
      ];
      guidance = calmCrisisSupport;
    };

    response;
  };

  public query ({ caller }) func getAggregatedAnalytics() : async AnalyticsData {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access analytics");
    };

    switch (analyticsData.get("global")) {
      case (null) {
        {
          totalSessions = 0;
          totalSessionDuration = 0;
          averageSessionDuration = 0;
        };
      };
      case (?data) { data };
    };
  };

  public query ({ caller }) func getAllUserData() : async [UserData] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access user data");
    };

    let profiles = userProfiles.entries();
    profiles.toArray().map<(Principal.Principal, UserProfile), UserData>(
      func((principal, profile)) {
        let moodCount = switch (userMoodHistory.get(principal)) {
          case (null) { 0 };
          case (?history) { history.size() };
        };

        let lastActivity = switch (userMoodHistory.get(principal)) {
          case (null) { null };
          case (?history) {
            let arr = history.toArray();
            if (arr.size() > 0) {
              let sorted = arr.sort();
              ?sorted[sorted.size() - 1].timestamp;
            } else {
              null;
            };
          };
        };

        {
          principal = principal;
          userId = profile.userId;
          profession = profile.profession;
          moodEntryCount = moodCount;
          lastActivity = lastActivity;
        };
      },
    );
  };

  public query ({ caller }) func getAllMoodLogs() : async [MoodLogEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access mood logs");
    };

    let allMoods = userMoodHistory.entries();
    let moodLogs = List.empty<MoodLogEntry>();

    var logs = moodLogs;
    for ((principal, history) in allMoods) {
      let profile = userProfiles.get(principal);
      let userId = switch (profile) {
        case (null) { principal.toText() };
        case (?p) { p.userId };
      };

      for (entry in history.values()) {
        let logEntry : MoodLogEntry = {
          principal = principal;
          userId = userId;
          timestamp = entry.timestamp;
          mood = entry.mood;
          note = entry.note;
        };
        logs.add(logEntry);
      };
    };

    logs.toArray();
  };

  public query ({ caller }) func getWeeklyMoodInsights() : async [WeeklyMoodAnalysis] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access weekly insights");
    };

    let allAnalyses = userWeeklyAnalysis.entries();
    let combined = List.empty<WeeklyMoodAnalysis>();

    var result = combined;
    for ((_, analyses) in allAnalyses) {
      for (analysis in analyses.values()) {
        result.add(analysis);
      };
    };

    result.toArray();
  };

  public shared ({ caller }) func setAppMarketMetadata(metadata : AppMarketMetadata) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set app market metadata");
    };
    appMarketMetadata := ?metadata;
  };

  public query func getAppMarketMetadata() : async ?AppMarketMetadata {
    appMarketMetadata;
  };

  public shared ({ caller }) func setPricingConfig(config : PricingConfig) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set pricing config");
    };
    pricingConfig := ?config;
  };

  public query func getPricingConfig() : async ?PricingConfig {
    pricingConfig;
  };

  public query ({ caller }) func getMarketAnalytics() : async MarketAnalytics {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access market analytics");
    };
    marketAnalytics;
  };

  public shared ({ caller }) func recordCloneRequest(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record clone requests");
    };

    let request : CloneRequest = {
      timestamp = Time.now();
      buyer = caller;
      amount = amount;
    };

    marketAnalytics := {
      totalViews = marketAnalytics.totalViews;
      totalClones = marketAnalytics.totalClones + 1;
      totalSubscriptions = marketAnalytics.totalSubscriptions;
      totalRevenue = marketAnalytics.totalRevenue + amount;
    };
  };

  public shared ({ caller }) func incrementAppViews() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can increment app views");
    };

    marketAnalytics := {
      totalViews = marketAnalytics.totalViews + 1;
      totalClones = marketAnalytics.totalClones;
      totalSubscriptions = marketAnalytics.totalSubscriptions;
      totalRevenue = marketAnalytics.totalRevenue;
    };
  };

  public shared ({ caller }) func uploadPDF(filename : Text, content : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can upload PDFs");
    };

    pdfFiles.add(filename, content);
  };

  public query func getPDF(filename : Text) : async ?Storage.ExternalBlob {
    pdfFiles.get(filename);
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
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
