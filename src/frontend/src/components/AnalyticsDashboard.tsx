import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Clock, TrendingUp, Shield, AlertCircle, RefreshCw, Activity, BarChart3, Heart, Sparkles, Download, ChevronRight } from 'lucide-react';
import { useGetAggregatedAnalytics, useIsCallerAdmin, useGetUserRecords } from '../hooks/useQueries';
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
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useGetAggregatedAnalytics();
  const { data: userRecords, isLoading: userRecordsLoading, error: userRecordsError, refetch: refetchUserRecords } = useGetUserRecords();
  
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
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-lavender-600 via-purple-600 to-blush-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin-only insights and metrics
              </p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            className="border-lavender-300 hover:bg-lavender-100 dark:border-lavender-700 dark:hover:bg-lavender-900/30"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {hasError && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error Loading Analytics</AlertTitle>
            <AlertDescription>
              {analyticsError instanceof Error ? analyticsError.message : 'Failed to load analytics data'}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-lavender-100 via-purple-100 to-blush-100 dark:from-lavender-950/50 dark:via-purple-950/50 dark:to-blush-950/50">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Sparkles className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 bg-gradient-to-br from-lavender-100/80 via-purple-100/80 to-blush-100/80 dark:from-lavender-950/30 dark:via-purple-950/30 dark:to-blush-950/30 shadow-xl backdrop-blur-sm admin-metric-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-lavender-700 dark:text-lavender-300">
                    <Users className="w-4 h-4" />
                    Total Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-10 w-24" />
                  ) : (
                    <div className="text-3xl font-bold bg-gradient-to-r from-lavender-600 to-purple-600 bg-clip-text text-transparent">
                      {analytics ? Number(analytics.totalSessions) : 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-blush-100/80 via-purple-100/80 to-lavender-100/80 dark:from-blush-950/30 dark:via-purple-950/30 dark:to-lavender-950/30 shadow-xl backdrop-blur-sm admin-metric-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-blush-700 dark:text-blush-300">
                    <Clock className="w-4 h-4" />
                    Total Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-10 w-24" />
                  ) : (
                    <div className="text-3xl font-bold bg-gradient-to-r from-blush-600 to-purple-600 bg-clip-text text-transparent">
                      {analytics ? formatDuration(analytics.totalSessionDuration) : '0s'}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-purple-100/80 via-blush-100/80 to-lavender-100/80 dark:from-purple-950/30 dark:via-blush-950/30 dark:to-lavender-950/30 shadow-xl backdrop-blur-sm admin-metric-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
                    <TrendingUp className="w-4 h-4" />
                    Avg Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-10 w-24" />
                  ) : (
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-lavender-600 bg-clip-text text-transparent">
                      {analytics ? formatDuration(analytics.averageSessionDuration) : '0s'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-lavender-600" />
                    User Distribution
                  </CardTitle>
                  <CardDescription>Breakdown by authentication type</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-lavender-50 to-purple-50 dark:from-lavender-950/30 dark:to-purple-950/30">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-lavender-500 to-purple-500" />
                          <span className="font-medium">Internet Identity</span>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {iiUsers.length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blush-50 to-pink-50 dark:from-blush-950/30 dark:to-pink-950/30">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blush-500 to-pink-500" />
                          <span className="font-medium">Guest Users</span>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {guestUsers.length}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-blush-600" />
                    Mood Tracking Stats
                  </CardTitle>
                  <CardDescription>Total mood entries recorded</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold bg-gradient-to-r from-blush-600 via-purple-600 to-lavender-600 bg-clip-text text-transparent mb-2">
                          {userRecords?.reduce((sum, user) => sum + user.moodEntries.length, 0) || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Mood Entries</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-6">
            <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-lavender-600" />
                  User Records
                </CardTitle>
                <CardDescription>
                  {userRecords?.length || 0} total users ({iiUsers.length} authenticated, {guestUsers.length} guests)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : userRecords && userRecords.length > 0 ? (
                  <div className="space-y-2">
                    {userRecords.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className="w-full text-left p-4 rounded-lg bg-gradient-to-r from-lavender-50/50 to-blush-50/50 dark:from-lavender-950/20 dark:to-blush-950/20 border border-lavender-100 dark:border-lavender-900 hover:border-lavender-300 dark:hover:border-lavender-700 transition-all duration-200 hover:shadow-md group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Heart className="w-5 h-5 text-lavender-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.id}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant={user.authType === 'guest' ? 'secondary' : 'default'} className="text-xs">
                                  {user.authType === 'guest' ? 'Guest' : 'II'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {user.moodEntries.length} {user.moodEntries.length === 1 ? 'entry' : 'entries'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Avg: {user.weeklyAverageMood.toFixed(1)}/10
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-lavender-600 transition-colors shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No user records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 mt-6">
            <Card className="border-0 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Weekly Mood Insights
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Advanced pattern analysis using machine learning
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleDownloadScript}
                    variant="outline"
                    size="sm"
                    className="border-purple-300 hover:bg-purple-100 dark:border-purple-700 dark:hover:bg-purple-900/30"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Script
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <WeeklyMoodInsights />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
