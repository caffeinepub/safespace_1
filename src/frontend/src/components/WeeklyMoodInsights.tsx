import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useGetWeeklyAnalysis } from '../hooks/useQueries';
import { formatDistanceToNow } from 'date-fns';

interface WeeklyMoodInsightsProps {
  onBack: () => void;
  guestId?: string;
}

export default function WeeklyMoodInsights({ onBack, guestId }: WeeklyMoodInsightsProps) {
  const { data: weeklyAnalysis = [], isLoading } = useGetWeeklyAnalysis();

  if (guestId) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Mood Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Weekly insights are only available for authenticated users. Please log in to view your insights.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Mood Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
            </div>
          )}

          {!isLoading && weeklyAnalysis.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No weekly insights available yet. Keep tracking your mood to see patterns!
            </p>
          )}

          {!isLoading && weeklyAnalysis.length > 0 && (
            <div className="space-y-6">
              {weeklyAnalysis.map((analysis, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="font-semibold text-lg">Analysis Period</h3>
                  
                  {analysis.weeklySummaries.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Weekly Summaries</h4>
                      {analysis.weeklySummaries.map((summary, summaryIdx) => (
                        <Card key={summaryIdx} className="bg-lavender-50">
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Week Start</p>
                                <p className="font-medium">
                                  {formatDistanceToNow(Number(summary.weekStart) / 1000000, { addSuffix: true })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Average Mood</p>
                                <p className="font-medium">{summary.weeklyMoodAverage.toFixed(1)} / 10</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Total Steps</p>
                                <p className="font-medium">{summary.totalSteps.toString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Avg Sleep</p>
                                <p className="font-medium">{summary.averageSleepHours.toFixed(1)} hrs</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {analysis.anomalies.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Anomalies Detected</h4>
                      {analysis.anomalies.map((anomaly, anomalyIdx) => (
                        <div key={anomalyIdx} className="flex items-start gap-3 p-3 bg-blush-50 rounded-lg">
                          <TrendingDown className="w-5 h-5 text-blush-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">{anomaly.typeText}</p>
                            <p className="text-xs text-muted-foreground">
                              Week of {formatDistanceToNow(Number(anomaly.weekStart) / 1000000, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {analysis.clusters.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Mood Clusters</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysis.clusters.length} distinct mood patterns identified
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
