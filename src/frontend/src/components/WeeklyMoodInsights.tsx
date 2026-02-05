import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, AlertCircle, Activity, Moon, Target, Heart } from 'lucide-react';
import { useWeeklyMoodInsights } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMemo } from 'react';

export default function WeeklyMoodInsights() {
  const { data: weeklyAnalyses, isLoading, error } = useWeeklyMoodInsights();

  const aggregatedInsights = useMemo(() => {
    if (!weeklyAnalyses || weeklyAnalyses.length === 0) return null;

    let totalWeeks = 0;
    let totalClusters = 0;
    let totalAnomalies = 0;
    let avgMoodScore = 0;
    let avgSteps = 0;
    let avgSleep = 0;
    let avgWeeklyMood = 0;

    weeklyAnalyses.forEach((analysis) => {
      totalWeeks += analysis.weeklySummaries.length;
      totalClusters += analysis.clusters.length;
      totalAnomalies += analysis.anomalies.length;

      analysis.weeklySummaries.forEach((summary) => {
        avgMoodScore += summary.averageMoodScore;
        avgSteps += Number(summary.totalSteps);
        avgSleep += summary.averageSleepHours;
        avgWeeklyMood += summary.weeklyMoodAverage;
      });
    });

    const summaryCount = weeklyAnalyses.reduce((sum, a) => sum + a.weeklySummaries.length, 0);

    return {
      totalWeeks,
      totalClusters,
      totalAnomalies,
      avgMoodScore: summaryCount > 0 ? (avgMoodScore / summaryCount).toFixed(1) : '0',
      avgSteps: summaryCount > 0 ? Math.round(avgSteps / summaryCount) : 0,
      avgSleep: summaryCount > 0 ? (avgSleep / summaryCount).toFixed(1) : '0',
      avgWeeklyMood: summaryCount > 0 ? (avgWeeklyMood / summaryCount).toFixed(1) : '0',
    };
  }, [weeklyAnalyses]);

  const clusterDistribution = useMemo(() => {
    if (!weeklyAnalyses || weeklyAnalyses.length === 0) return [];

    const clusterCounts = new Map<number, number>();

    weeklyAnalyses.forEach((analysis) => {
      analysis.clusters.forEach((cluster) => {
        const count = clusterCounts.get(Number(cluster.clusterId)) || 0;
        clusterCounts.set(Number(cluster.clusterId), count + 1);
      });
    });

    return Array.from(clusterCounts.entries())
      .map(([clusterId, count]) => ({
        clusterId,
        count,
        percentage: weeklyAnalyses.length > 0 ? Math.round((count / weeklyAnalyses.reduce((sum, a) => sum + a.clusters.length, 0)) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [weeklyAnalyses]);

  const weeklyMoodScores = useMemo(() => {
    if (!weeklyAnalyses || weeklyAnalyses.length === 0) return [];

    const allSummaries: Array<{ weekStart: bigint; weeklyMoodAverage: number }> = [];

    weeklyAnalyses.forEach((analysis) => {
      analysis.weeklySummaries.forEach((summary) => {
        allSummaries.push({
          weekStart: summary.weekStart,
          weeklyMoodAverage: summary.weeklyMoodAverage,
        });
      });
    });

    return allSummaries
      .sort((a, b) => Number(a.weekStart - b.weekStart))
      .slice(-8);
  }, [weeklyAnalyses]);

  const formatWeekDate = (timestamp: bigint): string => {
    const milliseconds = Number(timestamp) / 1_000_000;
    const date = new Date(milliseconds);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMoodColor = (score: number): string => {
    if (score >= 8) return '#10B981';
    if (score >= 6) return '#3B82F6';
    if (score >= 4) return '#F59E0B';
    return '#EF4444';
  };

  const clusterColors = ['#B8A4D4', '#E8B4D4', '#A4C4E8'];
  const clusterNames = ['Balanced Pattern', 'High Energy Pattern', 'Rest & Recovery Pattern'];

  if (isLoading) {
    return (
      <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="admin-icon-badge admin-badge-purple">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Weekly Mood Insights</CardTitle>
              <CardDescription>Loading analysis data...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="admin-icon-badge admin-badge-purple">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Weekly Mood Insights</CardTitle>
              <CardDescription>Error loading analysis data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-destructive bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <AlertTitle className="text-destructive">Failed to Load Analysis</AlertTitle>
            <AlertDescription className="text-destructive/90">
              {error instanceof Error ? error.message : 'An error occurred while loading weekly mood insights'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!weeklyAnalyses || weeklyAnalyses.length === 0 || !aggregatedInsights) {
    return (
      <Card className="border-0 bg-gradient-to-br from-purple-50/90 via-pink-50/90 to-blue-50/90 dark:from-purple-950/40 dark:via-pink-950/40 dark:to-blue-950/40 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="admin-icon-badge admin-badge-purple">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Weekly Mood Insights</CardTitle>
              <CardDescription>No analysis data available yet</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-purple-300 dark:border-purple-700 bg-gradient-to-r from-purple-50/90 to-pink-50/90 dark:from-purple-950/40 dark:to-pink-950/40">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <AlertTitle className="text-purple-900 dark:text-purple-100">Start Tracking Wellness Data</AlertTitle>
            <AlertDescription className="text-purple-700 dark:text-purple-300">
              Weekly mood insights will appear here once users start logging their daily mood with step count and sleep hours data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="admin-icon-badge admin-badge-purple">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Weekly Mood Insights</CardTitle>
            <CardDescription>
              Advanced pattern analysis using KMeans clustering and DBSCAN anomaly detection
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Avg Mood Score</span>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {aggregatedInsights.avgMoodScore}/10
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Weekly Mood Avg</span>
                <Heart className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                {aggregatedInsights.avgWeeklyMood}/10
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Avg Weekly Steps</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {aggregatedInsights.avgSteps.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Avg Sleep Hours</span>
                <Moon className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                {aggregatedInsights.avgSleep}h
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Mood Score Trend */}
        {weeklyMoodScores.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-semibold">Weekly Mood Average Trend (0-10)</h3>
            </div>
            
            <Card className="border-0 bg-gradient-to-br from-rose-50/80 to-pink-50/80 dark:from-rose-950/30 dark:to-pink-950/30 shadow-md">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {weeklyMoodScores.map((week, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-muted-foreground">
                          Week of {formatWeekDate(week.weekStart)}
                        </span>
                        <span 
                          className="font-bold text-lg"
                          style={{ color: getMoodColor(week.weeklyMoodAverage) }}
                        >
                          {week.weeklyMoodAverage.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="admin-bar-container">
                        <div
                          className="h-4 rounded-full transition-all duration-500 shadow-sm"
                          style={{
                            width: `${(week.weeklyMoodAverage / 10) * 100}%`,
                            background: `linear-gradient(90deg, ${getMoodColor(week.weeklyMoodAverage)}, ${getMoodColor(week.weeklyMoodAverage)}dd)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cluster Distribution */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Weekly Pattern Clusters (KMeans k=3)</h3>
          </div>
          
          <div className="space-y-3">
            {clusterDistribution.map((cluster, index) => (
              <div key={cluster.clusterId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: clusterColors[cluster.clusterId % 3] }}
                    />
                    <span className="font-medium">
                      {clusterNames[cluster.clusterId % 3]} (Cluster {cluster.clusterId + 1})
                    </span>
                  </div>
                  <span className="font-bold text-purple-600">
                    {cluster.count} weeks ({cluster.percentage}%)
                  </span>
                </div>
                <div className="admin-bar-container">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${cluster.percentage}%`,
                      background: `linear-gradient(90deg, ${clusterColors[cluster.clusterId % 3]}, ${clusterColors[cluster.clusterId % 3]}dd)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly Detection */}
        {aggregatedInsights.totalAnomalies > 0 && (
          <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                Anomalies Detected (DBSCAN)
              </h3>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              {aggregatedInsights.totalAnomalies} unusual weekly patterns detected that deviate from normal mood and wellness routines.
              These may indicate periods requiring extra attention or support.
            </p>
          </div>
        )}

        {/* Analysis Summary */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-lavender-50 to-blush-50 dark:from-lavender-950/30 dark:to-blush-950/30 border border-lavender-200 dark:border-lavender-800">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-lavender-600 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-foreground">About This Analysis</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <strong>Weekly Mood Average:</strong> Calculated from daily mood scores aggregated per week (0-10 scale)
                </li>
                <li>
                  <strong>KMeans Clustering (k=3):</strong> Categorizes weekly mood patterns into 3 distinct behavioral clusters
                </li>
                <li>
                  <strong>DBSCAN Anomaly Detection:</strong> Identifies unusual weeks that deviate from normal patterns
                </li>
                <li>
                  <strong>Feature Normalization:</strong> Uses StandardScaler for consistent analysis across mood, sleep, and activity data
                </li>
                <li>
                  <strong>Weekly Aggregation:</strong> Combines daily entries into weekly summaries for pattern recognition
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
