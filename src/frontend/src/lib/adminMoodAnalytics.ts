import { UserRecord, Mood } from '../types/backend-extended';
import { convertNanosToDate } from './timestampUtils';

export function getMoodEmoji(mood: Mood): string {
  const emojiMap: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    calm: '😌',
    angry: '😠',
    grateful: '🙏',
    stressed: '😫',
    lonely: '😔',
    hopeful: '🌟',
    content: '😊',
    overwhelmed: '😵',
    inspired: '✨',
    relaxed: '😎',
  };
  return emojiMap[mood] || '😐';
}

export function getMoodColor(mood: Mood): string {
  const colorMap: Record<string, string> = {
    happy: '#10b981',
    sad: '#3b82f6',
    anxious: '#f59e0b',
    calm: '#06b6d4',
    angry: '#ef4444',
    grateful: '#8b5cf6',
    stressed: '#f97316',
    lonely: '#6366f1',
    hopeful: '#14b8a6',
    content: '#84cc16',
    overwhelmed: '#ec4899',
    inspired: '#a855f7',
    relaxed: '#22c55e',
  };
  return colorMap[mood] || '#6b7280';
}

export function computeDailyMoodCounts(users: UserRecord[], days: number) {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  
  const dailyCounts: Record<string, Record<string, number>> = {};
  
  users.forEach(user => {
    user.moodEntries.forEach(entry => {
      const date = convertNanosToDate(entry.timestamp);
      if (date.getTime() >= cutoff) {
        const dateKey = date.toISOString().split('T')[0];
        if (!dailyCounts[dateKey]) {
          dailyCounts[dateKey] = {};
        }
        const moodKey = entry.mood;
        dailyCounts[dateKey][moodKey] = (dailyCounts[dateKey][moodKey] || 0) + 1;
      }
    });
  });
  
  return dailyCounts;
}

export function computeWeeklyAverages(users: UserRecord[]) {
  const now = Date.now();
  const weekStart = now - 7 * 24 * 60 * 60 * 1000;
  
  let totalScore = 0;
  let count = 0;
  let uniqueUsers = new Set<string>();
  
  users.forEach(user => {
    let userHasEntry = false;
    user.moodEntries.forEach(entry => {
      const date = convertNanosToDate(entry.timestamp);
      if (date.getTime() >= weekStart) {
        totalScore += Number(entry.moodScore);
        count++;
        userHasEntry = true;
      }
    });
    if (userHasEntry) {
      uniqueUsers.add(user.id);
    }
  });
  
  return {
    averageScore: count > 0 ? totalScore / count : 0,
    entryCount: count,
    userCount: uniqueUsers.size,
  };
}
