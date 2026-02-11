import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Activity, Calendar } from 'lucide-react';
import { useGetUserRecordById } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminUserDrilldownMoodHistory from './AdminUserDrilldownMoodHistory';
import { Badge } from '@/components/ui/badge';

interface AdminUserDrilldownProps {
  userId: string;
  onBack: () => void;
}

export default function AdminUserDrilldown({ userId, onBack }: AdminUserDrilldownProps) {
  const { data: userRecord, isLoading, error } = useGetUserRecordById(userId);
  const [activeTab, setActiveTab] = useState('mood-history');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !userRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Button onClick={onBack} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'User record not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-3">
          <Button onClick={onBack} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-lavender-600" />
            <h1 className="text-3xl font-bold text-lavender-900">User Details</h1>
          </div>
        </div>

        <Card className="border-lavender-200/50 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lavender-900">
                  {userRecord.id}
                  <Badge variant={userRecord.authType === 'guest' ? 'secondary' : 'default'}>
                    {userRecord.authType === 'guest' ? 'Guest' : 'Internet Identity'}
                  </Badge>
                </CardTitle>
                <CardDescription>User analytics and activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-lavender-200/50 bg-lavender-50/50 p-4">
                <p className="text-sm text-lavender-600">Mood Entries</p>
                <p className="text-2xl font-bold text-lavender-900">{userRecord.moodEntries.length}</p>
              </div>
              <div className="rounded-lg border border-blush-200/50 bg-blush-50/50 p-4">
                <p className="text-sm text-blush-600">Weekly Avg Mood</p>
                <p className="text-2xl font-bold text-blush-900">{userRecord.weeklyAverageMood.toFixed(1)}</p>
              </div>
              <div className="rounded-lg border border-sky-200/50 bg-sky-50/50 p-4">
                <p className="text-sm text-sky-600">Activity Events</p>
                <p className="text-2xl font-bold text-sky-900">{userRecord.activityLog.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="mood-history" className="gap-2">
              <Calendar className="h-4 w-4" />
              Mood History
            </TabsTrigger>
            <TabsTrigger value="activity-log" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood-history">
            <AdminUserDrilldownMoodHistory moodEntries={userRecord.moodEntries} />
          </TabsContent>

          <TabsContent value="activity-log">
            <Card className="border-lavender-200/50 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lavender-900">
                  <Activity className="h-5 w-5" />
                  Activity Log
                </CardTitle>
                <CardDescription>Recent user activity and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userRecord.activityLog.length > 0 ? (
                    userRecord.activityLog
                      .slice()
                      .reverse()
                      .map((event, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between rounded-lg border border-lavender-200/50 bg-white/50 p-3"
                        >
                          <div>
                            <p className="font-medium text-lavender-900">
                              {event.eventType === 'login' && 'Login'}
                              {event.eventType === 'createMoodEntry' && 'Created Mood Entry'}
                              {event.eventType === 'updateMoodEntry' && 'Updated Mood Entry'}
                              {event.eventType === 'pageNavigation' && 'Page Navigation'}
                              {event.eventType === 'interaction' && 'Interaction'}
                            </p>
                            <p className="text-sm text-lavender-600">{event.details}</p>
                          </div>
                          <p className="text-xs text-lavender-500">{formatTimestamp(event.timestamp)}</p>
                        </div>
                      ))
                  ) : (
                    <div className="py-8 text-center text-lavender-600">
                      <Activity className="mx-auto mb-2 h-12 w-12 text-lavender-300" />
                      <p>No activity recorded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
