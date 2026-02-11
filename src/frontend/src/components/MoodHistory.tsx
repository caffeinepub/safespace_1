import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar as CalendarIcon, TrendingUp, AlertCircle } from 'lucide-react';
import { useGetMoodHistory } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MoodCalendar from './MoodCalendar';
import MonthlyMoodTrendChart from './MonthlyMoodTrendChart';
import OverallMoodTrendChart from './OverallMoodTrendChart';
import WeeklyMoodTrendline from './WeeklyMoodTrendline';
import WeeklyMoodSummary from './WeeklyMoodSummary';
import MoodEditor from './MoodEditor';
import { classifyMoodError, MoodError } from '../lib/moodErrors';

interface MoodHistoryProps {
  onBack: () => void;
}

export default function MoodHistory({ onBack }: MoodHistoryProps) {
  const { data: moodHistory, isLoading, error, refetch } = useGetMoodHistory();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const errorType: MoodError | null = error ? classifyMoodError(error) : null;

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCloseEditor = () => {
    setSelectedDate(null);
  };

  if (selectedDate) {
    return <MoodEditor date={selectedDate} onClose={handleCloseEditor} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="icon" className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Mood History
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your emotional journey and discover patterns over time
          </p>
        </div>
      </div>

      {errorType === MoodError.Availability && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">Service Temporarily Unavailable</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            We're having trouble connecting to the mood tracking service. This is usually temporary.
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="ml-4 border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/30"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {errorType === MoodError.Permission && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive">Access Denied</AlertTitle>
          <AlertDescription className="text-destructive/90">
            You don't have permission to view mood history. Please log in to continue.
          </AlertDescription>
        </Alert>
      )}

      {errorType === MoodError.Unknown && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive">Error Loading Mood History</AlertTitle>
          <AlertDescription className="text-destructive/90">
            {error?.toString() || 'An unexpected error occurred'}
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="ml-4 border-destructive/30 hover:bg-destructive/10"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-blue-100/50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-white dark:data-[state=active]:bg-purple-900/50">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-white dark:data-[state=active]:bg-purple-900/50">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <Card className="shadow-lg border-2 border-purple-100 dark:border-purple-900">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardTitle className="text-2xl flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Mood Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </div>
              ) : (
                <MoodCalendar moodHistory={moodHistory || []} onDateSelect={handleDateSelect} viewMode="month" />
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-2 border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                <CardTitle className="text-xl">This Week</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <WeeklyMoodTrendline moodHistory={moodHistory || []} />
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-2 border-pink-100 dark:border-pink-900">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
                <CardTitle className="text-xl">Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <WeeklyMoodSummary moodHistory={moodHistory || []} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="shadow-lg border-2 border-purple-100 dark:border-purple-900">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <MonthlyMoodTrendChart moodHistory={moodHistory || []} />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-blue-100 dark:border-blue-900">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Overall History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <OverallMoodTrendChart moodHistory={moodHistory || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
