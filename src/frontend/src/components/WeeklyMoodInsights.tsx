import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { useGetWeeklyMoodInsights } from '../hooks/useQueries';

export default function WeeklyMoodInsights() {
  const { data: insights, isLoading, error } = useGetWeeklyMoodInsights();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Insights</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load weekly mood insights'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No weekly insights available yet</p>
        <p className="text-sm text-muted-foreground/70 mt-2">
          Insights will appear as users track their moods over time
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {insights.map((insight, index) => (
        <Card key={index} className="border-lavender-200 dark:border-lavender-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Week {index + 1} Analysis
            </CardTitle>
            <CardDescription>
              {insight.weeklySummaries.length} {insight.weeklySummaries.length === 1 ? 'summary' : 'summaries'},{' '}
              {insight.clusters.length} {insight.clusters.length === 1 ? 'cluster' : 'clusters'},{' '}
              {insight.anomalies.length} {insight.anomalies.length === 1 ? 'anomaly' : 'anomalies'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insight.weeklySummaries.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-sm text-muted-foreground">Weekly Summaries</h4>
                  <div className="space-y-2">
                    {insight.weeklySummaries.map((summary, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-gradient-to-r from-lavender-50 to-purple-50 dark:from-lavender-950/30 dark:to-purple-950/30 text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span>Avg Mood: {summary.averageMoodScore.toFixed(1)}</span>
                          <span>Sleep: {summary.averageSleepHours.toFixed(1)}h</span>
                          <span>Steps: {Number(summary.totalSteps).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {insight.anomalies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-sm text-muted-foreground">Anomalies Detected</h4>
                  <div className="space-y-2">
                    {insight.anomalies.map((anomaly, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span>{anomaly.typeText}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
