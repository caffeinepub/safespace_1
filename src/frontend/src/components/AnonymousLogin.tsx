import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGuestAuth } from '../hooks/useGuestAuth';
import { useActivityLogging } from '../hooks/useActivityLogging';

interface AnonymousLoginProps {
  onLogin: () => void;
}

export default function AnonymousLogin({ onLogin }: AnonymousLoginProps) {
  const { createGuestSession } = useGuestAuth();
  const { logLogin } = useActivityLogging();

  const handleGuestContinue = () => {
    const session = createGuestSession();
    logLogin(session.guestId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender-500 to-blush-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <CardTitle className="text-2xl">Welcome to SafeSpace</CardTitle>
          <CardDescription>
            A safe, supportive space for your emotional well-being
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGuestContinue}
            className="w-full"
            size="lg"
          >
            Continue as Guest
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-lavender-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-lavender-600">Or</span>
            </div>
          </div>
          <Button
            onClick={onLogin}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Login with Internet Identity
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Guest mode allows you to explore SafeSpace without creating an account.
            Your data will be stored locally on this device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
