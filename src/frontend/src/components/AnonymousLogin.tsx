import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Loader2, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGuestAuth } from '../hooks/useGuestAuth';
import { useSaveCallerUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { useActivityLogging } from '../hooks/useActivityLogging';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnonymousLoginProps {
  onLogin: (userId: string, profession: string | null) => void;
}

type LoginStep = 'main' | 'profile-setup' | 'guest-name-entry';

export default function AnonymousLogin({ onLogin }: AnonymousLoginProps) {
  const { login, loginStatus, identity, isInitializing, loginError } = useInternetIdentity();
  const { loginAsGuest } = useGuestAuth();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { logLogin } = useActivityLogging();

  const [currentStep, setCurrentStep] = useState<LoginStep>('main');
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Check if user needs profile setup after authentication
  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched) {
      if (userProfile === null) {
        console.log('✅ User authenticated but no profile found - showing profile setup');
        setCurrentStep('profile-setup');
        setAuthError(null);
      } else if (userProfile) {
        console.log('✅ User profile found:', userProfile);
        setAuthError(null);
        logLogin('internetIdentity');
        onLogin(userProfile.name, userProfile.profession || null);
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

  const handleGuestLoginStart = () => {
    try {
      setAuthError(null);
      setName('');
      setProfession('');
      setNameError(null);
      console.log('👤 Starting guest name entry flow');
      setCurrentStep('guest-name-entry');
    } catch (error: any) {
      console.error('❌ Guest login start error:', error);
      const errorMessage = error.message || 'Failed to start guest login';
      setAuthError(errorMessage);
      toast.error('Guest login failed', {
        description: errorMessage,
      });
    }
  };

  const handleGuestNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!name.trim()) {
      setNameError('Please enter your name');
      toast.error('Name is required', {
        description: 'Please enter your name to continue',
      });
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);
    setNameError(null);

    try {
      const guestName = name.trim();
      const guestProfession = profession.trim() || null;
      
      console.log('👤 Creating guest session:', guestName);
      
      // Create guest session - this will immediately notify all subscribers
      const guestId = loginAsGuest(guestName, guestProfession);
      
      console.log('📝 Logging guest login activity for guestId:', guestId);
      await logLogin('guest');
      
      toast.success('Welcome!', {
        description: 'You are now logged in as a guest',
      });
      
      // Call onLogin to complete the flow
      onLogin(guestName, guestProfession);
    } catch (error: any) {
      console.error('❌ Guest login error:', error);
      const errorMessage = error.message || 'Failed to create guest session';
      setAuthError(errorMessage);
      toast.error('Guest login failed', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => handleGuestNameSubmit(e),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!name.trim()) {
      setNameError('Please enter your name');
      toast.error('Name is required', {
        description: 'Please enter your name to continue',
      });
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);
    setNameError(null);

    try {
      console.log('💾 Saving user profile:', { 
        userId: name.trim(), 
        name: name.trim(), 
        profession: profession.trim() || undefined 
      });
      
      await saveProfile.mutateAsync({
        userId: name.trim(),
        name: name.trim(),
        profession: profession.trim() || undefined,
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

  const handleBackToMain = () => {
    setCurrentStep('main');
    setName('');
    setProfession('');
    setNameError(null);
    setAuthError(null);
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

  if (currentStep === 'guest-name-entry') {
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
              <CardTitle className="text-2xl font-bold">Welcome, Guest</CardTitle>
              <CardDescription className="mt-2">
                Tell us a bit about yourself
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
            <form onSubmit={handleGuestNameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest-name">Your Name *</Label>
                <Input
                  id="guest-name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(null);
                  }}
                  disabled={isSubmitting}
                  className={nameError ? 'border-destructive' : ''}
                  required
                />
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-profession">Profession (Optional)</Label>
                <Input
                  id="guest-profession"
                  type="text"
                  placeholder="e.g., Student, Teacher, Developer"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToMain}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'profile-setup') {
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
              <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
              <CardDescription className="mt-2">
                Tell us a bit about yourself
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
                <Label htmlFor="profile-name">Your Name *</Label>
                <Input
                  id="profile-name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(null);
                  }}
                  disabled={isSubmitting}
                  className={nameError ? 'border-destructive' : ''}
                  required
                />
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-profession">Profession (Optional)</Label>
                <Input
                  id="profile-profession"
                  type="text"
                  placeholder="e.g., Student, Teacher, Developer"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
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
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to SafeSpace
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Your personal mental wellness companion
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
          <Button
            onClick={handleInternetIdentityLogin}
            disabled={isLoggingIn}
            className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Login with Internet Identity
              </>
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-950 px-2 text-gray-500 dark:text-gray-400">
                Or
              </span>
            </div>
          </div>
          <Button
            onClick={handleGuestLoginStart}
            variant="outline"
            className="w-full h-12 text-base border-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-300"
          >
            Continue as Guest
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
