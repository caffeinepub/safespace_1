import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetChatRooms, useGetMyPrivateThreads, useGetWeeklyMoodChart } from '../hooks/useQueries';
import { Heart, MessageCircle, Users, TrendingUp, Loader2 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: 'dashboard' | 'mood-tracker' | 'mood-history' | 'chat-room' | 'private-chat' | 'ai-chat' | 'weekly-insights' | 'analytics' | 'app-market' | 'presentation') => void;
  guestId?: string;
}

export default function Dashboard({ onNavigate, guestId }: DashboardProps) {
  const { data: chatRooms, isLoading: roomsLoading } = useGetChatRooms();
  const { data: privateThreads, isLoading: threadsLoading } = useGetMyPrivateThreads();
  const { data: weeklyChart, isLoading: chartLoading } = useGetWeeklyMoodChart(guestId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-lavender-900">Welcome to SafeSpace</h1>
        <p className="text-lavender-600">Your emotional well-being companion</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('mood-tracker')}>
          <CardHeader className="pb-3">
            <Heart className="w-8 h-8 text-blush-500 mb-2" />
            <CardTitle className="text-lg">Track Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Record how you're feeling</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('chat-room')}>
          <CardHeader className="pb-3">
            <Users className="w-8 h-8 text-lavender-500 mb-2" />
            <CardTitle className="text-lg">Group Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Connect with others</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('private-chat')}>
          <CardHeader className="pb-3">
            <MessageCircle className="w-8 h-8 text-sky-500 mb-2" />
            <CardTitle className="text-lg">Private Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">One-on-one conversations</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('ai-chat')}>
          <CardHeader className="pb-3">
            <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
            <CardTitle className="text-lg">AI Companion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Talk to your AI friend</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Mood Summary */}
      {chartLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
          </CardContent>
        </Card>
      ) : weeklyChart ? (
        <Card>
          <CardHeader>
            <CardTitle>This Week's Mood</CardTitle>
            <CardDescription>Average: {weeklyChart.weeklyAverage.toFixed(1)} / 10 - {weeklyChart.averageLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{weeklyChart.weeklyInsight}</p>
            <Button variant="outline" className="mt-4" onClick={() => onNavigate('weekly-insights')}>
              View Detailed Insights
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Active Chat Rooms */}
      <Card>
        <CardHeader>
          <CardTitle>Active Chat Rooms</CardTitle>
          <CardDescription>Join a conversation</CardDescription>
        </CardHeader>
        <CardContent>
          {roomsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
            </div>
          ) : chatRooms && chatRooms.length > 0 ? (
            <div className="space-y-2">
              {chatRooms.slice(0, 5).map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 bg-lavender-50 rounded-lg">
                  <div>
                    <p className="font-medium text-lavender-900">{room.name}</p>
                    <p className="text-sm text-lavender-600">{room.topic}</p>
                  </div>
                  <Button size="sm" onClick={() => onNavigate('chat-room')}>
                    Join
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active chat rooms yet</p>
          )}
        </CardContent>
      </Card>

      {/* Private Threads */}
      <Card>
        <CardHeader>
          <CardTitle>Private Messages</CardTitle>
          <CardDescription>Your conversations</CardDescription>
        </CardHeader>
        <CardContent>
          {threadsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
            </div>
          ) : privateThreads && privateThreads.length > 0 ? (
            <div className="space-y-2">
              {privateThreads.slice(0, 5).map((thread) => (
                <div key={thread.id} className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
                  <p className="text-sm text-sky-900">Thread {thread.id.slice(0, 8)}...</p>
                  <Button size="sm" onClick={() => onNavigate('private-chat')}>
                    Open
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No private messages yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
