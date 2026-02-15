import { ConversationStage, SessionContext } from './types';

export function selectStage(userMessage: string, context: SessionContext): ConversationStage {
  const lowerMessage = userMessage.toLowerCase();
  
  // Crisis detection
  if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || lowerMessage.includes('end it all')) {
    return 'crisis';
  }
  
  // Stage progression based on exchange count and content
  if (context.exchangeCount < 3) {
    return 'intake';
  }
  
  if (lowerMessage.includes('why') || lowerMessage.includes('understand') || lowerMessage.includes('learn')) {
    return 'psychoeducation';
  }
  
  if (lowerMessage.includes('goal') || lowerMessage.includes('want to') || lowerMessage.includes('hope to')) {
    return 'goals';
  }
  
  if (lowerMessage.includes('cope') || lowerMessage.includes('deal with') || lowerMessage.includes('manage')) {
    return 'coping';
  }
  
  // Default to reflective listening
  return 'reflective';
}
