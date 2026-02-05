import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Smile, History, Users, Heart, Calendar, Plus, MessageSquare, Sparkles } from 'lucide-react';
import { useChatRooms, usePrivateThreads } from '../hooks/useQueries';
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
  const { data: chatRooms, isLoading: loadingRooms } = useChatRooms();
  const { data: privateThreads, isLoading: loadingThreads } = usePrivateThreads();
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
            <CardTitle>View History</CardTitle>
            <CardDescription>
              Reflect on your emotional journey and patterns
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-indigo-300 dark:hover:border-indigo-700">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center mb-2">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <CardTitle>Anonymous & Safe</CardTitle>
            <CardDescription>
              Your privacy is protected. Share freely without judgment
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Community Interaction Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Community Connection
          </h2>
          <p className="text-muted-foreground">
            Connect with others through supportive conversations
          </p>
        </div>

        {/* Private Conversations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-pink-600" />
              <h3 className="text-xl font-bold">Private Conversations</h3>
            </div>
            <Button
              onClick={() => setShowPrivateChatDialog(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start Private Chat
            </Button>
          </div>
          
          {loadingThreads ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : privateThreads && privateThreads.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {privateThreads.map((threadId) => {
                return (
                  <Card key={threadId} className="hover:shadow-lg transition-shadow border-2 hover:border-pink-300 dark:hover:border-pink-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-pink-600" />
                        Private Chat
                      </CardTitle>
                      <CardDescription className="text-xs truncate">
                        Thread: {threadId.substring(0, 20)}...
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => onNavigate('privateChat', threadId)}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      >
                        Open Chat
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No private conversations yet. Start a supportive one-on-one chat!
                </p>
                <Button
                  onClick={() => setShowPrivateChatDialog(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start Your First Private Chat
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Topic-Based Group Chats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold">Topic-Based Group Chats</h3>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </div>
          
          {loadingRooms ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {chatRooms && chatRooms.length > 0 ? (
                chatRooms.map(([roomId, roomInfo]) => (
                  <Card key={roomId} className="hover:shadow-lg transition-shadow border-2 hover:border-purple-300 dark:hover:border-purple-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                        {roomInfo.name}
                      </CardTitle>
                      <CardDescription>
                        <span className="inline-block px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium mb-2">
                          {roomInfo.topic || 'General Support'}
                        </span>
                        <br />
                        {Number(roomInfo.participantCount)} {Number(roomInfo.participantCount) === 1 ? 'participant' : 'participants'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => onNavigate('chat', roomId)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Join Room
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-2">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      No chat rooms available yet. Be the first to create one!
                    </p>
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Room
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateChatRoomDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      <StartPrivateChatDialog
        open={showPrivateChatDialog}
        onOpenChange={setShowPrivateChatDialog}
      />
    </div>
  );
}
