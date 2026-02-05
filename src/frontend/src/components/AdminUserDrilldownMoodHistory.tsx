import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar as CalendarIcon, TrendingUp, Heart } from 'lucide-react';
import { MoodEntry } from '../backend';
import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { timestampToLocalDate } from '../lib/timestampUtils';
import MoodCalendar from './MoodCalendar';
import WeeklyMoodTrendline from './WeeklyMoodTrendline';
import MonthlyMoodTrendChart from './MonthlyMoodTrendChart';
import OverallMoodTrendChart from './OverallMoodTrendChart';

interface AdminUserDrilldownMoodHistoryProps {
  moodEntries: MoodEntry[];
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

export default function AdminUserDrilldownMoodHistory({ moodEntries }: AdminUserDrilldownMoodHistoryProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [chartView, setChartView] = useState<'weekly' | 'monthly' | 'overall'>('weekly');

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedEntry = selectedDate
    ? moodEntries.find(entry => {
        const entryDate = timestampToLocalDate(entry.timestamp);
        return isSameDay(entryDate, selectedDate);
      })
    : null;

  if (moodEntries.length === 0) {
    return (
      <Alert className="border-pink-300 dark:border-pink-700 bg-gradient-to-r from-pink-50/90 to-rose-50/90 dark:from-pink-950/40 dark:to-rose-950/40">
        <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
        <AlertTitle className="text-pink-900 dark:text-pink-100">No Mood Entries</AlertTitle>
        <AlertDescription className="text-pink-700 dark:text-pink-300">
          This user has not recorded any mood entries yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/70 dark:bg-gray-900/70 border border-lavender-200 dark:border-lavender-800">
          <TabsTrigger
            value="calendar"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender-500 data-[state=active]:to-blush-500 data-[state=active]:text-white"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger
            value="charts"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender-500 data-[state=active]:to-blush-500 data-[state=active]:text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Charts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6 space-y-4">
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Mood Calendar</CardTitle>
                <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as 'month' | 'week')}>
                  <TabsList className="h-9">
                    <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
                    <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription>Click on a date to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <MoodCalendar
                moodHistory={moodEntries}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                viewMode={calendarView}
              />
            </CardContent>
          </Card>

          {selectedEntry && (
            <Card className="border-0 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/40 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">{moodEmojis[selectedEntry.mood] || '😐'}</span>
                  <span className="capitalize">{selectedEntry.mood}</span>
                </CardTitle>
                <CardDescription>
                  {format(timestampToLocalDate(selectedEntry.timestamp), 'PPpp')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Score:</span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {selectedEntry.moodScore.toString()} / 10
                    </span>
                  </div>
                  {selectedEntry.note && (
                    <div className="mt-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded">
                      <p className="text-sm italic text-muted-foreground">{selectedEntry.note}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="charts" className="mt-6 space-y-4">
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Mood Trends</CardTitle>
                <Tabs value={chartView} onValueChange={(v) => setChartView(v as 'weekly' | 'monthly' | 'overall')}>
                  <TabsList className="h-9">
                    <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
                    <TabsTrigger value="overall" className="text-xs">Overall</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {chartView === 'weekly' && (
                <div className="mood-graph-container">
                  <WeeklyMoodTrendline moodHistory={moodEntries} />
                </div>
              )}
              {chartView === 'monthly' && <MonthlyMoodTrendChart moodHistory={moodEntries} />}
              {chartView === 'overall' && <OverallMoodTrendChart moodHistory={moodEntries} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
