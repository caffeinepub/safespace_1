import { useMemo } from 'react';
import { MoodEntry } from '../backend';
import { timestampToLocalDate } from '../lib/timestampUtils';
import { startOfMonth, format, isSameMonth } from 'date-fns';

interface OverallMoodTrendChartProps {
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

export default function OverallMoodTrendChart({ moodHistory }: OverallMoodTrendChartProps) {
  const overallData = useMemo(() => {
    if (moodHistory.length === 0) return [];

    const monthlyBuckets = new Map<string, number[]>();

    moodHistory.forEach(entry => {
      const entryDate = timestampToLocalDate(entry.timestamp);
      const monthKey = format(startOfMonth(entryDate), 'yyyy-MM');
      const score = moodScores[entry.mood] || 5;

      if (!monthlyBuckets.has(monthKey)) {
        monthlyBuckets.set(monthKey, []);
      }
      monthlyBuckets.get(monthKey)!.push(score);
    });

    const sortedMonths = Array.from(monthlyBuckets.keys()).sort();
    
    return sortedMonths.map(monthKey => {
      const scores = monthlyBuckets.get(monthKey)!;
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        monthLabel: format(new Date(monthKey + '-01'), 'MMM yyyy'),
        avgScore,
      };
    });
  }, [moodHistory]);

  if (overallData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No mood data available yet. Start tracking to see your overall trends!
        </p>
      </div>
    );
  }

  const maxScore = 10;

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Overall Mood Trends</h3>
        <p className="text-sm text-muted-foreground">Monthly averages across all your history</p>
      </div>
      <div className="flex items-end justify-start gap-2 h-64 px-4 overflow-x-auto">
        {overallData.map((month, idx) => {
          const heightPercent = (month.avgScore / maxScore) * 100;
          const barColor =
            month.avgScore >= 7
              ? 'from-green-400 to-teal-400'
              : month.avgScore >= 5
              ? 'from-yellow-400 to-orange-400'
              : 'from-red-400 to-pink-400';

          return (
            <div key={idx} className="flex flex-col items-center gap-2 min-w-[60px]">
              <div className="relative w-full group">
                <div
                  className={`w-full rounded-t-lg bg-gradient-to-t ${barColor} transition-all duration-500 hover:scale-105 cursor-pointer shadow-lg`}
                  style={{ height: `${Math.max(heightPercent, 5)}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                    {month.avgScore.toFixed(1)} / 10
                  </div>
                </div>
              </div>
              <div className="text-xs font-medium text-muted-foreground text-center">{month.monthLabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
