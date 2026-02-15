import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StartupTimeoutFallback from './components/StartupTimeoutFallback';
import StartupErrorState from './components/StartupErrorState';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import MoodTracker from './components/MoodTracker';
import MoodHistory from './components/MoodHistory';
import ChatRoom from './components/ChatRoom';
import PrivateChat from './components/PrivateChat';
import AIChat from './components/AIChat';
import WeeklyMoodInsights from './components/WeeklyMoodInsights';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AppMarketSettings from './components/AppMarketSettings';
import PresentationViewer from './components/PresentationViewer';
import AnonymousLogin from './components/AnonymousLogin';
import { useState, useEffect } from 'react';
import { useGuestAuth } from './hooks/useGuestAuth';
import { useActivityLogging } from './hooks/useActivityLogging';
import { useSessionTracking } from './hooks/useSessionTracking';

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

const STARTUP_TIMEOUT_MS = 20000;

type Page = 'dashboard' | 'mood-tracker' | 'mood-history' | 'chat-room' | 'private-chat' | 'ai-chat' | 'weekly-insights' | 'analytics' | 'app-market' | 'presentation';

function AppContent() {
  const { identity, isInitializing, login, clear, loginStatus } = useInternetIdentity();
  const { guestId } = useGuestAuth();
  const { data: isAdmin, isLoading: isAdminLoading, error: adminError, refetch: refetchAdmin } = useIsCallerAdmin();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { logLogin, logPageNavigation } = useActivityLogging();
  
  const [startupTimedOut, setStartupTimedOut] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileProfession, setProfileProfession] = useState('');

  const isAuthenticated = !!identity;
  const isStartupInProgress = isInitializing || (isAuthenticated && isAdminLoading);

  // Session tracking
  useSessionTracking(guestId);

  // Startup watchdog
  useEffect(() => {
    if (!isStartupInProgress) {
      setStartupTimedOut(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      console.warn('Startup timeout exceeded');
      setStartupTimedOut(true);
    }, STARTUP_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [isStartupInProgress]);

  // Profile setup check
  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  // Log login
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      logLogin(guestId);
    }
  }, [isAuthenticated, userProfile, guestId, logLogin]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setCurrentPage('dashboard');
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const handleRetryStartup = () => {
    console.log('Retrying startup...');
    refetchAdmin();
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) return;
    
    try {
      await saveProfile.mutateAsync({
        userId: identity?.getPrincipal().toString() || '',
        name: profileName,
        profession: profileProfession.trim() || null,
      });
      setShowProfileSetup(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    logPageNavigation(page, guestId);
  };

  // Show startup error state
  if (isAuthenticated && adminError && !isAdminLoading) {
    console.error('Startup error:', adminError);
    return <StartupErrorState error={adminError as Error} onRetry={handleRetryStartup} />;
  }

  // Show timeout fallback
  if (startupTimedOut && isStartupInProgress) {
    return <StartupTimeoutFallback />;
  }

  // Show loading
  if (isStartupInProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-lavender-600 mx-auto" />
          <p className="text-lavender-700 font-medium">Loading SafeSpace...</p>
        </div>
      </div>
    );
  }

  // Show anonymous login if not authenticated and not guest
  if (!isAuthenticated && !guestId) {
    return <AnonymousLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50">
      <Header
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin || false}
        userProfile={userProfile}
        onLogout={handleLogout}
        onLogin={handleLogin}
        onNavigate={navigateTo}
        currentPage={currentPage}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        {currentPage === 'dashboard' && <Dashboard onNavigate={navigateTo} guestId={guestId} />}
        {currentPage === 'mood-tracker' && <MoodTracker onBack={() => navigateTo('dashboard')} guestId={guestId} />}
        {currentPage === 'mood-history' && <MoodHistory onBack={() => navigateTo('dashboard')} guestId={guestId} />}
        {currentPage === 'chat-room' && <ChatRoom onBack={() => navigateTo('dashboard')} userProfile={userProfile} />}
        {currentPage === 'private-chat' && <PrivateChat onBack={() => navigateTo('dashboard')} userProfile={userProfile} />}
        {currentPage === 'ai-chat' && <AIChat onBack={() => navigateTo('dashboard')} />}
        {currentPage === 'weekly-insights' && <WeeklyMoodInsights onBack={() => navigateTo('dashboard')} guestId={guestId} />}
        {currentPage === 'analytics' && <AnalyticsDashboard onBack={() => navigateTo('dashboard')} isAdmin={isAdmin || false} />}
        {currentPage === 'app-market' && <AppMarketSettings onBack={() => navigateTo('dashboard')} isAdmin={isAdmin || false} />}
        {currentPage === 'presentation' && <PresentationViewer onBack={() => navigateTo('dashboard')} isAdmin={isAdmin || false} />}
      </main>

      <Footer />

      {/* Profile Setup Dialog */}
      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to SafeSpace</DialogTitle>
            <DialogDescription>
              Please tell us a bit about yourself to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession (optional)</Label>
              <Input
                id="profession"
                value={profileProfession}
                onChange={(e) => setProfileProfession(e.target.value)}
                placeholder="e.g., Student, Teacher, Engineer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveProfile}
              disabled={!profileName.trim() || saveProfile.isPending}
            >
              {saveProfile.isPending ? 'Saving...' : 'Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
