import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AccessDeniedScreen from './AccessDeniedScreen';

interface AppMarketSettingsProps {
  onBack: () => void;
  isAdmin: boolean;
}

export default function AppMarketSettings({ onBack, isAdmin }: AppMarketSettingsProps) {
  if (!isAdmin) {
    return <AccessDeniedScreen onBack={onBack} />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>App Market Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            App market settings will be available once the backend is fully restored.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
