import { useMemo } from 'react';
import { MoodEntry } from '../backend';
import { timestampToLocalDate } from '../lib/timestampUtils';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';

interface MonthlyMoodTrendChartProps {
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

export default function MonthlyMoodTrendChart({ moodHistory }: MonthlyMoodTrendChartProps) {
  const monthData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const weeklyBuckets: { weekLabel: string; scores: number[] }[] = [];
    let currentWeek: number[] = [];
    let weekStartDay = 1;

    daysInMonth.forEach((day, idx) => {
      const dayEntries = moodHistory.filter(entry => {
        const entryDate = timestampToLocalDate(entry.timestamp);
        return isSameDay(entryDate, day);
      });

      if (dayEntries.length > 0) {
        const avgScore = dayEntries.reduce((sum, e) => sum + (moodScores[e.mood] || 5), 0) / dayEntries.length;
        currentWeek.push(avgScore);
      }

      if ((idx + 1) % 7 === 0 || idx === daysInMonth.length - 1) {
        if (currentWeek.length > 0) {
          weeklyBuckets.push({
            weekLabel: `Week ${weeklyBuckets.length + 1}`,
            scores: [...currentWeek],
          });
        }
        currentWeek = [];
        weekStartDay = idx + 2;
      }
    });

    return weeklyBuckets.map(bucket => ({
      weekLabel: bucket.weekLabel,
      avgScore: bucket.scores.reduce((a, b) => a + b, 0) / bucket.scores.length,
    }));
  }, [moodHistory]);

  if (monthData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No mood data available for this month. Start tracking to see your monthly trends!
        </p>
      </div>
    );
  }

  const maxScore = 10;

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">{format(new Date(), 'MMMM yyyy')}</h3>
        <p className="text-sm text-muted-foreground">Weekly averages across the month</p>
      </div>
      <div className="flex items-end justify-between gap-3 h-64 px-4">
        {monthData.map((week, idx) => {
          const heightPercent = (week.avgScore / maxScore) * 100;
          const barColor =
            week.avgScore >= 7
              ? 'from-green-400 to-teal-400'
              : week.avgScore >= 5
              ? 'from-yellow-400 to-orange-400'
              : 'from-red-400 to-pink-400';

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full group">
                <div
                  className={`w-full rounded-t-lg bg-gradient-to-t ${barColor} transition-all duration-500 hover:scale-105 cursor-pointer shadow-lg`}
                  style={{ height: `${Math.max(heightPercent, 5)}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                    {week.avgScore.toFixed(1)} / 10
                  </div>
                </div>
              </div>
              <div className="text-xs font-medium text-muted-foreground">{week.weekLabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
