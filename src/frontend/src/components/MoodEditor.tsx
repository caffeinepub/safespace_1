import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useUpdateMood, useGetMoodHistory } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { Mood, MoodEntry } from '../backend';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { createNoonLocalDate, dateToICTimestamp, timestampToLocalDate } from '@/lib/timestampUtils';
import { isSameDay } from 'date-fns';

interface MoodEditorProps {
  date: Date;
  onClose: () => void;
}

const moodOptions = [
  { value: Mood.happy, label: '😊 Happy', color: 'from-yellow-400 to-orange-400', score: 9 },
  { value: Mood.grateful, label: '🙏 Grateful', color: 'from-pink-400 to-rose-400', score: 9 },
  { value: Mood.relaxed, label: '😌 Relaxed', color: 'from-green-400 to-teal-400', score: 8 },
  { value: Mood.content, label: '😊 Content', color: 'from-blue-400 to-cyan-400', score: 8 },
  { value: Mood.hopeful, label: '🌟 Hopeful', color: 'from-purple-400 to-pink-400', score: 7 },
  { value: Mood.inspired, label: '✨ Inspired', color: 'from-indigo-400 to-purple-400', score: 8 },
  { value: Mood.calm, label: '😌 Calm', color: 'from-teal-400 to-green-400', score: 7 },
  { value: Mood.anxious, label: '😰 Anxious', color: 'from-orange-400 to-red-400', score: 4 },
  { value: Mood.stressed, label: '😫 Stressed', color: 'from-red-400 to-pink-400', score: 3 },
  { value: Mood.overwhelmed, label: '😵 Overwhelmed', color: 'from-red-500 to-orange-500', score: 2 },
  { value: Mood.sad, label: '😢 Sad', color: 'from-blue-500 to-indigo-500', score: 3 },
  { value: Mood.lonely, label: '😔 Lonely', color: 'from-gray-400 to-blue-400', score: 3 },
  { value: Mood.angry, label: '😠 Angry', color: 'from-red-500 to-orange-600', score: 2 },
];

export default function MoodEditor({ date, onClose }: MoodEditorProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | ''>('');
  const [note, setNote] = useState('');

  const { actor, isFetching } = useActor();
  const { data: moodHistory } = useGetMoodHistory();
  const updateMood = useUpdateMood();

  // Derive readiness state from available properties
  const isReady = !!actor && !isFetching;
  const isActorUnavailable = !actor && !isFetching;

  // Load existing mood entry for the selected date
  useEffect(() => {
    if (moodHistory) {
      const existingEntry = moodHistory.find((entry: MoodEntry) => {
        const entryDate = timestampToLocalDate(entry.timestamp);
        return isSameDay(entryDate, date);
      });

      if (existingEntry) {
        setSelectedMood(existingEntry.mood);
        setNote(existingEntry.note || '');
      }
    }
  }, [moodHistory, date]);

  const handleSubmit = async () => {
    if (!selectedMood) {
      return;
    }

    if (!isReady) {
      return;
    }

    const moodOption = moodOptions.find(m => m.value === selectedMood);
    const moodScore = BigInt(moodOption?.score || 5);
    
    // Normalize timestamp to noon local time for consistent day-based storage
    const noonDate = createNoonLocalDate(date);
    const dateTimestamp = dateToICTimestamp(noonDate);

    await updateMood.mutateAsync({
      timestamp: dateTimestamp,
      entry: {
        timestamp: dateTimestamp,
        mood: selectedMood,
        note: note || undefined,
        moodScore,
      }
    });

    // Only navigate back on success (mutation handles success toast)
    if (!updateMood.isError) {
      onClose();
    }
  };

  const isUpdateDisabled = !selectedMood || updateMood.isPending || !isReady;

  // Show unavailable state if actor is not available after loading
  if (isActorUnavailable) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
        <div className="flex items-center gap-4">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Edit Mood Entry
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(date, 'PPPP')}
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Mood Tracking Unavailable</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>Mood tracking is temporarily unavailable. This could be due to a connection issue or system initialization.</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="shrink-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Edit Mood Entry
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(date, 'PPPP')}
          </p>
        </div>
      </div>

      {!isReady && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Initializing...</AlertTitle>
          <AlertDescription>
            Mood tracking is loading. Please wait a moment.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Update Your Mood</CardTitle>
          <CardDescription>Choose the option that best describes how you felt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                disabled={!isReady}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105',
                  selectedMood === mood.value
                    ? `bg-gradient-to-br ${mood.color} text-white border-transparent shadow-lg`
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700',
                  !isReady && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="text-2xl mb-2">{mood.label.split(' ')[0]}</div>
                <div className={cn(
                  'text-sm font-medium',
                  selectedMood === mood.value ? 'text-white' : 'text-foreground'
                )}>
                  {mood.label.split(' ').slice(1).join(' ')}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Update Note (Optional)</CardTitle>
          <CardDescription>Share any thoughts or context about your mood</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="What's on your mind? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={!isReady}
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={isUpdateDisabled}
        className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
      >
        {updateMood.isPending ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Updating...
          </>
        ) : !isReady ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          'Update Mood Entry'
        )}
      </Button>
    </div>
  );
}
