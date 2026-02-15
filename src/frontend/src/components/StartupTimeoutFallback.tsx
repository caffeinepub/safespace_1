import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resetAppBrowserStorage } from '@/lib/appStorage';

/**
 * Fallback UI shown when app startup exceeds timeout threshold.
 * Provides user actions to reload or reset browser storage and reload.
 */
export default function StartupTimeoutFallback() {
  const handleReload = () => {
    window.location.reload();
  };

  const handleResetAndReload = () => {
    resetAppBrowserStorage();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lavender-50 via-blush-50 to-sky-50 p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <CardTitle className="text-2xl">Startup Taking Longer Than Expected</CardTitle>
          </div>
          <CardDescription>
            SafeSpace is taking longer than usual to load. This can happen due to network conditions or temporary service delays.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Try reloading the page. If the issue persists, reset your browser storage to clear any cached data that might be causing problems.
            </AlertDescription>
          </Alert>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Reload:</strong> Refreshes the page and retries startup.</p>
            <p><strong>Reset & Reload:</strong> Clears browser storage and refreshes. Your data on the server is safe.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleReload}
            className="flex-1 gap-2"
            size="lg"
          >
            <RefreshCw className="w-4 h-4" />
            Reload
          </Button>
          <Button
            onClick={handleResetAndReload}
            variant="outline"
            className="flex-1 gap-2"
            size="lg"
          >
            <RotateCcw className="w-4 h-4" />
            Reset & Reload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
