import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Clock, TrendingUp, Shield, AlertCircle, RefreshCw, Activity, BarChart3, Heart, Sparkles, Download, ChevronRight, User } from 'lucide-react';
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
  }, [analytics]);

  useEffect(() => {
    if (userRecords) {
      console.log('Admin Dashboard - User Records:', userRecords);
    }
  }, [userRecords]);

  const handleRefresh = () => {
    refetchAdmin();
    refetchAnalytics();
    refetchUserRecords();
  };

  if (selectedUserId) {
    return (
      <AdminUserDrilldown
        userId={selectedUserId}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  if (isAdminLoading || analyticsLoading || userRecordsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-lavender-200/50 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (adminError || analyticsError || userRecordsError) {
    const error = adminError || analyticsError || userRecordsError;
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <Button onClick={onBack} variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Analytics</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load analytics data. Please try again.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Button onClick={onBack} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to view this page. Admin access is required.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const totalUsers = userRecords?.length || 0;
  const guestUsers = userRecords?.filter(u => u.authType === 'guest').length || 0;
  const internetIdentityUsers = userRecords?.filter(u => u.authType === 'internetIdentity').length || 0;
  const totalMoodEntries = userRecords?.reduce((sum, u) => sum + u.moodEntries.length, 0) || 0;
  const averageWeeklyMood = userRecords && userRecords.length > 0
    ? userRecords.reduce((sum, u) => sum + u.weeklyAverageMood, 0) / userRecords.length
    : 0;

  const formatDuration = (nanoseconds: bigint) => {
    const seconds = Number(nanoseconds) / 1_000_000_000;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimestamp = (timestamp: bigint | undefined) => {
    if (!timestamp) return 'Never';
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-lavender-600" />
              <h1 className="text-3xl font-bold text-lavender-900">Analytics Dashboard</h1>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-lavender-200/50 bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-lavender-700">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-lavender-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-lavender-900">{totalUsers}</div>
                  <p className="text-xs text-lavender-600">
                    {guestUsers} guests, {internetIdentityUsers} II users
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blush-200/50 bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blush-700">Total Sessions</CardTitle>
                  <Clock className="h-4 w-4 text-blush-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blush-900">{analytics?.totalSessions.toString() || '0'}</div>
                  <p className="text-xs text-blush-600">
                    Avg: {analytics ? formatDuration(analytics.averageSessionDuration) : '0h 0m'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-sky-200/50 bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-sky-700">Mood Entries</CardTitle>
                  <Heart className="h-4 w-4 text-sky-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-sky-900">{totalMoodEntries}</div>
                  <p className="text-xs text-sky-600">
                    Avg: {totalUsers > 0 ? (totalMoodEntries / totalUsers).toFixed(1) : '0'} per user
                  </p>
                </CardContent>
              </Card>

              <Card className="border-lavender-200/50 bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-lavender-700">Weekly Avg Mood</CardTitle>
                  <TrendingUp className="h-4 w-4 text-lavender-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-lavender-900">{averageWeeklyMood.toFixed(1)}</div>
                  <p className="text-xs text-lavender-600">Out of 10</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-lavender-200/50 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lavender-900">
                  <Users className="h-5 w-5" />
                  User List
                </CardTitle>
                <CardDescription>Click on a user to view detailed analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userRecords && userRecords.length > 0 ? (
                    userRecords.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className="flex w-full items-center justify-between rounded-lg border border-lavender-200/50 bg-white/50 p-4 text-left transition-all hover:border-lavender-300 hover:bg-lavender-50/50 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lavender-100">
                            <User className="h-5 w-5 text-lavender-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-lavender-900">{user.id}</p>
                              <Badge variant={user.authType === 'guest' ? 'secondary' : 'default'} className="text-xs">
                                {user.authType === 'guest' ? 'Guest' : 'II'}
                              </Badge>
                            </div>
                            <p className="text-sm text-lavender-600">
                              {user.moodEntries.length} mood entries • Weekly avg: {user.weeklyAverageMood.toFixed(1)}
                            </p>
                            <p className="text-xs text-lavender-500">
                              Last activity: {formatTimestamp(user.activityLog[user.activityLog.length - 1]?.timestamp)}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-lavender-400" />
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center text-lavender-600">
                      <Users className="mx-auto mb-2 h-12 w-12 text-lavender-300" />
                      <p>No users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <WeeklyMoodInsights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
