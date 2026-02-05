/**
 * Mood error classification and user-friendly messaging utility.
 * Categorizes mood-related failures into permission, availability, and unexpected errors.
 */

export enum MoodErrorType {
  Permission = 'permission',
  Availability = 'availability',
  Unexpected = 'unexpected',
}

export interface MoodError {
  type: MoodErrorType;
  userMessage: string;
  debugMessage: string;
  originalError?: unknown;
}

/**
 * Classifies mood-related errors and provides user-friendly English messages.
 * Preserves original error for debugging without swallowing backend traps.
 */
export function classifyMoodError(error: unknown): MoodError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Permission/Unauthorized errors
  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('permission') ||
    lowerMessage.includes('not allowed')
  ) {
    return {
      type: MoodErrorType.Permission,
      userMessage: 'You do not have permission to perform this action. Please log in and try again.',
      debugMessage: `Permission error: ${errorMessage}`,
      originalError: error,
    };
  }

  // Availability/initialization errors - extended to recognize transient connectivity issues
  if (
    lowerMessage.includes('not available') ||
    lowerMessage.includes('not initialized') ||
    lowerMessage.includes('actor not available') ||
    lowerMessage.includes('mood tracking not available') ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('replica') ||
    lowerMessage.includes('canister') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('unavailable')
  ) {
    return {
      type: MoodErrorType.Availability,
      userMessage: 'Mood tracking is temporarily unavailable. Please wait a moment and try again.',
      debugMessage: `Availability error: ${errorMessage}`,
      originalError: error,
    };
  }

  // Unexpected errors (preserve for debugging)
  return {
    type: MoodErrorType.Unexpected,
    userMessage: 'An unexpected error occurred. Please try again in a moment.',
    debugMessage: `Unexpected error: ${errorMessage}`,
    originalError: error,
  };
}

/**
 * Logs mood error to console for debugging while preserving stack trace.
 */
export function logMoodError(moodError: MoodError, context: string): void {
  console.error(`[${context}] ${moodError.debugMessage}`);
  if (moodError.originalError) {
    console.error('Original error:', moodError.originalError);
  }
}
