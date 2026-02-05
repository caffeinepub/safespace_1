// AI Generator - Main response generation logic

import { ConversationStage, SessionContext, StageResponse } from './types';
import { selectStage, updateSessionContext } from './routing';
import { DEFAULT_CONSTRAINTS, CRISIS_CONSTRAINTS, validateResponse } from './constraints';
import { STAGE_TEMPLATES, CRISIS_SAFETY_MESSAGES } from './templates';
import { selectTemplate, adaptTemplate, combineResponseAndFollowUp } from './templateUtils';

export function generateResponse(
  userMessage: string,
  context: SessionContext
): { response: StageResponse; updatedContext: SessionContext } {
  // Select appropriate stage
  const stage = selectStage(userMessage, context);

  // Get constraints for this stage
  const constraints = stage === ConversationStage.CRISIS_GROUNDING
    ? CRISIS_CONSTRAINTS
    : DEFAULT_CONSTRAINTS;

  // Get templates for this stage
  const templates = STAGE_TEMPLATES[stage];

  // Select and adapt template
  const { response: baseResponse, followUp } = selectTemplate(templates, context);
  const adaptedResponse = adaptTemplate(baseResponse, userMessage, context);

  // Combine response with optional follow-up
  let finalMessage = combineResponseAndFollowUp(adaptedResponse, followUp);

  // Add crisis safety message if in crisis mode
  if (stage === ConversationStage.CRISIS_GROUNDING) {
    const safetyMessage = CRISIS_SAFETY_MESSAGES[0]; // Use first safety message
    finalMessage = `${finalMessage}\n\n${safetyMessage}`;
  }

  // Validate response
  if (!validateResponse(finalMessage, constraints)) {
    // Fallback to safe default
    finalMessage = "I'm here to listen and support you. Your feelings are valid.";
  }

  // Update context
  const updatedContext = updateSessionContext(context, userMessage, stage);

  return {
    response: {
      message: finalMessage,
      stage,
      followUpQuestion: followUp,
    },
    updatedContext,
  };
}
