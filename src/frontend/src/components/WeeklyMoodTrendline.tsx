import { useMemo } from 'react';
import { MoodEntry } from '../backend';
import { timestampToLocalDate } from '../lib/timestampUtils';
import { getCurrentWeekDays, formatDayName } from '../lib/weekUtils';
import { isSameDay } from 'date-fns';

interface WeeklyMoodTrendlineProps {
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

export default function WeeklyMoodTrendline({ moodHistory }: WeeklyMoodTrendlineProps) {
  const weekData = useMemo(() => {
    const weekDays = getCurrentWeekDays();
    
    return weekDays.map((day, index) => {
      const dayEntries = moodHistory.filter(entry => {
        const entryDate = timestampToLocalDate(entry.timestamp);
        return isSameDay(entryDate, day);
      });

      let avgScore: number | null = null;
      if (dayEntries.length > 0) {
        const totalScore = dayEntries.reduce((sum, entry) => {
          return sum + (moodScores[entry.mood] || 5);
        }, 0);
        avgScore = totalScore / dayEntries.length;
      }

      return {
        dayName: formatDayName(day),
        dayIndex: index,
        avgScore,
        hasData: dayEntries.length > 0,
      };
    });
  }, [moodHistory]);

  const maxScore = 10;
  const validScores = weekData.filter(d => d.avgScore !== null).map(d => d.avgScore!);

  return (
    <div className="w-full">
      <div className="relative flex items-end justify-between gap-2 h-64 px-4">
        {/* Trend line */}
        {validScores.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <polyline
              points={weekData
                .map((day, idx) => {
                  if (day.avgScore === null) return null;
                  const x = ((idx + 0.5) / weekData.length) * 100;
                  const y = 100 - (day.avgScore / maxScore) * 100;
                  return `${x}%,${y}%`;
                })
                .filter(Boolean)
                .join(' ')}
              fill="none"
              stroke="oklch(0.65 0.15 280)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
          </svg>
        )}

        {/* Bars */}
        {weekData.map((day) => {
          const heightPercent = day.avgScore !== null ? (day.avgScore / maxScore) * 100 : 0;
          const barColor =
            day.avgScore !== null
              ? day.avgScore >= 7
                ? 'from-green-400 to-teal-400'
                : day.avgScore >= 5
                ? 'from-yellow-400 to-orange-400'
                : 'from-red-400 to-pink-400'
              : 'from-gray-300 to-gray-400';

          return (
            <div key={day.dayIndex} className="flex-1 flex flex-col items-center gap-2" style={{ zIndex: 2 }}>
              <div className="relative w-full group">
                {day.hasData ? (
                  <div
                    className={`w-full rounded-t-lg bg-gradient-to-t ${barColor} transition-all duration-500 hover:scale-105 cursor-pointer shadow-lg`}
                    style={{ height: `${Math.max(heightPercent, 5)}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                      {day.avgScore?.toFixed(1)} / 10
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 opacity-40"
                      title="No entry"
                    />
                  </div>
                )}
              </div>
              <div className="text-xs font-medium text-muted-foreground">{day.dayName}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
