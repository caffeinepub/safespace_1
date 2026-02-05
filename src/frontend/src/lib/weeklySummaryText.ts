/**
 * Weekly summary text generation with gentle, non-judgmental language
 */

/**
 * Get the label band for a weekly average mood score
 */
export function getWeeklyAverageLabel(average: number): string {
  if (average >= 8.0) {
    return 'Very positive week';
  } else if (average >= 6.0) {
    return 'Mostly positive';
  } else if (average === 5.0) {
    return 'Average / balanced';
  } else if (average >= 4.0) {
    return 'Below average';
  } else {
    return 'Low mood week';
  }
}

/**
 * Generate a short, non-judgmental insight sentence
 */
export function getWeeklyInsight(average: number, entryCount: number): string {
  if (entryCount === 0) {
    return 'No entries this week yet.';
  }

  if (average >= 8.0) {
    return 'Your week shows consistent positivity.';
  } else if (average >= 6.0) {
    return 'Your mood has been mostly positive this week.';
  } else if (average >= 5.0) {
    return 'Your mood has been balanced this week.';
  } else if (average >= 4.0) {
    return 'Your week shows some lower moments.';
  } else {
    return 'This week has been challenging.';
  }
}

/**
 * Get empty state message
 */
export function getEmptyStateMessage(): string {
  return 'Start tracking your mood to see your weekly patterns.';
}
