import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { UserProfile } from '../types/backend-extended';

interface HeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null | undefined;
  onLogout: () => void;
  onLogin: () => void;
  onNavigate: (page: 'dashboard' | 'mood-tracker' | 'mood-history' | 'chat-room' | 'private-chat' | 'ai-chat' | 'weekly-insights' | 'analytics' | 'app-market' | 'presentation') => void;
  currentPage: string;
}

export default function Header({ isAuthenticated, isAdmin, userProfile, onLogout, onLogin, onNavigate, currentPage }: HeaderProps) {
  const profession = userProfile?.profession;

  const NavLinks = () => (
    <>
      <Button
        variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
        onClick={() => onNavigate('dashboard')}
      >
        Dashboard
      </Button>
      <Button
        variant={currentPage === 'mood-tracker' ? 'default' : 'ghost'}
        onClick={() => onNavigate('mood-tracker')}
      >
        Mood Tracker
      </Button>
      <Button
        variant={currentPage === 'mood-history' ? 'default' : 'ghost'}
        onClick={() => onNavigate('mood-history')}
      >
        Mood History
      </Button>
      <Button
        variant={currentPage === 'chat-room' ? 'default' : 'ghost'}
        onClick={() => onNavigate('chat-room')}
      >
        Group Chat
      </Button>
      <Button
        variant={currentPage === 'private-chat' ? 'default' : 'ghost'}
        onClick={() => onNavigate('private-chat')}
      >
        Private Chat
      </Button>
      <Button
        variant={currentPage === 'ai-chat' ? 'default' : 'ghost'}
        onClick={() => onNavigate('ai-chat')}
      >
        AI Companion
      </Button>
      <Button
        variant={currentPage === 'weekly-insights' ? 'default' : 'ghost'}
        onClick={() => onNavigate('weekly-insights')}
      >
        Weekly Insights
      </Button>
      {isAdmin && (
        <>
          <Button
            variant={currentPage === 'analytics' ? 'default' : 'ghost'}
            onClick={() => onNavigate('analytics')}
          >
            Analytics Dashboard
          </Button>
          <Button
            variant={currentPage === 'app-market' ? 'default' : 'ghost'}
            onClick={() => onNavigate('app-market')}
          >
            App Market
          </Button>
          <Button
            variant={currentPage === 'presentation' ? 'default' : 'ghost'}
            onClick={() => onNavigate('presentation')}
          >
            Presentation
          </Button>
        </>
      )}
    </>
  );

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-lavender-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender-500 to-blush-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold text-lavender-900">SafeSpace</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated && userProfile && (
              <div className="hidden md:flex flex-col items-end text-sm">
                <span className="font-medium text-lavender-900">{userProfile.name}</span>
                {profession && <span className="text-lavender-600">{String(profession)}</span>}
                {isAdmin && <span className="text-xs text-amber-600 font-semibold">👑 Admin</span>}
              </div>
            )}
            {isAuthenticated ? (
              <Button onClick={onLogout} variant="outline">
                Logout
              </Button>
            ) : (
              <Button onClick={onLogin}>
                Login
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
