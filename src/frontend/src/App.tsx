import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
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
import { Loader2 } from 'lucide-react';

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

  // Update userId and profession when profile changes
  useEffect(() => {
    if (userProfile) {
      setUserId(userProfile.userId);
      setProfession(userProfile.profession || '');
    }
  }, [userProfile]);

  // Handle logout
  const handleLogout = async () => {
    if (isGuest) {
      clearGuestSession();
    } else {
      await clearIdentity();
      queryClient.clear();
    }
    setUserId('');
    setProfession('');
    setCurrentView('dashboard');
  };

  // Handle login completion
  const handleLoginComplete = (newUserId: string, newProfession: string | null) => {
    setUserId(newUserId);
    setProfession(newProfession || '');
  };

  // Handle navigation
  const handleNavigate = (view: View, roomId?: string, threadId?: string) => {
    setCurrentView(view);
    if (roomId) setCurrentRoomId(roomId);
    if (threadId) setCurrentThreadId(threadId);
    logPageNavigation(view);
  };

  // Show login screen
  if (showLogin) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50">
        <Header
          userId=""
          profession={null}
          currentView={currentView}
          isAdmin={false}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <AnonymousLogin onLogin={handleLoginComplete} />
        </main>
        <Footer />
      </div>
    );
  }

  // Show loading while initializing
  if (isInitializing || (isAuthenticated && profileLoading && !isFetched)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-lavender-600 mx-auto" />
          <p className="text-lavender-700 font-medium">Loading SafeSpace...</p>
        </div>
      </div>
    );
  }

  // Show profile setup for authenticated users without profile
  if (showProfileSetup) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50">
        <Header
          userId=""
          profession={null}
          currentView={currentView}
          isAdmin={false}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <AnonymousLogin onLogin={handleLoginComplete} />
        </main>
        <Footer />
      </div>
    );
  }

  // Render main application
  const renderView = () => {
    switch (currentView) {
      case 'mood':
        return <MoodTracker onBack={() => handleNavigate('dashboard')} />;
      case 'history':
        return <MoodHistory onBack={() => handleNavigate('dashboard')} />;
      case 'chat':
        return <ChatRoom userId={userId} roomId={currentRoomId} onBack={() => handleNavigate('dashboard')} />;
      case 'privateChat':
        return <PrivateChat threadId={currentThreadId} onBack={() => handleNavigate('dashboard')} />;
      case 'aiChat':
        return <AIChat userId={userId} onBack={() => handleNavigate('dashboard')} />;
      case 'analytics':
        return <AnalyticsDashboard onBack={() => handleNavigate('dashboard')} />;
      case 'appMarket':
        return <AppMarketSettings onBack={() => handleNavigate('dashboard')} />;
      case 'presentation':
        return <PresentationViewer onBack={() => handleNavigate('dashboard')} />;
      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
            userId={userId}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50">
      <Header
        userId={userId}
        profession={profession || null}
        currentView={currentView}
        isAdmin={isAdmin || false}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
