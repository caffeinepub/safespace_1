import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AccessDeniedScreen from './AccessDeniedScreen';

interface AnalyticsDashboardProps {
  onBack: () => void;
  isAdmin: boolean;
}

export default function AnalyticsDashboard({ onBack, isAdmin }: AnalyticsDashboardProps) {
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
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Analytics dashboard will be available once the backend is fully restored.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
