import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Calendar as CalendarIcon, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { useMoodHistory } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Mood } from '../backend';
import { useState } from 'react';
import MoodEditor from './MoodEditor';
import { format, isSameDay } from 'date-fns';
import { timestampToLocalDate } from '../lib/timestampUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WeeklyMoodTrendline from './WeeklyMoodTrendline';
import WeeklyMoodSummary from './WeeklyMoodSummary';
import MoodCalendar from './MoodCalendar';
import MonthlyMoodTrendChart from './MonthlyMoodTrendChart';
import OverallMoodTrendChart from './OverallMoodTrendChart';
import { classifyMoodError, MoodErrorType } from '../lib/moodErrors';

interface MoodHistoryProps {
  userId: string;
  onBack: () => void;
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
  happy: 'from-yellow-400 to-orange-400',
  sad: 'from-blue-500 to-indigo-500',
  anxious: 'from-orange-400 to-red-400',
  calm: 'from-teal-400 to-green-400',
  angry: 'from-red-500 to-orange-600',
  grateful: 'from-pink-400 to-rose-400',
  stressed: 'from-red-400 to-pink-400',
  lonely: 'from-gray-400 to-blue-400',
  hopeful: 'from-purple-400 to-pink-400',
  content: 'from-blue-400 to-cyan-400',
  overwhelmed: 'from-red-500 to-orange-500',
  inspired: 'from-indigo-400 to-purple-400',
  relaxed: 'from-green-400 to-teal-400',
};

export default function MoodHistory({ userId, onBack }: MoodHistoryProps) {
  const { data: moodHistory, isLoading, isError, error, refetch } = useMoodHistory();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [editingMood, setEditingMood] = useState<{ date: Date; mood: Mood; note?: string } | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [chartView, setChartView] = useState<'weekly' | 'monthly' | 'overall'>('weekly');

  const handleDateSelect = (date: Date) => {
    if (!moodHistory) return;

    const moodForDate = moodHistory.find(entry => {
      const entryDate = timestampToLocalDate(entry.timestamp);
      return isSameDay(entryDate, date);
    });

    if (moodForDate) {
      setEditingMood({
        date,
        mood: moodForDate.mood,
        note: moodForDate.note,
      });
    }
    setSelectedDate(date);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    const moodError = classifyMoodError(error);
    
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Mood History
            </h1>
            <p className="text-muted-foreground mt-1">
              Reflect on your emotional journey
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to Load Mood History</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>{moodError.userMessage}</p>
            {moodError.type === MoodErrorType.Availability && (
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (editingMood) {
    return (
      <MoodEditor
        userId={userId}
        date={editingMood.date}
        existingMood={editingMood.mood}
        existingNote={editingMood.note}
        onBack={() => setEditingMood(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="shrink-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Mood History
          </h1>
          <p className="text-muted-foreground mt-1">
            Reflect on your emotional journey
          </p>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="graph" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Trend Charts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-purple-600" />
                  <CardTitle>Mood Calendar</CardTitle>
                </div>
                <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as 'month' | 'week')}>
                  <TabsList className="h-9">
                    <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
                    <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription>
                Click on a date with a mood entry to view or edit it
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-2xl">
                <MoodCalendar
                  moodHistory={moodHistory || []}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  viewMode={calendarView}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graph" className="space-y-6">
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <CardTitle>Mood Trends</CardTitle>
                </div>
                <Tabs value={chartView} onValueChange={(v) => setChartView(v as 'weekly' | 'monthly' | 'overall')}>
                  <TabsList className="h-9">
                    <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
                    <TabsTrigger value="overall" className="text-xs">Overall</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription>
                {chartView === 'weekly' && 'Your mood patterns for the current week (Monday–Sunday)'}
                {chartView === 'monthly' && 'Your mood summary for the current month'}
                {chartView === 'overall' && 'Your overall mood trends across all history'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!moodHistory || moodHistory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No mood data available yet. Start tracking to see your trends!
                  </p>
                  <Button onClick={onBack} className="bg-gradient-to-r from-purple-500 to-pink-500">
                    Track Your Mood
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {chartView === 'weekly' && (
                    <>
                      <WeeklyMoodSummary moodHistory={moodHistory} />
                      <div className="mood-graph-container">
                        <WeeklyMoodTrendline moodHistory={moodHistory} />
                      </div>
                    </>
                  )}
                  {chartView === 'monthly' && (
                    <MonthlyMoodTrendChart moodHistory={moodHistory} />
                  )}
                  {chartView === 'overall' && (
                    <OverallMoodTrendChart moodHistory={moodHistory} />
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {Object.entries(moodEmojis).slice(0, 8).map(([mood, emoji]) => (
                      <div key={mood} className="flex items-center gap-2 text-sm">
                        <span className="text-lg">{emoji}</span>
                        <span className="capitalize text-muted-foreground">{mood}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <CardTitle>Recent Entries</CardTitle>
          </div>
          <CardDescription>
            Your mood entries over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!moodHistory || moodHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No mood entries yet. Start tracking your mood to see your history here!
              </p>
              <Button onClick={onBack} className="bg-gradient-to-r from-purple-500 to-pink-500">
                Track Your First Mood
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {moodHistory
                .slice()
                .sort((a, b) => Number(b.timestamp - a.timestamp))
                .map((entry, index) => {
                  const moodKind = entry.mood;
                  const date = timestampToLocalDate(entry.timestamp);
                  
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer"
                      onClick={() => handleDateSelect(date)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 shrink-0 rounded-full bg-gradient-to-br ${moodColors[moodKind] || 'from-gray-400 to-gray-500'} flex items-center justify-center text-2xl shadow-md`}>
                          {moodEmojis[moodKind] || '😐'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold capitalize">{moodKind}</h3>
                            <span className="text-sm text-muted-foreground">
                              {format(date, 'PPP')}
                            </span>
                          </div>
                          {entry.note && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
