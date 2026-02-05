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
  const [showLogin, setShowLogin] = useState(true);

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { logPageNavigation } = useActivityLogging();

  const isAuthenticated = !!identity;

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
      setShowLogin(false);
    }
  }, [isGuest, guestSession, guestId]);

  // Handle Internet Identity authentication
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      console.log('Authenticated user with profile:', userProfile.userId);
      setUserId(userProfile.userId);
      setProfession(userProfile.profession || '');
      setShowLogin(false);
    } else if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      console.log('Authenticated user without profile - showing login for profile setup');
      setShowLogin(true);
    } else if (!isAuthenticated && !isGuest && !isInitializing) {
      console.log('No authentication - showing login');
      setShowLogin(true);
    }
  }, [isAuthenticated, userProfile, profileLoading, isInitializing, isFetched, isGuest]);

  const handleProfileSetup = (name: string, prof: string | null) => {
    console.log('Profile setup completed:', { name, profession: prof });
    setUserId(name);
    setProfession(prof || '');
    setShowLogin(false);
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
      setShowLogin(true);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (view: View, roomId?: string) => {
    setCurrentView(view);
    if (roomId) {
      setCurrentRoomId(roomId);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
        <div className="text-center space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-lavender-500 via-blush-500 to-lavender-600 flex items-center justify-center shadow-lg animate-pulse">
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-lavender-600 dark:text-lavender-400" />
              <p className="text-lg font-medium text-lavender-700 dark:text-lavender-300">
                Initializing SafeSpace...
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Setting up secure connection
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
        <AnonymousLogin onLogin={handleProfileSetup} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 animate-in fade-in-50 duration-500">
      <Header 
        userId={userId} 
        profession={profession} 
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        isAdmin={isAdmin || false}
      />
      <main className="flex-1 container mx-auto px-4 py-8 transition-all duration-300">
        {currentView === 'dashboard' && (
          <Dashboard userId={userId} onNavigate={handleNavigate} />
        )}
        {currentView === 'mood' && (
          <MoodTracker userId={userId} onBack={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'history' && (
          <MoodHistory userId={userId} onBack={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'chat' && currentRoomId && (
          <ChatRoom userId={userId} roomId={currentRoomId} onBack={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'privateChat' && currentRoomId && (
          <PrivateChat threadId={currentRoomId} onBack={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'aiChat' && (
          <AIChat userId={userId} onBack={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'analytics' && (
          <AnalyticsDashboard onBack={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'appMarket' && (
          <AppMarketSettings onBack={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'presentation' && (
          <PresentationViewer onBack={() => setCurrentView('dashboard')} />
        )}
      </main>
      <Footer />
      <Toaster />
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
