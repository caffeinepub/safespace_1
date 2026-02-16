import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface StartupErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export default function StartupErrorState({ error, onRetry }: StartupErrorStateProps) {
  return (
    <div className="aurora-bg min-h-screen flex items-center justify-center p-4">
      <Card className="glass-card-white w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Startup Error</CardTitle>
          <CardDescription className="text-base mt-2">
            An error occurred while starting the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="mt-2 text-sm font-mono break-all">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={onRetry} className="w-full" variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            If the error persists, please try refreshing the page or contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
