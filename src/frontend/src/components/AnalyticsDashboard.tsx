import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Users, Activity, TrendingUp } from 'lucide-react';
import AccessDeniedScreen from './AccessDeniedScreen';
import { useGetAllUserRecords, useGetAnalytics } from '../hooks/useQueries';

interface AnalyticsDashboardProps {
  onBack: () => void;
  isAdmin: boolean;
}

export default function AnalyticsDashboard({ onBack, isAdmin }: AnalyticsDashboardProps) {
  const { data: userRecords = [], isLoading: recordsLoading } = useGetAllUserRecords();
  const { data: analytics = [], isLoading: analyticsLoading } = useGetAnalytics();

  if (!isAdmin) {
    return <AccessDeniedScreen onBack={onBack} />;
  }

  const totalUsers = userRecords.length;
  const totalMoodEntries = userRecords.reduce((sum, user) => sum + user.moodEntries.length, 0);
  const avgMoodScore = userRecords.length > 0
    ? userRecords.reduce((sum, user) => sum + user.weeklyAverageMood, 0) / userRecords.length
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {(recordsLoading || analyticsLoading) && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
              </div>
            )}

            {!recordsLoading && !analyticsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-lavender-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-lavender-600" />
                      <div>
                        <p className="text-2xl font-bold">{totalUsers}</p>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blush-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Activity className="w-8 h-8 text-blush-600" />
                      <div>
                        <p className="text-2xl font-bold">{totalMoodEntries}</p>
                        <p className="text-sm text-muted-foreground">Mood Entries</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-sky-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-sky-600" />
                      <div>
                        <p className="text-2xl font-bold">{avgMoodScore.toFixed(1)}</p>
                        <p className="text-sm text-muted-foreground">Avg Mood Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Records</CardTitle>
          </CardHeader>
          <CardContent>
            {recordsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
              </div>
            )}

            {!recordsLoading && userRecords.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No user records available yet.
              </p>
            )}

            {!recordsLoading && userRecords.length > 0 && (
              <div className="space-y-3">
                {userRecords.map((user) => (
                  <Card key={user.id} className="bg-gray-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.authType === 'internetIdentity' ? 'Internet Identity' : 'Guest'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{user.moodEntries.length} entries</p>
                          <p className="text-sm text-muted-foreground">
                            Avg: {user.weeklyAverageMood.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
