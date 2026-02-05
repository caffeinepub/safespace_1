import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Heart, Activity, Clock, MessageCircle, AlertCircle } from 'lucide-react';
import { useUserRecordById } from '../hooks/useQueries';
import { format } from 'date-fns';
import AdminUserDrilldownMoodHistory from './AdminUserDrilldownMoodHistory';

interface AdminUserDrilldownProps {
  userId: string;
  onClose: () => void;
}

export default function AdminUserDrilldown({ userId, onClose }: AdminUserDrilldownProps) {
  const { data: userRecord, isLoading, error } = useUserRecordById(userId);

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
          <div className="flex items-center gap-3">
            <div className="admin-icon-badge admin-badge-purple">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {userRecord.id}
                <Badge variant={userRecord.authType === 'guest' ? 'secondary' : 'default'}>
                  {userRecord.authType === 'guest' ? 'Guest' : 'Internet Identity'}
                </Badge>
              </CardTitle>
              <CardDescription>
                {userRecord.moodEntries.length} mood entries • Weekly avg: {userRecord.weeklyAverageMood.toFixed(1)}/10
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="moods" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/70 dark:bg-gray-900/70 border border-lavender-200 dark:border-lavender-800">
            <TabsTrigger 
              value="moods"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender-500 data-[state=active]:to-blush-500 data-[state=active]:text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              Mood History
            </TabsTrigger>
            <TabsTrigger 
              value="activity"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender-500 data-[state=active]:to-blush-500 data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moods" className="mt-6">
            <AdminUserDrilldownMoodHistory moodEntries={userRecord.moodEntries} />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            {userRecord.activityLog.length > 0 ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {userRecord.activityLog.map((event, index) => (
                    <Card key={index} className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-medium text-blue-900 dark:text-blue-100 capitalize">
                                {getEventTypeLabel(event.eventType)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{event.details}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(event.timestamp)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Alert className="border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50/90 to-cyan-50/90 dark:from-blue-950/40 dark:to-cyan-950/40">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-900 dark:text-blue-100">No Activity Logged</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  No activity has been recorded for this user yet.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
