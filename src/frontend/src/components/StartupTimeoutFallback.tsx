import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

interface StartupTimeoutFallbackProps {
  onReload: () => void;
  onResetAndReload: () => void;
}

export default function StartupTimeoutFallback({ onReload, onResetAndReload }: StartupTimeoutFallbackProps) {
  return (
    <div className="aurora-bg min-h-screen flex items-center justify-center p-4">
      <Card className="glass-card-white w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">Startup Taking Longer Than Expected</CardTitle>
          <CardDescription className="text-base mt-2">
            The application is taking longer than usual to start. This might be due to network conditions or backend initialization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can try reloading the page or resetting the application cache.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button onClick={onReload} className="w-full" variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload
            </Button>
            <Button onClick={onResetAndReload} className="w-full" variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset & Reload
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            If the problem persists, please check your internet connection or try again later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
