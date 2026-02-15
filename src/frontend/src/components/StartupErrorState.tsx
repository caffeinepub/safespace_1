import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StartupErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

/**
 * Error state UI shown when startup queries fail.
 * Displays error details and provides retry action.
 */
export default function StartupErrorState({ error, onRetry }: StartupErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50 p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <CardTitle className="text-2xl">Startup Error</CardTitle>
          </div>
          <CardDescription>
            SafeSpace encountered an error while starting up. This is usually temporary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2 font-mono text-xs break-all">
              {error?.message || 'Unknown error occurred'}
            </AlertDescription>
          </Alert>
          <div className="text-sm text-muted-foreground">
            <p>Click <strong>Retry</strong> to attempt startup again. If the problem persists, try reloading the page or clearing your browser cache.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={onRetry}
            className="w-full gap-2"
            size="lg"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
