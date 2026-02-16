import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGuestAuth } from '../hooks/useGuestAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, User } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function AnonymousLogin() {
  const { login, loginStatus } = useInternetIdentity();
  const { createGuestSession } = useGuestAuth();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);

  const handleInternetIdentityLogin = async () => {
    if (!agreedToTerms) return;
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const handleGuestLogin = async () => {
    setIsCreatingGuest(true);
    try {
      createGuestSession();
    } catch (error) {
      console.error('Guest session creation failed:', error);
    } finally {
      setIsCreatingGuest(false);
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="aurora-bg login-container">
      {/* Bottom-left decorative corner accent */}
      <div className="login-corner-accent">
        <User className="w-12 h-12 text-white opacity-60" />
      </div>

      <Card className="glass-card-white login-card w-full max-w-md">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <BrandLogo size="large" showWordmark={false} />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold gradient-text-primary mb-2">
              Welcome to SafeSpace
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Your personal mental wellness companion
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Primary Action: Internet Identity Login */}
          <Button
            onClick={handleInternetIdentityLogin}
            disabled={!agreedToTerms || isLoggingIn}
            className="w-full h-12 gradient-button-primary text-white font-medium text-base"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Login with Internet Identity
              </>
            )}
          </Button>

          {/* OR Divider */}
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-4 text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Secondary Action: Guest Login */}
          <Button
            onClick={handleGuestLogin}
            disabled={isCreatingGuest}
            variant="outline"
            className="w-full h-12 neon-outline-button font-medium text-base"
          >
            {isCreatingGuest ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating session...
              </>
            ) : (
              'Continue as Guest'
            )}
          </Button>

          {/* Terms Agreement */}
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="terms"
              className="text-sm text-gray-500 leading-relaxed cursor-pointer"
            >
              I agree to the{' '}
              <a href="#" className="text-safespace-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-safespace-primary hover:underline">
                Privacy Policy
              </a>
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
