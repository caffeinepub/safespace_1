import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface WeeklyMoodInsightsProps {
  onBack: () => void;
  guestId?: string;
}

export default function WeeklyMoodInsights({ onBack }: WeeklyMoodInsightsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Mood Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Weekly insights will be available once the backend is fully restored.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
