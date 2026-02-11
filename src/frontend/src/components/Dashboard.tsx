import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Smile, History, Users, Heart, Calendar, Plus, MessageSquare, Sparkles } from 'lucide-react';
import { useGetChatRooms, useGetMyPrivateThreads } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import type { View } from '../App';
import { useState, useEffect } from 'react';
import CreateChatRoomDialog from './CreateChatRoomDialog';
import StartPrivateChatDialog from './StartPrivateChatDialog';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface DashboardProps {
  userId: string;
  onNavigate: (view: View, roomId?: string) => void;
}

export default function Dashboard({ userId, onNavigate }: DashboardProps) {
  const { data: chatRooms, isLoading: loadingRooms } = useGetChatRooms();
  const { data: privateThreads, isLoading: loadingThreads } = useGetMyPrivateThreads();
  const { identity } = useInternetIdentity();
  const [currentDate, setCurrentDate] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPrivateChatDialog, setShowPrivateChatDialog] = useState(false);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };

    // Initial update
    updateDate();
    
    // Calculate time until next midnight
    const scheduleNextUpdate = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();
      
      return setTimeout(() => {
        updateDate();
        // After midnight update, schedule the next one
        const intervalId = setInterval(updateDate, 24 * 60 * 60 * 1000);
        return intervalId;
      }, timeUntilMidnight);
    };

    const midnightTimer = scheduleNextUpdate();
    
    // Also check every minute if the date has changed (backup mechanism)
    const checkInterval = setInterval(() => {
      const now = new Date();
      const expectedDate = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (expectedDate !== currentDate) {
        updateDate();
      }
    }, 60000); // Check every minute

    return () => {
      clearTimeout(midnightTimer);
      clearInterval(checkInterval);
    };
  }, [currentDate]);

  const myPrincipal = identity?.getPrincipal().toString();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* SafeSpace Logo and Title - Main Page */}
      <div className="text-center py-8 px-4">
        <div className="dashboard-logo-title-container">
          <div className="dashboard-logo-container">
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
          </div>
          <h1 className="dashboard-safespace-label">
            SafeSpace
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-2 mt-6">
          Welcome to Your Safe Space
        </p>
        <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto">
          A supportive community where you can share your feelings, track your mood, and connect with others anonymously.
        </p>
      </div>

      {/* Date Display */}
      <div className="text-center py-6 px-4 rounded-2xl bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-blue-50/50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 border border-purple-100/50 dark:border-purple-800/30 shadow-sm">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Calendar className="w-5 h-5 text-purple-500/70" />
          <p className="text-sm font-medium text-purple-600/70 dark:text-purple-400/70 uppercase tracking-wider">
            Today
          </p>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          {currentDate}
        </h2>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300 dark:hover:border-purple-700" onClick={() => onNavigate('aiChat')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <CardTitle>AI Companion</CardTitle>
            <CardDescription>
              Chat with your supportive AI companion anytime
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300 dark:hover:border-blue-700" onClick={() => onNavigate('mood')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mb-2">
              <Smile className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Track Your Mood</CardTitle>
            <CardDescription>
              Log how you're feeling today and add optional notes
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-pink-300 dark:hover:border-pink-700" onClick={() => onNavigate('history')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-2">
              <History className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Mood History</CardTitle>
            <CardDescription>
              View your mood patterns and insights over time
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300 dark:hover:border-green-700" onClick={() => onNavigate('chat')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center mb-2">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Community Chat</CardTitle>
            <CardDescription>
              Join supportive group conversations
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Chat Rooms Section */}
      <Card className="shadow-lg border-2 border-purple-100 dark:border-purple-900">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <div>
                <CardTitle className="text-2xl">Active Chat Rooms</CardTitle>
                <CardDescription className="mt-1">
                  Join a conversation or create your own supportive space
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingRooms ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : chatRooms && chatRooms.length > 0 ? (
            <div className="grid gap-4">
              {chatRooms.map(([roomId, roomInfo]) => (
                <Card
                  key={roomId}
                  className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300 dark:hover:border-purple-700"
                  onClick={() => onNavigate('chat', roomId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{roomInfo.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {roomInfo.topic}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {roomInfo.participantCount.toString()} participants
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">No chat rooms available yet</p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create the First Room
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Private Messages Section */}
      {myPrincipal && (
        <Card className="shadow-lg border-2 border-blue-100 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle className="text-2xl">Private Messages</CardTitle>
                  <CardDescription className="mt-1">
                    One-on-one conversations with other users
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setShowPrivateChatDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingThreads ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : privateThreads && privateThreads.length > 0 ? (
              <div className="grid gap-3">
                {privateThreads.map((threadId) => (
                  <Card
                    key={threadId}
                    className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-300 dark:hover:border-blue-700"
                    onClick={() => onNavigate('privateChat', threadId)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Private Conversation</p>
                            <p className="text-xs text-muted-foreground">{threadId}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MessageCircle className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">No private conversations yet</p>
                <Button
                  onClick={() => setShowPrivateChatDialog(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start a Private Chat
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <CreateChatRoomDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      <StartPrivateChatDialog open={showPrivateChatDialog} onOpenChange={setShowPrivateChatDialog} />
    </div>
  );
}
