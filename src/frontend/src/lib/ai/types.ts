// AI Chatbox Types - Psychologist-aligned conversation system

export enum ConversationStage {
  INTAKE_ASSESSMENT = 'intake_assessment',
  REFLECTIVE_LISTENING = 'reflective_listening',
  EMOTIONAL_REGULATION = 'emotional_regulation',
  PSYCHOEDUCATION = 'psychoeducation',
  GOAL_CLARIFICATION = 'goal_clarification',
  COPING_DEVELOPMENT = 'coping_development',
  PROGRESS_REFLECTION = 'progress_reflection',
  CRISIS_GROUNDING = 'crisis_grounding',
  REFERRAL_GUIDANCE = 'referral_guidance',
}

export interface SessionContext {
  messageCount: number;
  recentThemes: string[];
  userRequestedTechniques: boolean;
  userSharedGoal: boolean;
  riskDetected: boolean;
  lastStage?: ConversationStage;
}

export interface ResponseConstraints {
  noDiagnosis: boolean;
  noTherapyClaims: boolean;
  reflectiveFirst: boolean;
  permissionBeforeTechniques: boolean;
  implicitBoundaries: boolean;
  crisisSafeMode: boolean;
}

export interface StageResponse {
  message: string;
  stage: ConversationStage;
  followUpQuestion?: string;
}
