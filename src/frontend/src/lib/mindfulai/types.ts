export interface EmotionData {
  emotion: string;
  confidence: number;
}

export interface MindfulAIState {
  currentEmotion: EmotionData | null;
  engagementScore: number;
  lastNudgeTime: number;
}
