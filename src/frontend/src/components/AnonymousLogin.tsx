import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGuestAuth } from '../hooks/useGuestAuth';
import { useSaveCallerUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { useActivityLogging } from '../hooks/useActivityLogging';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnonymousLoginProps {
  onLogin: (userId: string, profession: string | null) => void;
}

export default function AnonymousLogin({ onLogin }: AnonymousLoginProps) {
  const { login, loginStatus, identity, isInitializing, loginError } = useInternetIdentity();
  const { loginAsGuest } = useGuestAuth();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { logLogin } = useActivityLogging();

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Check if user needs profile setup after authentication
  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched) {
      if (userProfile === null) {
        console.log('✅ User authenticated but no profile found - showing profile setup');
        setShowProfileSetup(true);
        setAuthError(null);
      } else if (userProfile) {
        console.log('✅ User profile found:', userProfile);
        setAuthError(null);
        logLogin('internetIdentity');
        onLogin(userProfile.userId, userProfile.profession || null);
      }
    }
  }, [isAuthenticated, userProfile, profileLoading, isFetched, onLogin, logLogin]);

  // Handle login errors
  useEffect(() => {
    if (loginError) {
      console.error('❌ Login error:', loginError);
      setAuthError(loginError.message || 'Login failed. Please try again.');
      toast.error('Login failed', {
        description: loginError.message || 'Please try again',
      });
    }
  }, [loginError]);

  const handleInternetIdentityLogin = async () => {
    try {
      setAuthError(null);
      console.log('🔐 Starting Internet Identity login...');
      await login();
      console.log('✅ Internet Identity login initiated successfully');
    } catch (error: any) {
      console.error('❌ Internet Identity login error:', error);
      const errorMessage = error.message || 'Failed to connect to Internet Identity';
      setAuthError(errorMessage);
      toast.error('Login failed', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: handleInternetIdentityLogin,
        },
      });
    }
  };

  const handleGuestLogin = () => {
    try {
      setAuthError(null);
      const guestName = `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
      console.log('👤 Creating guest session:', guestName);
      loginAsGuest(guestName, profession || null);
      logLogin('guest');
      toast.success('Welcome!', {
        description: 'You are now logged in as a guest',
      });
      onLogin(guestName, profession || null);
    } catch (error: any) {
      console.error('❌ Guest login error:', error);
      const errorMessage = error.message || 'Failed to create guest session';
      setAuthError(errorMessage);
      toast.error('Guest login failed', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: handleGuestLogin,
        },
      });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      console.log('💾 Saving user profile:', { userId: name.trim(), profession: profession.trim() || null });
      
      await saveProfile.mutateAsync({
        userId: name.trim(),
        profession: profession.trim() || null,
      });

      console.log('✅ Profile saved successfully');
      logLogin('internetIdentity');
      toast.success('Profile created!', {
        description: 'Welcome to SafeSpace',
      });
      
      onLogin(name.trim(), profession.trim() || null);
    } catch (error: any) {
      console.error('❌ Failed to save profile:', error);
      const errorMessage = error.message || 'Failed to save profile. Please try again.';
      setAuthError(errorMessage);
      toast.error('Profile setup failed', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => handleProfileSubmit(e),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="login-container">
        <div className="login-bg-gradient-waves" />
        <div className="login-floating-shape login-floating-shape-1" />
        <div className="login-floating-shape login-floating-shape-2" />
        <div className="login-floating-shape login-floating-shape-3" />
        <div className="login-floating-shape login-floating-shape-4" />
        <div className="login-wellness-glow login-wellness-glow-1" />
        <div className="login-wellness-glow login-wellness-glow-2" />
        <div className="login-wellness-glow login-wellness-glow-3" />
        
        <Card className="login-card w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              <p className="text-lg font-medium text-muted-foreground">
                {isInitializing ? 'Initializing SafeSpace...' : 'Loading your profile...'}
              </p>
              <p className="text-sm text-muted-foreground">
                Please wait a moment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="login-container">
        <div className="login-bg-gradient-waves" />
        <div className="login-floating-shape login-floating-shape-1" />
        <div className="login-floating-shape login-floating-shape-2" />
        <div className="login-floating-shape login-floating-shape-3" />
        <div className="login-floating-shape login-floating-shape-4" />
        <div className="login-wellness-glow login-wellness-glow-1" />
        <div className="login-wellness-glow login-wellness-glow-2" />
        <div className="login-wellness-glow login-wellness-glow-3" />
        
        <Card className="login-card w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="login-icon-container mx-auto">
              <Heart className="w-10 h-10 text-white" fill="currentColor" />
              <Sparkles className="login-sparkle login-sparkle-1" />
              <Sparkles className="login-sparkle login-sparkle-2" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome to SafeSpace</CardTitle>
              <CardDescription className="mt-2">
                Let's set up your anonymous profile
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your display name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="login-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">Profession (Optional)</Label>
                <Input
                  id="profession"
                  type="text"
                  placeholder="e.g., Teacher, Student, Engineer"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  disabled={isSubmitting}
                  className="login-input"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="w-full login-button-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-bg-gradient-waves" />
      <div className="login-floating-shape login-floating-shape-1" />
      <div className="login-floating-shape login-floating-shape-2" />
      <div className="login-floating-shape login-floating-shape-3" />
      <div className="login-floating-shape login-floating-shape-4" />
      <div className="login-wellness-glow login-wellness-glow-1" />
      <div className="login-wellness-glow login-wellness-glow-2" />
      <div className="login-wellness-glow login-wellness-glow-3" />
      
      <Card className="login-card w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="login-icon-container mx-auto">
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
            <Sparkles className="login-sparkle login-sparkle-1" />
            <Sparkles className="login-sparkle login-sparkle-2" />
          </div>
          <div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
              Welcome back to your SafeSpace
            </p>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SafeSpace
            </CardTitle>
            <CardDescription className="mt-3 text-base">
              Your anonymous emotional support community
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-3">
            <Button
              onClick={handleGuestLogin}
              disabled={isLoggingIn}
              className="w-full h-12 login-button-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-200"
            >
              Continue without login
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-purple-200 dark:border-purple-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-950 px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <Button
              onClick={handleInternetIdentityLogin}
              disabled={isLoggingIn}
              variant="outline"
              className="w-full h-12 login-button-secondary border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login with Internet Identity'
              )}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground pt-2">
            Take a deep breath — you're home.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
