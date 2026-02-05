import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Clock, TrendingUp, Shield, AlertCircle, RefreshCw, Activity, BarChart3, Heart, Sparkles, Download, ChevronRight } from 'lucide-react';
import { useAggregatedAnalytics, useIsCallerAdmin, useUserRecords } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WeeklyMoodInsights from './WeeklyMoodInsights';
import AdminUserDrilldown from './AdminUserDrilldown';
import { Badge } from '@/components/ui/badge';

interface AnalyticsDashboardProps {
  onBack: () => void;
}

export default function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const { data: isAdmin, isLoading: isAdminLoading, error: adminError, refetch: refetchAdmin } = useIsCallerAdmin();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAggregatedAnalytics();
  const { data: userRecords, isLoading: userRecordsLoading, error: userRecordsError, refetch: refetchUserRecords } = useUserRecords();
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log('Admin Dashboard - Admin Status:', { isAdmin, isAdminLoading, adminError });
  }, [isAdmin, isAdminLoading, adminError]);

  useEffect(() => {
    if (analytics) {
      console.log('Admin Dashboard - Analytics Data:', analytics);
    }
    if (analyticsError) {
      console.error('Admin Dashboard - Analytics Error:', analyticsError);
    }
  }, [analytics, analyticsError]);

  useEffect(() => {
    if (userRecords) {
      console.log('Admin Dashboard - User Records:', { count: userRecords.length, sample: userRecords.slice(0, 3) });
    }
    if (userRecordsError) {
      console.error('Admin Dashboard - User Records Error:', userRecordsError);
    }
  }, [userRecords, userRecordsError]);

  const formatDuration = (nanoseconds: bigint): string => {
    const milliseconds = Number(nanoseconds) / 1_000_000;
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    } else if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleRefresh = () => {
    refetchAdmin();
    refetchAnalytics();
    refetchUserRecords();
  };

  const handleDownloadScript = () => {
    const scriptContent = `"""
Weekly Mood Analysis Script for SafeSpace Application

This script performs advanced mood pattern analysis using machine learning techniques
to identify weekly patterns and detect anomalies in mood, sleep, and activity data.

Required libraries:
- pandas: Data manipulation and analysis
- numpy: Numerical computing
- scikit-learn: Machine learning algorithms (StandardScaler, KMeans, DBSCAN)
- matplotlib: Data visualization

Usage:
    python weekly_mood_analysis.py

Input:
    A pandas DataFrame with columns:
    - date (datetime): Date of the entry
    - mood_score (float): Numerical mood score (e.g., 1-10)
    - sleep_hours (float): Hours of sleep
    - step_count (int): Daily step count

Output:
    - Scatter plot visualization showing sleep vs mood patterns
    - Cluster labels for weekly patterns
    - Anomaly detection results
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN
import matplotlib.pyplot as plt

def prepare_sample_data():
    """
    Create sample data for demonstration purposes.
    Replace this with your actual data loading logic.
    """
    np.random.seed(42)
    dates = pd.date_range(start='2026-01-01', end='2026-01-30', freq='D')
    
    data = pd.DataFrame({
        'date': dates,
        'mood_score': np.random.uniform(4, 9, len(dates)),
        'sleep_hours': np.random.uniform(5, 9, len(dates)),
        'step_count': np.random.randint(3000, 12000, len(dates))
    })
    
    return data

def aggregate_weekly_data(df):
    """
    Aggregate daily data into weekly summaries.
    
    Args:
        df (pd.DataFrame): Daily data with date, mood_score, sleep_hours, step_count
    
    Returns:
        pd.DataFrame: Weekly aggregated data
    """
    df = df.copy()
    df.set_index('date', inplace=True)
    
    # Resample to weekly frequency
    weekly_data = df.resample('W').agg({
        'mood_score': 'mean',
        'sleep_hours': 'mean',
        'step_count': 'sum'
    }).reset_index()
    
    return weekly_data

def normalize_features(df, features):
    """
    Normalize features using StandardScaler.
    
    Args:
        df (pd.DataFrame): Weekly data
        features (list): List of feature column names to normalize
    
    Returns:
        tuple: (normalized_data, scaler)
    """
    scaler = StandardScaler()
    normalized_data = scaler.fit_transform(df[features])
    
    return normalized_data, scaler

def apply_kmeans_clustering(normalized_data, n_clusters=3):
    """
    Apply KMeans clustering to categorize weekly patterns.
    
    Args:
        normalized_data (np.ndarray): Normalized feature data
        n_clusters (int): Number of clusters (default: 3)
    
    Returns:
        np.ndarray: Cluster labels for each week
    """
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(normalized_data)
    
    return cluster_labels

def detect_anomalies(normalized_data, eps=0.5, min_samples=2):
    """
    Apply DBSCAN to detect anomalies in weekly routines.
    
    Args:
        normalized_data (np.ndarray): Normalized feature data
        eps (float): Maximum distance between samples (default: 0.5)
        min_samples (int): Minimum samples in a neighborhood (default: 2)
    
    Returns:
        np.ndarray: Anomaly labels (-1 indicates anomaly)
    """
    dbscan = DBSCAN(eps=eps, min_samples=min_samples)
    anomaly_labels = dbscan.fit_predict(normalized_data)
    
    return anomaly_labels

def visualize_results(weekly_data, cluster_labels, anomaly_labels):
    """
    Create scatter plot visualization of sleep vs mood patterns.
    
    Args:
        weekly_data (pd.DataFrame): Weekly aggregated data
        cluster_labels (np.ndarray): KMeans cluster labels
        anomaly_labels (np.ndarray): DBSCAN anomaly labels
    """
    # Set up soothing color palette
    colors = ['#B8A4D4', '#E8B4D4', '#A4C4E8']  # Lavender, Blush, Sky
    
    plt.figure(figsize=(12, 8))
    
    # Plot each cluster with different colors
    for cluster in range(max(cluster_labels) + 1):
        mask = cluster_labels == cluster
        plt.scatter(
            weekly_data.loc[mask, 'sleep_hours'],
            weekly_data.loc[mask, 'mood_score'],
            c=colors[cluster % len(colors)],
            label=f'Pattern {cluster + 1}',
            s=150,
            alpha=0.7,
            edgecolors='white',
            linewidth=2
        )
    
    # Mark anomalies with red outline
    anomaly_mask = anomaly_labels == -1
    if anomaly_mask.any():
        plt.scatter(
            weekly_data.loc[anomaly_mask, 'sleep_hours'],
            weekly_data.loc[anomaly_mask, 'mood_score'],
            facecolors='none',
            edgecolors='#E74C3C',
            s=250,
            linewidth=3,
            label='Anomalies',
            marker='o'
        )
    
    # Styling
    plt.xlabel('Sleep Hours (Weekly Average)', fontsize=13, fontweight='500')
    plt.ylabel('Mood Score (Weekly Average)', fontsize=13, fontweight='500')
    plt.title('Weekly Mood Patterns: Sleep vs Mood Analysis', 
              fontsize=16, fontweight='600', pad=20)
    
    plt.legend(loc='best', frameon=True, shadow=True, fontsize=11)
    plt.grid(True, alpha=0.2, linestyle='--', linewidth=0.8)
    
    # Set background color to match SafeSpace theme
    ax = plt.gca()
    ax.set_facecolor('#F9F7FC')
    plt.gcf().patch.set_facecolor('white')
    
    plt.tight_layout()
    plt.savefig('weekly_mood_analysis.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    print("\\n✓ Visualization saved as 'weekly_mood_analysis.png'")

def print_analysis_summary(weekly_data, cluster_labels, anomaly_labels):
    """
    Print summary statistics and insights.
    
    Args:
        weekly_data (pd.DataFrame): Weekly aggregated data
        cluster_labels (np.ndarray): KMeans cluster labels
        anomaly_labels (np.ndarray): DBSCAN anomaly labels
    """
    print("\\n" + "="*60)
    print("WEEKLY MOOD ANALYSIS SUMMARY")
    print("="*60)
    
    print(f"\\nTotal weeks analyzed: {len(weekly_data)}")
    print(f"Number of patterns identified: {max(cluster_labels) + 1}")
    print(f"Number of anomalies detected: {sum(anomaly_labels == -1)}")
    
    print("\\n" + "-"*60)
    print("PATTERN BREAKDOWN:")
    print("-"*60)
    
    for cluster in range(max(cluster_labels) + 1):
        mask = cluster_labels == cluster
        cluster_data = weekly_data[mask]
        
        print(f"\\nPattern {cluster + 1}:")
        print(f"  Weeks in pattern: {sum(mask)}")
        print(f"  Avg mood score: {cluster_data['mood_score'].mean():.2f}")
        print(f"  Avg sleep hours: {cluster_data['sleep_hours'].mean():.2f}")
        print(f"  Avg weekly steps: {cluster_data['step_count'].mean():.0f}")
    
    if sum(anomaly_labels == -1) > 0:
        print("\\n" + "-"*60)
        print("ANOMALIES DETECTED:")
        print("-"*60)
        anomaly_data = weekly_data[anomaly_labels == -1]
        print(f"\\nWeeks with unusual patterns: {len(anomaly_data)}")
        print(f"Avg mood score: {anomaly_data['mood_score'].mean():.2f}")
        print(f"Avg sleep hours: {anomaly_data['sleep_hours'].mean():.2f}")
        print(f"Avg weekly steps: {anomaly_data['step_count'].mean():.0f}")
    
    print("\\n" + "="*60)

def main():
    """
    Main execution function for weekly mood analysis.
    """
    print("SafeSpace Weekly Mood Analysis")
    print("="*60)
    
    # Step 1: Load or prepare data
    print("\\n[1/6] Loading data...")
    df = prepare_sample_data()
    print(f"✓ Loaded {len(df)} daily entries")
    
    # Step 2: Aggregate to weekly data
    print("\\n[2/6] Aggregating to weekly summaries...")
    weekly_data = aggregate_weekly_data(df)
    print(f"✓ Created {len(weekly_data)} weekly summaries")
    
    # Step 3: Normalize features
    print("\\n[3/6] Normalizing features...")
    features = ['mood_score', 'sleep_hours', 'step_count']
    normalized_data, scaler = normalize_features(weekly_data, features)
    print("✓ Features normalized using StandardScaler")
    
    # Step 4: Apply KMeans clustering
    print("\\n[4/6] Applying KMeans clustering (k=3)...")
    cluster_labels = apply_kmeans_clustering(normalized_data, n_clusters=3)
    print("✓ Weekly patterns categorized into 3 clusters")
    
    # Step 5: Detect anomalies with DBSCAN
    print("\\n[5/6] Detecting anomalies with DBSCAN...")
    anomaly_labels = detect_anomalies(normalized_data)
    print(f"✓ Anomaly detection complete ({sum(anomaly_labels == -1)} anomalies found)")
    
    # Step 6: Visualize results
    print("\\n[6/6] Creating visualization...")
    visualize_results(weekly_data, cluster_labels, anomaly_labels)
    
    # Print summary
    print_analysis_summary(weekly_data, cluster_labels, anomaly_labels)
    
    print("\\n✓ Analysis complete!")
    print("\\nNext steps:")
    print("  • Review the generated visualization")
    print("  • Examine identified patterns and anomalies")
    print("  • Adjust parameters (eps, min_samples) if needed")
    print("  • Replace sample data with your actual mood tracking data")

if __name__ == "__main__":
    main()
`;

    const blob = new Blob([scriptContent], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weekly_mood_analysis.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isAdminLoading) {
    return (
      <div className="min-h-screen admin-dashboard-bg">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-lavender-600 via-purple-600 to-blush-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Verifying admin access...
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-lavender-200 dark:border-lavender-800">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen admin-dashboard-bg">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-lavender-600 via-purple-600 to-blush-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
          </div>

          <Alert className="border-destructive bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <AlertTitle className="text-destructive text-lg">Admin Access Required</AlertTitle>
            <AlertDescription className="text-destructive/90 mt-2">
              You do not have permission to access the analytics dashboard. This area is restricted to administrators only.
            </AlertDescription>
          </Alert>

          <Card className="bg-gradient-to-br from-lavender-50/80 via-blush-50/80 to-purple-50/80 dark:from-lavender-950/20 dark:via-blush-950/20 dark:to-purple-950/20 border-lavender-200 dark:border-lavender-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lavender-700 dark:text-lavender-300">
                <Shield className="w-5 h-5" />
                About Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                The analytics dashboard provides privacy-friendly insights into app usage patterns, 
                including anonymous session counts and aggregated duration statistics.
              </p>
              <p>
                If you believe you should have access to this area, please contact your system administrator.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={onBack} size="lg" className="bg-gradient-to-r from-lavender-500 via-purple-500 to-blush-500 hover:from-lavender-600 hover:via-purple-600 hover:to-blush-600 text-white shadow-lg">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = analyticsLoading || userRecordsLoading;
  const hasError = analyticsError || userRecordsError;

  const guestUsers = userRecords?.filter(r => r.authType === 'guest') || [];
  const iiUsers = userRecords?.filter(r => r.authType === 'internetIdentity') || [];

  if (selectedUserId) {
    return (
      <div className="min-h-screen admin-dashboard-bg">
        <div className="max-w-7xl mx-auto px-4 py-8 pb-12 space-y-8 animate-in fade-in-50 duration-500">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setSelectedUserId(null)} 
              variant="outline" 
              size="icon" 
              className="shrink-0 border-lavender-300 hover:bg-lavender-100 dark:border-lavender-700 dark:hover:bg-lavender-900/30 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-lavender-600 via-purple-600 to-blush-600 bg-clip-text text-transparent">
                User Details
              </h1>
              <p className="text-muted-foreground mt-1">
                Viewing detailed analytics for {selectedUserId}
              </p>
            </div>
          </div>

          <AdminUserDrilldown userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-dashboard-bg">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-12 space-y-8 animate-in fade-in-50 duration-500">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={onBack} 
              variant="outline" 
              size="icon" 
              className="shrink-0 border-lavender-300 hover:bg-lavender-100 dark:border-lavender-700 dark:hover:bg-lavender-900/30 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="admin-icon-glow">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-lavender-600 via-purple-600 to-blush-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-lavender-500 animate-pulse" />
                  Real-time privacy-friendly insights
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadScript}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-lavender-300 hover:bg-lavender-100 dark:border-lavender-700 dark:hover:bg-lavender-900/30 transition-all duration-300 hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Download Analysis Script
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2 border-lavender-300 hover:bg-lavender-100 dark:border-lavender-700 dark:hover:bg-lavender-900/30 transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <Alert className="border-lavender-300 dark:border-lavender-700 bg-gradient-to-r from-lavender-50/90 to-blush-50/90 dark:from-lavender-950/40 dark:to-blush-950/40 shadow-lg backdrop-blur-sm">
          <Shield className="h-5 w-5 text-lavender-600 dark:text-lavender-400" />
          <AlertTitle className="text-lavender-900 dark:text-lavender-100 font-semibold">Privacy-First Analytics</AlertTitle>
          <AlertDescription className="text-lavender-700 dark:text-lavender-300 mt-1">
            All data is aggregated and anonymized. No personal information or individual user tracking is performed.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-white/70 dark:bg-gray-900/70 border border-lavender-200 dark:border-lavender-800 shadow-md backdrop-blur-sm">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender-500 data-[state=active]:to-blush-500 data-[state=active]:text-white transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender-500 data-[state=active]:to-blush-500 data-[state=active]:text-white transition-all duration-300"
            >
              All Users
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender-500 data-[state=active]:to-blush-500 data-[state=active]:text-white transition-all duration-300"
            >
              Weekly Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-8">
            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse border-lavender-200 dark:border-lavender-800">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-12 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : hasError ? (
              <Card className="border-destructive shadow-lg">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <p className="text-destructive mb-4 text-lg font-medium">
                    {analyticsError instanceof Error && analyticsError.message.includes('Unauthorized') 
                      ? 'Admin access required to view analytics data'
                      : 'Failed to load analytics data. Please try again.'}
                  </p>
                  <Button onClick={handleRefresh} variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : analytics ? (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="admin-metric-card admin-card-blue">
                    <div className="admin-card-glow admin-glow-blue"></div>
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">Total Sessions</CardTitle>
                        <div className="admin-icon-badge admin-badge-blue">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <CardDescription className="text-blue-700 dark:text-blue-300">
                        Anonymous user sessions tracked
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 admin-metric-number">
                        {analytics.totalSessions.toString()}
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        Unique anonymous sessions
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="admin-metric-card admin-card-purple">
                    <div className="admin-card-glow admin-glow-purple"></div>
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg font-semibold text-purple-900 dark:text-purple-100">Total Time</CardTitle>
                        <div className="admin-icon-badge admin-badge-purple">
                          <Clock className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <CardDescription className="text-purple-700 dark:text-purple-300">
                        Cumulative session duration
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 admin-metric-number">
                        {formatDuration(analytics.totalSessionDuration)}
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Total time across all sessions
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="admin-metric-card admin-card-indigo">
                    <div className="admin-card-glow admin-glow-indigo"></div>
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">Average Duration</CardTitle>
                        <div className="admin-icon-badge admin-badge-indigo">
                          <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <CardDescription className="text-indigo-700 dark:text-indigo-300">
                        Mean session length
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 admin-metric-number">
                        {formatDuration(analytics.averageSessionDuration)}
                      </div>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Average time per session
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md overflow-hidden admin-chart-card">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="admin-icon-glow">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Session Analytics Overview</CardTitle>
                        <CardDescription>Visual representation of usage patterns</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            Total Sessions
                          </span>
                          <span className="font-bold text-blue-600 text-lg">{analytics.totalSessions.toString()}</span>
                        </div>
                        <div className="admin-bar-container">
                          <div className="admin-bar admin-bar-blue" style={{ width: '100%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500" />
                            Total Duration
                          </span>
                          <span className="font-bold text-purple-600 text-lg">{formatDuration(analytics.totalSessionDuration)}</span>
                        </div>
                        <div className="admin-bar-container">
                          <div className="admin-bar admin-bar-purple" style={{ width: '90%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                            Average Duration
                          </span>
                          <span className="font-bold text-indigo-600 text-lg">{formatDuration(analytics.averageSessionDuration)}</span>
                        </div>
                        <div className="admin-bar-container">
                          <div className="admin-bar admin-bar-indigo" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-8">
            <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="admin-icon-badge admin-badge-blue">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">All Users</CardTitle>
                      <CardDescription>
                        {userRecords ? `${userRecords.length} total users (${guestUsers.length} guests, ${iiUsers.length} Internet Identity)` : 'Loading user data...'}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {userRecordsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : userRecordsError ? (
                  <Alert className="border-destructive bg-destructive/10">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <AlertTitle className="text-destructive">Failed to load user data</AlertTitle>
                    <AlertDescription className="text-destructive/90">
                      {userRecordsError instanceof Error ? userRecordsError.message : 'An error occurred'}
                    </AlertDescription>
                  </Alert>
                ) : userRecords && userRecords.length > 0 ? (
                  <div className="space-y-3">
                    {userRecords.map((user, index) => (
                      <Card 
                        key={index} 
                        className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 shadow-md hover:shadow-lg transition-all duration-300 admin-user-card cursor-pointer"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-purple-900 dark:text-purple-100">{user.id}</span>
                                <Badge variant={user.authType === 'guest' ? 'secondary' : 'default'}>
                                  {user.authType === 'guest' ? 'Guest' : 'Internet Identity'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {user.moodEntries.length} moods
                                </span>
                                <span className="flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  {user.activityLog.length} activities
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Avg: {user.weeklyAverageMood.toFixed(1)}/10
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert className="border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50/90 to-cyan-50/90 dark:from-blue-950/40 dark:to-cyan-950/40">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-900 dark:text-blue-100">No Users Yet</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                      No users have been recorded yet. Users will appear here once they start using the app.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 mt-8">
            <WeeklyMoodInsights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
