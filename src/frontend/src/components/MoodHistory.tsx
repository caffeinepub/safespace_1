import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetMoodHistory } from '../hooks/useQueries';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { convertNanosToDate } from '../lib/timestampUtils';

interface MoodHistoryProps {
  onBack: () => void;
  guestId?: string;
}

export default function MoodHistory({ onBack, guestId }: MoodHistoryProps) {
  const { data: moodHistory, isLoading } = useGetMoodHistory(guestId);

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Mood History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
            </div>
          ) : moodHistory && moodHistory.length > 0 ? (
            <div className="space-y-4">
              {moodHistory.map((entry, index) => (
                <div key={index} className="p-4 bg-lavender-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{entry.mood}</p>
                      <p className="text-sm text-muted-foreground">
                        {convertNanosToDate(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-lavender-600">
                        {Number(entry.moodScore)}/10
                      </p>
                    </div>
                  </div>
                  {entry.note && (
                    <p className="mt-2 text-sm text-gray-700">{String(entry.note)}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No mood entries yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
