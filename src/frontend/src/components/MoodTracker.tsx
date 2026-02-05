import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { useSaveMood, useSaveDailyAnalysis } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { Mood } from '../backend';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { createNoonLocalDate, dateToICTimestamp } from '@/lib/timestampUtils';

interface MoodTrackerProps {
  userId: string;
  onBack: () => void;
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

export default function MoodTracker({ userId, onBack }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | ''>('');
  const [note, setNote] = useState('');
  const [stepCount, setStepCount] = useState<string>('');
  const [sleepHours, setSleepHours] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { actor, isFetching } = useActor();
  const saveMood = useSaveMood();
  const saveDailyAnalysis = useSaveDailyAnalysis();

  // Derive readiness state from available properties
  const isReady = !!actor && !isFetching;
  const isActorUnavailable = !actor && !isFetching;

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }

    if (!isReady) {
      toast.error('Mood tracking is not ready yet. Please wait a moment.');
      return;
    }

    try {
      const moodOption = moodOptions.find(m => m.value === selectedMood);
      const moodScore = BigInt(moodOption?.score || 5);
      
      // Normalize timestamp to noon local time for consistent day-based storage
      const noonDate = createNoonLocalDate(selectedDate);
      const dateTimestamp = dateToICTimestamp(noonDate);
      
      const steps = stepCount ? BigInt(parseInt(stepCount)) : BigInt(0);
      const sleep = sleepHours ? BigInt(parseInt(sleepHours)) : BigInt(0);

      // Save mood entry
      await saveMood.mutateAsync({
        timestamp: dateTimestamp,
        mood: selectedMood,
        note: note || undefined,
        moodScore,
      });

      // Save daily analysis if wellness data provided
      if (stepCount || sleepHours) {
        try {
          await saveDailyAnalysis.mutateAsync({
            timestamp: dateTimestamp,
            mood: selectedMood,
            moodScore,
            stepCount: steps,
            sleepHours: sleep,
            note: note || undefined,
          });
        } catch (analysisError) {
          console.error('Failed to save wellness data (non-critical):', analysisError);
          toast.warning('Mood saved, but wellness data could not be saved', {
            description: 'Your mood entry was recorded successfully',
          });
        }
      }

      setSelectedMood('');
      setNote('');
      setStepCount('');
      setSleepHours('');
      setSelectedDate(new Date());
    } catch (error) {
      console.error('Failed to save mood:', error);
      // Error toast is already shown by mutation onError
    }
  };

  const isLoading = saveMood.isPending || saveDailyAnalysis.isPending;
  const isSaveDisabled = !selectedMood || isLoading || !isReady;

  // Show unavailable state if actor is not available after loading
  if (isActorUnavailable) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Track Your Mood
            </h1>
            <p className="text-muted-foreground mt-1">
              How are you feeling today?
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
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="shrink-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Track Your Mood
          </h1>
          <p className="text-muted-foreground mt-1">
            How are you feeling today?
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
          <CardTitle>Select Date</CardTitle>
          <CardDescription>Choose the date for this mood entry</CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={!isReady}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Select Your Mood</CardTitle>
          <CardDescription>Choose the option that best describes how you're feeling</CardDescription>
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
          <CardTitle>Wellness Data (Optional)</CardTitle>
          <CardDescription>Track your daily activity and sleep for comprehensive wellness insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="steps">Step Count</Label>
              <Input
                id="steps"
                type="number"
                placeholder="e.g., 8000"
                value={stepCount}
                onChange={(e) => setStepCount(e.target.value)}
                disabled={!isReady}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleep">Sleep Hours</Label>
              <Input
                id="sleep"
                type="number"
                placeholder="e.g., 7"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                disabled={!isReady}
                min="0"
                max="24"
                step="0.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Add a Note (Optional)</CardTitle>
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
        disabled={isSaveDisabled}
        className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Saving...
          </>
        ) : !isReady ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          'Save Mood Entry'
        )}
      </Button>
    </div>
  );
}
