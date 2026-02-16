import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, Home, Sparkles, Smile, Clock, User, Bot, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import BrandLogo from './BrandLogo';
import { getUserInitials } from '../lib/avatar';

type Page = 'dashboard' | 'mood-tracker' | 'mood-history' | 'chat-room' | 'private-chat' | 'ai-chat' | 'weekly-insights' | 'analytics' | 'app-market' | 'presentation';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
}

export default function Header({ currentPage, onNavigate, isAdmin }: HeaderProps) {
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const userInitials = getUserInitials(userProfile?.name);

  return (
    <header className="header-solid-white sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <BrandLogo size="small" showWordmark={true} />
          </div>

          {/* Center: Desktop Navigation (visual placeholders only) */}
          <nav className="hidden md:flex items-center gap-1">
            <button className="nav-pill-home">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button className="nav-item-placeholder">
              <Sparkles className="w-4 h-4" />
              <span>AI Companion</span>
            </button>
            <button className="nav-item-placeholder">
              <Smile className="w-4 h-4" />
              <span>Mood Tracker</span>
            </button>
            <button className="nav-item-placeholder">
              <Clock className="w-4 h-4" />
              <span>My History</span>
            </button>
          </nav>

          {/* Right: Profile Icons + Logout */}
          <div className="hidden md:flex items-center gap-3">
            <button className="icon-button-purple" aria-label="User profile">
              <User className="w-5 h-5" />
            </button>
            <button className="icon-button-purple" aria-label="AI assistant">
              <Bot className="w-5 h-5" />
            </button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-2 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => handleNavClick('dashboard')}
                  className="justify-start"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleNavClick('ai-chat')}
                  className="justify-start"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Companion
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleNavClick('mood-tracker')}
                  className="justify-start"
                >
                  <Smile className="w-4 h-4 mr-2" />
                  Mood Tracker
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleNavClick('mood-history')}
                  className="justify-start"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  My History
                </Button>
                <div className="my-2 border-t" />
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
