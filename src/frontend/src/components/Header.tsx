import { Button } from '@/components/ui/button';
import { Heart, Smile, History, LogOut, Menu, TrendingUp, Store, Presentation, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import type { View } from '../App';

interface HeaderProps {
  userId: string;
  profession: string | null;
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  isAdmin: boolean;
}

export default function Header({ userId, profession, currentView, onNavigate, onLogout, isAdmin }: HeaderProps) {
  const navItems = [
    { view: 'dashboard' as View, label: 'Home', icon: Heart },
    { view: 'aiChat' as View, label: 'AI Companion', icon: Sparkles },
    { view: 'mood' as View, label: 'Mood Tracker', icon: Smile },
    { view: 'history' as View, label: 'My History', icon: History },
  ];

  // Add admin-only navigation items
  if (isAdmin) {
    navItems.push({ view: 'analytics' as View, label: 'Analytics', icon: TrendingUp });
    navItems.push({ view: 'appMarket' as View, label: 'App Market', icon: Store });
    navItems.push({ view: 'presentation' as View, label: 'Presentation', icon: Presentation });
  }

  const NavButtons = () => (
    <>
      {navItems.map(({ view, label, icon: Icon }) => (
        <Button
          key={view}
          onClick={() => onNavigate(view)}
          variant={currentView === view ? 'default' : 'ghost'}
          className={`transition-all duration-200 ${currentView === view ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-md' : 'hover:bg-purple-50 dark:hover:bg-purple-950/30'}`}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Button>
      ))}
    </>
  );

  const UserDisplay = ({ className = '' }: { className?: string }) => (
    <div className={`text-sm ${className}`}>
      <span className="text-muted-foreground">{userId}</span>
      {profession && (
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300">
          {profession}
        </span>
      )}
      {isAdmin && (
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 font-semibold">
          Admin
        </span>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <div className="safespace-label-wrapper">
              <span className="safespace-label">
                SafeSpace
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavButtons />
        </nav>

        <div className="flex items-center gap-2">
          <UserDisplay className="hidden sm:block" />
          <Button onClick={onLogout} variant="outline" size="sm" className="hidden md:flex hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-1">Logged in as:</div>
                  <UserDisplay />
                </div>
                <NavButtons />
                <Button onClick={onLogout} variant="outline" className="hover:bg-red-50 dark:hover:bg-red-950/30">
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
