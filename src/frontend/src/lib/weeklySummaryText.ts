export function getMoodLabel(averageScore: number): string {
  if (averageScore < 3) return 'Low';
  if (averageScore < 4) return 'Below average';
  if (averageScore < 6) return 'Average/balanced';
  if (averageScore < 8) return 'Mostly positive';
  return 'Very positive';
}

export function getWeeklyInsight(averageScore: number): string {
  if (averageScore < 3) {
    return 'This week has been challenging. Remember to be kind to yourself.';
  }
  if (averageScore < 4) {
    return 'Some ups and downs this week. Small steps forward count.';
  }
  if (averageScore < 6) {
    return 'A balanced week overall. Keep taking care of yourself.';
  }
  if (averageScore < 8) {
    return 'A good week with positive moments. Keep it up!';
  }
  return 'An excellent week! Celebrate your positive energy.';
}
