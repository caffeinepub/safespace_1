import { useMemo } from 'react';
import { MoodEntry } from '../backend';
import { timestampToLocalDate } from '../lib/timestampUtils';
import { getCurrentWeekDays, formatDayName } from '../lib/weekUtils';
import { isSameDay } from 'date-fns';
import { linearRegression } from '../lib/linearRegression';

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

const moodEmojis: Record<string, string> = {
  happy: '😊',
  grateful: '🙏',
  relaxed: '😌',
  content: '😊',
  hopeful: '🌟',
  inspired: '✨',
  calm: '😌',
  anxious: '😰',
  stressed: '😓',
  overwhelmed: '😵',
  sad: '😢',
  lonely: '😔',
  angry: '😠',
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
      let representativeMood: string | null = null;
      
      if (dayEntries.length > 0) {
        const totalScore = dayEntries.reduce((sum, entry) => {
          return sum + (moodScores[entry.mood] || 5);
        }, 0);
        avgScore = totalScore / dayEntries.length;
        
        // Use the most recent entry's mood as representative
        const sortedEntries = [...dayEntries].sort((a, b) => 
          Number(b.timestamp - a.timestamp)
        );
        representativeMood = sortedEntries[0].mood;
      }

      return {
        dayName: formatDayName(day),
        dayIndex: index,
        avgScore,
        representativeMood,
        hasData: dayEntries.length > 0,
      };
    });
  }, [moodHistory]);

  const maxScore = 10;
  const chartWidth = 100; // percentage
  const chartHeight = 100; // percentage
  
  // Compute linear regression trendline
  const trendlineData = useMemo(() => {
    const validPoints = weekData
      .filter(d => d.avgScore !== null)
      .map(d => ({ x: d.dayIndex, y: d.avgScore! }));

    if (validPoints.length < 2) {
      return null;
    }

    const regression = linearRegression(validPoints);
    if (!regression) {
      return null;
    }

    // Generate trendline endpoints using numeric coordinates
    const startX = 0;
    const endX = 6;
    const startY = regression.predict(startX);
    const endY = regression.predict(endX);

    // Convert to SVG coordinates (0-100 range)
    const x1 = ((startX + 0.5) / 7) * chartWidth;
    const y1 = chartHeight - (startY / maxScore) * chartHeight;
    const x2 = ((endX + 0.5) / 7) * chartWidth;
    const y2 = chartHeight - (endY / maxScore) * chartHeight;

    return { x1, y1, x2, y2 };
  }, [weekData]);

  return (
    <div className="w-full">
      <div className="relative flex items-end justify-between gap-2 h-64 px-4">
        {/* Linear regression trendline */}
        {trendlineData && (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
            style={{ zIndex: 1 }}
          >
            <line
              x1={trendlineData.x1}
              y1={trendlineData.y1}
              x2={trendlineData.x2}
              y2={trendlineData.y2}
              stroke="oklch(0.65 0.15 280)"
              strokeWidth="0.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        )}

        {/* Bars with emoji markers */}
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
                  <>
                    <div
                      className={`w-full rounded-t-lg bg-gradient-to-t ${barColor} transition-all duration-500 hover:scale-105 cursor-pointer shadow-lg relative`}
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                    >
                      {/* Emoji marker on top of bar */}
                      {day.representativeMood && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl pointer-events-none">
                          {moodEmojis[day.representativeMood] || '😊'}
                        </div>
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                        {day.avgScore?.toFixed(1)} / 10
                      </div>
                    </div>
                  </>
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
