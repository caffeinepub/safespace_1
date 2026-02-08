import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Heart, Activity, Clock, MessageCircle, AlertCircle } from 'lucide-react';
import { useGetUserRecordById } from '../hooks/useQueries';
import { format } from 'date-fns';
import AdminUserDrilldownMoodHistory from './AdminUserDrilldownMoodHistory';

interface AdminUserDrilldownProps {
  userId: string;
  onClose: () => void;
}

export default function AdminUserDrilldown({ userId, onClose }: AdminUserDrilldownProps) {
  const { data: userRecord, isLoading, error } = useGetUserRecordById(userId);

  const formatTimestamp = (timestamp: bigint): string => {
    const milliseconds = Number(timestamp) / 1_000_000;
    const date = new Date(milliseconds);
    return format(date, 'PPpp');
  };

  const getEventTypeLabel = (eventType: any): string => {
    if (typeof eventType === 'object') {
      const key = Object.keys(eventType)[0];
      return key.replace(/([A-Z])/g, ' $1').trim();
    }
    return String(eventType);
  };

  if (isLoading) {
    return (
      <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Failed to load user details</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'An error occurred'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!userRecord) {
    return (
      <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">User record not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="w-6 h-6 text-lavender-600" />
              {userRecord.id}
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-4 flex-wrap">
              <Badge variant={userRecord.authType === 'guest' ? 'secondary' : 'default'}>
                {userRecord.authType === 'guest' ? 'Guest User' : 'Internet Identity'}
              </Badge>
              <span className="text-sm">
                {userRecord.moodEntries.length} mood {userRecord.moodEntries.length === 1 ? 'entry' : 'entries'}
              </span>
              <span className="text-sm">
                Weekly avg: {userRecord.weeklyAverageMood.toFixed(1)} / 10
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mood" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mood">
              <Heart className="w-4 h-4 mr-2" />
              Mood History
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="space-y-4 mt-6">
            <AdminUserDrilldownMoodHistory moodEntries={userRecord.moodEntries} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-6">
            <Card className="border-lavender-200 dark:border-lavender-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activity Timeline
                </CardTitle>
                <CardDescription>
                  {userRecord.activityLog.length} {userRecord.activityLog.length === 1 ? 'event' : 'events'} recorded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {userRecord.activityLog.length > 0 ? (
                    <div className="space-y-3">
                      {userRecord.activityLog
                        .slice()
                        .sort((a, b) => Number(b.timestamp - a.timestamp))
                        .map((event, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-lavender-50/50 to-blush-50/50 dark:from-lavender-950/20 dark:to-blush-950/20 border border-lavender-100 dark:border-lavender-900"
                          >
                            <div className="shrink-0 mt-1">
                              {event.eventType === 'login' && <Activity className="w-4 h-4 text-lavender-600" />}
                              {event.eventType === 'createMoodEntry' && <Heart className="w-4 h-4 text-blush-600" />}
                              {event.eventType === 'updateMoodEntry' && <Heart className="w-4 h-4 text-purple-600" />}
                              {event.eventType === 'pageNavigation' && <MessageCircle className="w-4 h-4 text-sky-600" />}
                              {event.eventType === 'interaction' && <MessageCircle className="w-4 h-4 text-purple-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {getEventTypeLabel(event.eventType)}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimestamp(event.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 break-words">
                                {event.details}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">No activity recorded yet</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
