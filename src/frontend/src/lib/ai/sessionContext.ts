// Session Context Manager - Session-only context storage

import { SessionContext } from './types';

const SESSION_STORAGE_KEY = 'ai-chat-session-context';

export function initializeSessionContext(): SessionContext {
  // Try to load from sessionStorage (not localStorage)
  const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to default
    }
  }

  return {
    messageCount: 0,
    recentThemes: [],
    userRequestedTechniques: false,
    userSharedGoal: false,
    riskDetected: false,
  };
}

export function saveSessionContext(context: SessionContext): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(context));
}

export function clearSessionContext(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getSessionSummary(context: SessionContext): string {
  const themes = context.recentThemes.join(', ');
  return `Session: ${context.messageCount} messages. Recent themes: ${themes || 'none yet'}.`;
}
