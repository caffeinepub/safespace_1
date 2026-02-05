// Template Utilities - Selection and adaptation

import { TemplateSet } from './templates';
import { SessionContext } from './types';

export function selectTemplate(
  templates: TemplateSet,
  context: SessionContext
): { response: string; followUp?: string } {
  // Select response variant (rotate to avoid repetition)
  const responseIndex = context.messageCount % templates.responses.length;
  const response = templates.responses[responseIndex];

  // Optionally add a follow-up question (not always)
  let followUp: string | undefined;
  if (templates.followUpQuestions && Math.random() > 0.3) {
    const questionIndex = Math.floor(Math.random() * templates.followUpQuestions.length);
    followUp = templates.followUpQuestions[questionIndex];
  }

  return { response, followUp };
}

export function adaptTemplate(
  template: string,
  userMessage: string,
  context: SessionContext
): string {
  // Mirror user's own words when appropriate
  const userWords = extractKeyPhrases(userMessage);
  let adapted = template;

  // Reference earlier themes if present
  if (context.recentThemes.length > 0 && Math.random() > 0.6) {
    const theme = context.recentThemes[context.recentThemes.length - 1];
    adapted = `${adapted} I remember you mentioned feeling ${theme} earlier.`;
  }

  return adapted;
}

function extractKeyPhrases(message: string): string[] {
  // Simple extraction of meaningful phrases (could be enhanced)
  const words = message.toLowerCase().split(' ');
  return words.filter(word => word.length > 4);
}

export function combineResponseAndFollowUp(response: string, followUp?: string): string {
  if (!followUp) return response;
  return `${response}\n\n${followUp}`;
}
