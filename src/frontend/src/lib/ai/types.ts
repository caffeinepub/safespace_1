export type ConversationStage = 
  | 'intake'
  | 'reflective'
  | 'regulation'
  | 'psychoeducation'
  | 'goals'
  | 'coping'
  | 'progress'
  | 'crisis'
  | 'referral';

export interface SessionContext {
  stage: ConversationStage;
  themes: string[];
  exchangeCount: number;
  lastUpdated: number;
}
