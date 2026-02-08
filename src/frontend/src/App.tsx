import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import AnonymousLogin from './components/AnonymousLogin';
import Dashboard from './components/Dashboard';
import MoodTracker from './components/MoodTracker';
import MoodHistory from './components/MoodHistory';
import ChatRoom from './components/ChatRoom';
import PrivateChat from './components/PrivateChat';
import AIChat from './components/AIChat';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AppMarketSettings from './components/AppMarketSettings';
import PresentationViewer from './components/PresentationViewer';
import Header from './components/Header';
import Footer from './components/Footer';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGuestAuth } from './hooks/useGuestAuth';
import { useGetCallerUserProfile, useIsCallerAdmin } from './hooks/useQueries';
import { useSessionTracking } from './hooks/useSessionTracking';
import { useActivityLogging } from './hooks/useActivityLogging';
import { Loader2, Heart } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 500,
    },
    mutations: {
      retry: 1,
      retryDelay: 500,
    },
  },
});

export type View = 'dashboard' | 'mood' | 'history' | 'chat' | 'privateChat' | 'aiChat' | 'analytics' | 'appMarket' | 'presentation';

function AppContent() {
  const { identity, isInitializing, clear: clearIdentity } = useInternetIdentity();
  const { guestSession, isGuest, clearGuestSession, guestId } = useGuestAuth();
  const [userId, setUserId] = useState<string>('');
  const [profession, setProfession] = useState<string>('');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [currentThreadId, setCurrentThreadId] = useState<string>('');

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { logPageNavigation } = useActivityLogging();

  const isAuthenticated = !!identity;

  // Derive whether to show login from auth sources
  const showLogin = !isGuest && !isAuthenticated && !isInitializing;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Track session duration for analytics
  useSessionTracking(userId || null);

  // Log admin status for debugging
  useEffect(() => {
    if (!isAdminLoading) {
      console.log('App - Admin status:', isAdmin);
    }
  }, [isAdmin, isAdminLoading]);

  // Handle guest session
  useEffect(() => {
    if (isGuest && guestSession) {
      console.log('Guest session active:', guestSession.userId, 'guestId:', guestId);
      setUserId(guestSession.userId);
      setProfession(guestSession.profession || '');
    }
  }, [isGuest, guestSession, guestId]);

  // Handle Internet Identity authentication
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      console.log('Authenticated user with profile:', userProfile);
      setUserId(userProfile.name);
      setProfession(userProfile.profession || '');
    }
  }, [isAuthenticated, userProfile]);

  const handleProfileSetup = (name: string, prof: string | null) => {
    console.log('Profile setup completed:', { name, profession: prof });
    setUserId(name);
    setProfession(prof || '');
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    try {
      if (isGuest) {
        clearGuestSession();
      } else {
        await clearIdentity();
      }
      queryClient.clear();
      setUserId('');
      setProfession('');
      setCurrentView('dashboard');
      setCurrentRoomId('');
      setCurrentThreadId('');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (view: View, roomId?: string) => {
    setCurrentView(view);
    if (roomId) {
      if (view === 'chat') {
        setCurrentRoomId(roomId);
      } else if (view === 'privateChat') {
        setCurrentThreadId(roomId);
      }
    }

    // Log page navigation
    const viewNames: Record<View, string> = {
      dashboard: 'Dashboard',
      mood: 'Mood Tracker',
      history: 'Mood History',
      chat: 'Group Chat',
      privateChat: 'Private Chat',
      aiChat: 'AI Companion',
      analytics: 'Admin Analytics',
      appMarket: 'App Market',
      presentation: 'Presentation',
    };
    logPageNavigation(viewNames[view]);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="relative">
            <Heart className="w-16 h-16 text-purple-600 dark:text-purple-400 animate-pulse mx-auto" fill="currentColor" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Initializing SafeSpace...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Creating your safe space
          </p>
        </div>
      </div>
    );
  }

  if (showLogin || showProfileSetup) {
    return (
      <QueryClientProvider client={queryClient}>
        <AnonymousLogin onLogin={handleProfileSetup} />
        <Toaster position="top-right" />
      </QueryClientProvider>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <Header
        userId={userId}
        profession={profession}
        isAdmin={isAdmin || false}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentView={currentView}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        {currentView === 'dashboard' && <Dashboard userId={userId} onNavigate={handleNavigate} />}
        {currentView === 'mood' && <MoodTracker userId={userId} onBack={() => handleNavigate('dashboard')} />}
        {currentView === 'history' && <MoodHistory userId={userId} onBack={() => handleNavigate('dashboard')} />}
        {currentView === 'chat' && <ChatRoom roomId={currentRoomId} userId={userId} onBack={() => handleNavigate('dashboard')} />}
        {currentView === 'privateChat' && <PrivateChat threadId={currentThreadId} onBack={() => handleNavigate('dashboard')} />}
        {currentView === 'aiChat' && <AIChat userId={userId} onBack={() => handleNavigate('dashboard')} />}
        {currentView === 'analytics' && isAdmin && <AnalyticsDashboard onBack={() => handleNavigate('dashboard')} />}
        {currentView === 'appMarket' && isAdmin && <AppMarketSettings onBack={() => handleNavigate('dashboard')} />}
        {currentView === 'presentation' && isAdmin && <PresentationViewer onBack={() => handleNavigate('dashboard')} />}
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
