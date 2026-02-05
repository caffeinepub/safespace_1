import { useMemo, useState } from 'react';
import { MoodEntry } from '../backend';
import { timestampToLocalDate } from '../lib/timestampUtils';
import { isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoodCalendarProps {
  moodHistory: MoodEntry[];
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  viewMode: 'month' | 'week';
}

const moodEmojis: Record<string, string> = {
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
  relaxed: '😌',
};

const moodColors: Record<string, string> = {
  happy: 'bg-yellow-200 dark:bg-yellow-800/40',
  sad: 'bg-blue-200 dark:bg-blue-800/40',
  anxious: 'bg-orange-200 dark:bg-orange-800/40',
  calm: 'bg-teal-200 dark:bg-teal-800/40',
  angry: 'bg-red-200 dark:bg-red-800/40',
  grateful: 'bg-pink-200 dark:bg-pink-800/40',
  stressed: 'bg-red-200 dark:bg-red-800/40',
  lonely: 'bg-gray-200 dark:bg-gray-800/40',
  hopeful: 'bg-purple-200 dark:bg-purple-800/40',
  content: 'bg-cyan-200 dark:bg-cyan-800/40',
  overwhelmed: 'bg-orange-200 dark:bg-orange-800/40',
  inspired: 'bg-indigo-200 dark:bg-indigo-800/40',
  relaxed: 'bg-green-200 dark:bg-green-800/40',
};

export default function MoodCalendar({ moodHistory, selectedDate, onDateSelect, viewMode }: MoodCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { calendarDays, weekDays } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    // For week view, get current week
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const week = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return { calendarDays: days, weekDays: week };
  }, [currentMonth]);

  const getMoodForDate = (date: Date): MoodEntry | undefined => {
    return moodHistory.find(entry => {
      const entryDate = timestampToLocalDate(entry.timestamp);
      return isSameDay(entryDate, date);
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const renderDayCell = (day: Date, isOutsideMonth: boolean = false) => {
    const mood = getMoodForDate(day);
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    const isToday = isSameDay(day, new Date());

    return (
      <button
        key={day.toISOString()}
        onClick={() => mood && onDateSelect(day)}
        disabled={!mood}
        className={`
          relative aspect-square min-h-[60px] md:min-h-[80px] p-2 rounded-xl
          transition-all duration-200 flex flex-col items-center justify-center gap-1
          ${mood ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default'}
          ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
          ${isToday ? 'ring-2 ring-blue-400' : ''}
          ${mood ? moodColors[mood.mood] || 'bg-gray-100 dark:bg-gray-800' : 'bg-transparent'}
          ${isOutsideMonth ? 'opacity-30' : 'opacity-100'}
        `}
      >
        <span className={`text-sm md:text-base font-semibold ${isOutsideMonth ? 'text-muted-foreground' : ''}`}>
          {format(day, 'd')}
        </span>
        {mood && (
          <span className="text-xl md:text-2xl" title={mood.mood}>
            {moodEmojis[mood.mood] || '😐'}
          </span>
        )}
      </button>
    );
  };

  if (viewMode === 'week') {
    return (
      <div className="w-full space-y-4">
        <div className="text-center font-semibold text-lg">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          {weekDays.map(day => renderDayCell(day, false))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {calendarDays.map(day => renderDayCell(day, !isSameMonth(day, currentMonth)))}
      </div>
    </div>
  );
}
