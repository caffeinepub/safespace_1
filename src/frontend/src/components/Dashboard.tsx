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
        <h1 className="text-3xl font-bold text-pink-800">Welcome to SafeSpace</h1>
        <p className="text-pink-600">Your emotional well-being companion</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-pink-200 bg-white">
          <CardHeader className="pb-3" onClick={() => onNavigate('mood-tracker')}>
            <Heart className="w-8 h-8 text-pink-500 mb-2" />
            <CardTitle className="text-lg text-pink-800">Track Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-pink-600">Record how you're feeling</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-purple-200 bg-white">
          <CardHeader className="pb-3" onClick={() => onNavigate('chat-room')}>
            <Users className="w-8 h-8 text-purple-500 mb-2" />
            <CardTitle className="text-lg text-purple-800">Group Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-600">Connect with others</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-pink-200 bg-white">
          <CardHeader className="pb-3" onClick={() => onNavigate('private-chat')}>
            <MessageCircle className="w-8 h-8 text-pink-400 mb-2" />
            <CardTitle className="text-lg text-pink-800">Private Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-pink-600">One-on-one conversations</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-purple-200 bg-white">
          <CardHeader className="pb-3" onClick={() => onNavigate('ai-chat')}>
            <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
            <CardTitle className="text-lg text-purple-800">AI Companion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-600">Talk to your AI friend</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Mood Summary */}
      {chartLoading ? (
        <Card className="border-pink-200 bg-white">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
          </CardContent>
        </Card>
      ) : weeklyChart ? (
        <Card className="border-pink-200 bg-white">
          <CardHeader>
            <CardTitle className="text-pink-800">This Week's Mood</CardTitle>
            <CardDescription className="text-pink-600">Average: {weeklyChart.weeklyAverage.toFixed(1)} / 10 - {weeklyChart.averageLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-pink-600">{weeklyChart.weeklyInsight}</p>
            <Button variant="outline" className="mt-4 border-pink-300 text-pink-700 hover:bg-pink-50" onClick={() => onNavigate('weekly-insights')}>
              View Detailed Insights
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Active Chat Rooms */}
      <Card className="border-purple-200 bg-white">
        <CardHeader>
          <CardTitle className="text-purple-800">Active Chat Rooms</CardTitle>
          <CardDescription className="text-purple-600">Join a conversation</CardDescription>
        </CardHeader>
        <CardContent>
          {roomsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : chatRooms && chatRooms.length > 0 ? (
            <div className="space-y-2">
              {chatRooms.slice(0, 5).map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div>
                    <p className="font-medium text-purple-900">{room.name}</p>
                    <p className="text-sm text-purple-600">{room.topic}</p>
                  </div>
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => onNavigate('chat-room')}>
                    Join
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-purple-600">No active chat rooms yet</p>
          )}
        </CardContent>
      </Card>

      {/* Private Threads */}
      <Card className="border-pink-200 bg-white">
        <CardHeader>
          <CardTitle className="text-pink-800">Private Messages</CardTitle>
          <CardDescription className="text-pink-600">Your conversations</CardDescription>
        </CardHeader>
        <CardContent>
          {threadsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
            </div>
          ) : privateThreads && privateThreads.length > 0 ? (
            <div className="space-y-2">
              {privateThreads.slice(0, 5).map((thread) => (
                <div key={thread.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-100">
                  <p className="text-sm text-pink-900">Thread {thread.id.slice(0, 8)}...</p>
                  <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => onNavigate('private-chat')}>
                    Open
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-pink-600">No private messages yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
