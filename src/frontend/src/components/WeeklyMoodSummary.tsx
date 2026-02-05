import { useMemo } from 'react';
import { MoodEntry } from '../backend';
import { timestampToLocalDate } from '../lib/timestampUtils';
import { isInCurrentWeek } from '../lib/weekUtils';
import { getWeeklyAverageLabel, getWeeklyInsight, getEmptyStateMessage } from '../lib/weeklySummaryText';

interface WeeklyMoodSummaryProps {
  moodHistory: MoodEntry[];
}

const moodScores: Record<string, number> = {
  happy: 9,
  grateful: 9,
  relaxed: 8,
  content: 8,
  hopeful: 7,
  inspired: 8,
  calm: 7,
  anxious: 4,
  stressed: 3,
  overwhelmed: 2,
  sad: 3,
  lonely: 3,
  angry: 2,
};

export default function WeeklyMoodSummary({ moodHistory }: WeeklyMoodSummaryProps) {
  const { average, label, insight, hasEntries } = useMemo(() => {
    const weekEntries = moodHistory.filter(entry => {
      const entryDate = timestampToLocalDate(entry.timestamp);
      return isInCurrentWeek(entryDate);
    });

    if (weekEntries.length === 0) {
      return {
        average: 0,
        label: '',
        insight: getEmptyStateMessage(),
        hasEntries: false,
      };
    }

    const totalScore = weekEntries.reduce((sum, entry) => {
      return sum + (moodScores[entry.mood] || 5);
    }, 0);

    const avg = totalScore / weekEntries.length;

    return {
      average: avg,
      label: getWeeklyAverageLabel(avg),
      insight: getWeeklyInsight(avg, weekEntries.length),
      hasEntries: true,
    };
  }, [moodHistory]);

  return (
    <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-lavender-50 to-blush-50 dark:from-lavender-900/20 dark:to-blush-900/20 border border-lavender-200 dark:border-lavender-700">
      {hasEntries ? (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {average.toFixed(1)} / 10
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{insight}</p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">{insight}</p>
      )}
    </div>
  );
}
