import { MindfulAIState } from './types';

const SESSION_STORAGE_KEY = 'safespace_mindfulai_state';

export function initMindfulAIState(): MindfulAIState {
  return {
    currentEmotion: null,
    engagementScore: 0,
    lastNudgeTime: 0,
  };
}

export function loadMindfulAIState(): MindfulAIState | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load MindfulAI state:', error);
  }
  return null;
}

export function saveMindfulAIState(state: MindfulAIState) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save MindfulAI state:', error);
  }
}

export function clearMindfulAIState() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear MindfulAI state:', error);
  }
}
