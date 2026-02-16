import { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import { useGuestAuth } from './hooks/useGuestAuth';
import { useActivityLogging } from './hooks/useActivityLogging';
import { useSessionTracking } from './hooks/useSessionTracking';
import { useAdminBootstrap } from './hooks/useAdminBootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import MoodTracker from './components/MoodTracker';
import MoodHistory from './components/MoodHistory';
import ChatRoom from './components/ChatRoom';
import PrivateChat from './components/PrivateChat';
import AIChat from './components/AIChat';
import AnonymousLogin from './components/AnonymousLogin';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AppMarketSettings from './components/AppMarketSettings';
import PresentationViewer from './components/PresentationViewer';
import WeeklyMoodInsights from './components/WeeklyMoodInsights';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

type Page = 'dashboard' | 'mood-tracker' | 'mood-history' | 'chat-room' | 'private-chat' | 'ai-chat' | 'weekly-insights' | 'analytics' | 'app-market' | 'presentation';

export default function App() {
  const { identity, isInitializing: identityInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { guestId, isGuest: guestIsGuest } = useGuestAuth();
  const { logPageNavigation } = useActivityLogging();
  const { isAdmin } = useAdminBootstrap();

  useSessionTracking();

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileProfession, setProfileProfession] = useState('');

  const isAuthenticated = !!identity;
  const isGuest = !isAuthenticated && guestIsGuest;

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    if (isAuthenticated && !!actor && profileFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [isAuthenticated, actor, profileFetched, userProfile]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    logPageNavigation(page, guestId);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) return;

    try {
      await saveProfile.mutateAsync({
        userId: identity!.getPrincipal().toString(),
        name: profileName.trim(),
        profession: profileProfession.trim() || undefined,
      });
      setShowProfileSetup(false);
      setProfileName('');
      setProfileProfession('');
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const isLoading = identityInitializing || actorFetching || !actor;

  if (isLoading) {
    return (
      <div className="aurora-bg min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-safespace-primary" />
          <p className="text-white text-lg font-medium">Loading SafeSpace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return <AnonymousLogin />;
  }

  const profileSetupLoading = isAuthenticated && (profileLoading || !profileFetched);

  return (
    <div className="aurora-bg min-h-screen flex flex-col">
      {isAuthenticated && <Header currentPage={currentPage} onNavigate={handleNavigate} isAdmin={isAdmin || false} />}
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} guestId={guestId} />}
        {currentPage === 'mood-tracker' && <MoodTracker onBack={() => handleNavigate('dashboard')} guestId={guestId} />}
        {currentPage === 'mood-history' && <MoodHistory onBack={() => handleNavigate('dashboard')} guestId={guestId} />}
        {currentPage === 'chat-room' && <ChatRoom onBack={() => handleNavigate('dashboard')} userProfile={userProfile} />}
        {currentPage === 'private-chat' && <PrivateChat onBack={() => handleNavigate('dashboard')} userProfile={userProfile} />}
        {currentPage === 'ai-chat' && <AIChat onBack={() => handleNavigate('dashboard')} />}
        {currentPage === 'weekly-insights' && <WeeklyMoodInsights onBack={() => handleNavigate('dashboard')} guestId={guestId} />}
        {currentPage === 'analytics' && <AnalyticsDashboard onBack={() => handleNavigate('dashboard')} isAdmin={isAdmin || false} />}
        {currentPage === 'app-market' && <AppMarketSettings onBack={() => handleNavigate('dashboard')} isAdmin={isAdmin || false} />}
        {currentPage === 'presentation' && <PresentationViewer onBack={() => handleNavigate('dashboard')} isAdmin={isAdmin || false} />}
      </main>

      <Footer />

      <Dialog open={showProfileSetup && !profileSetupLoading} onOpenChange={setShowProfileSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to SafeSpace</DialogTitle>
            <DialogDescription>
              Please tell us your name to personalize your experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && profileName.trim()) {
                    handleSaveProfile();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession (optional)</Label>
              <Input
                id="profession"
                placeholder="e.g., Student, Teacher, Engineer"
                value={profileProfession}
                onChange={(e) => setProfileProfession(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && profileName.trim()) {
                    handleSaveProfile();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveProfile}
              disabled={!profileName.trim() || saveProfile.isPending}
              className="w-full"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
