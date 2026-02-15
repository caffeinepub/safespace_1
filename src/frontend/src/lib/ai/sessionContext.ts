import { SessionContext } from './types';

const SESSION_STORAGE_KEY = 'safespace_ai_session_context';

export function initSessionContext(): SessionContext {
  return {
    stage: 'intake',
    themes: [],
    exchangeCount: 0,
    lastUpdated: Date.now(),
  };
}

export function loadSessionContext(): SessionContext | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load session context:', error);
  }
  return null;
}

export function saveSessionContext(context: SessionContext) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(context));
  } catch (error) {
    console.error('Failed to save session context:', error);
  }
}

export function clearSessionContext() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session context:', error);
  }
}
