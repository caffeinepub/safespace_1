/**
 * Week utilities for local-time Mon-Sun week calculations
 */

/**
 * Get the start of the current week (Monday at 00:00:00 local time)
 */
export function getCurrentWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust when day is Sunday (0)
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get the end of the current week (Sunday at 23:59:59 local time)
 */
export function getCurrentWeekEnd(): Date {
  const weekStart = getCurrentWeekStart();
  const sunday = new Date(weekStart);
  sunday.setDate(weekStart.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Generate an array of 7 dates representing Mon-Sun of the current week
 */
export function getCurrentWeekDays(): Date[] {
  const weekStart = getCurrentWeekStart();
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });
}

/**
 * Get the day of week index (0 = Monday, 6 = Sunday)
 */
export function getDayOfWeekIndex(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, Mon-Sat to 0-5
}

/**
 * Check if a date falls within the current week (Mon-Sun)
 */
export function isInCurrentWeek(date: Date): boolean {
  const weekStart = getCurrentWeekStart();
  const weekEnd = getCurrentWeekEnd();
  return date >= weekStart && date <= weekEnd;
}

/**
 * Format day name (Mon, Tue, etc.)
 */
export function formatDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}
