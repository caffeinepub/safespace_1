/**
 * Utility for managing SafeSpace browser storage.
 * Provides functions to clear app-specific localStorage and sessionStorage keys.
 */

const SAFESPACE_STORAGE_KEYS = [
  'guestSession',
  'guestAuthStore',
  'aiSessionContext',
  'mindfulAIUX',
];

/**
 * Clears all SafeSpace-specific browser storage (localStorage and sessionStorage).
 * Does not affect other apps' storage or browser-level data.
 */
export function resetAppBrowserStorage(): void {
  try {
    // Clear known SafeSpace keys from localStorage
    SAFESPACE_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clear all sessionStorage (session-scoped anyway)
    sessionStorage.clear();

    console.log('SafeSpace browser storage cleared');
  } catch (error) {
    console.error('Error clearing browser storage:', error);
  }
}
