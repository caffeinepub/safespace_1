// AI Routing - Stage selection based on user message and session context

import { ConversationStage, SessionContext } from './types';

// Crisis keywords that trigger immediate crisis-safe mode
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'want to die', 'self-harm',
  'hurt myself', 'no reason to live', 'better off dead', 'end my life'
];

// Keywords that suggest user wants techniques/exercises
const TECHNIQUE_REQUEST_KEYWORDS = [
  'help me', 'what can i do', 'how do i', 'technique', 'exercise',
  'coping', 'strategy', 'advice', 'suggestion', 'tip'
];

// Keywords that suggest goal-oriented conversation
const GOAL_KEYWORDS = [
  'want to', 'need to', 'goal', 'change', 'improve', 'work on',
  'get better', 'overcome', 'achieve'
];

// Keywords that suggest user is reflecting on progress
const PROGRESS_KEYWORDS = [
  'feeling better', 'improved', 'progress', 'getting better',
  'helped', 'working', 'notice', 'different'
];

export function selectStage(
  userMessage: string,
  context: SessionContext
): ConversationStage {
  const lowerMessage = userMessage.toLowerCase();

  // Priority 1: Crisis detection
  if (detectCrisisRisk(lowerMessage)) {
    return ConversationStage.CRISIS_GROUNDING;
  }

  // Priority 2: Progress reflection (if conversation is established)
  if (context.messageCount > 6 && containsKeywords(lowerMessage, PROGRESS_KEYWORDS)) {
    return ConversationStage.PROGRESS_REFLECTION;
  }

  // Priority 3: Explicit technique requests (only if appropriate)
  if (containsKeywords(lowerMessage, TECHNIQUE_REQUEST_KEYWORDS)) {
    // If user hasn't been heard yet, redirect to reflective listening first
    if (context.messageCount < 3) {
      return ConversationStage.REFLECTIVE_LISTENING;
    }
    return ConversationStage.EMOTIONAL_REGULATION;
  }

  // Priority 4: Goal clarification
  if (containsKeywords(lowerMessage, GOAL_KEYWORDS) && !context.userSharedGoal) {
    return ConversationStage.GOAL_CLARIFICATION;
  }

  // Priority 5: Coping development (if goal established and techniques requested)
  if (context.userSharedGoal && context.userRequestedTechniques) {
    return ConversationStage.COPING_DEVELOPMENT;
  }

  // Priority 6: Psychoeducation (if user seems confused about emotions)
  if (lowerMessage.includes('why') || lowerMessage.includes('understand')) {
    return ConversationStage.PSYCHOEDUCATION;
  }

  // Default flow based on conversation stage
  if (context.messageCount === 0) {
    return ConversationStage.INTAKE_ASSESSMENT;
  }

  if (context.messageCount < 4) {
    return ConversationStage.REFLECTIVE_LISTENING;
  }

  // Continue with reflective listening as default
  return ConversationStage.REFLECTIVE_LISTENING;
}

export function detectCrisisRisk(message: string): boolean {
  return CRISIS_KEYWORDS.some(keyword => message.includes(keyword));
}

function containsKeywords(message: string, keywords: string[]): boolean {
  return keywords.some(keyword => message.includes(keyword));
}

export function updateSessionContext(
  context: SessionContext,
  userMessage: string,
  stage: ConversationStage
): SessionContext {
  const lowerMessage = userMessage.toLowerCase();
  
  return {
    ...context,
    messageCount: context.messageCount + 1,
    recentThemes: extractThemes(lowerMessage, context.recentThemes),
    userRequestedTechniques: context.userRequestedTechniques || 
      containsKeywords(lowerMessage, TECHNIQUE_REQUEST_KEYWORDS),
    userSharedGoal: context.userSharedGoal || 
      containsKeywords(lowerMessage, GOAL_KEYWORDS),
    riskDetected: context.riskDetected || detectCrisisRisk(lowerMessage),
    lastStage: stage,
  };
}

function extractThemes(message: string, existingThemes: string[]): string[] {
  const emotionKeywords = [
    'anxious', 'sad', 'happy', 'stressed', 'lonely', 'overwhelmed',
    'angry', 'calm', 'hopeful', 'grateful', 'worried', 'scared'
  ];
  
  const newThemes = emotionKeywords.filter(keyword => message.includes(keyword));
  const combined = [...existingThemes, ...newThemes];
  
  // Keep only last 5 themes
  return combined.slice(-5);
}
