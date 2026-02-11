import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useSaveMood } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { classifyMoodError, MoodError } from '../lib/moodErrors';
import { Mood } from '../backend';

interface MoodTrackerProps {
  onBack: () => void;
}

const MOODS: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: Mood.happy, label: 'Happy', emoji: '😊', color: 'from-yellow-400 to-orange-400' },
  { value: Mood.sad, label: 'Sad', emoji: '😢', color: 'from-blue-400 to-indigo-400' },
  { value: Mood.anxious, label: 'Anxious', emoji: '😰', color: 'from-purple-400 to-pink-400' },
  { value: Mood.calm, label: 'Calm', emoji: '😌', color: 'from-green-400 to-teal-400' },
  { value: Mood.angry, label: 'Angry', emoji: '😠', color: 'from-red-400 to-orange-400' },
  { value: Mood.grateful, label: 'Grateful', emoji: '🙏', color: 'from-pink-400 to-rose-400' },
  { value: Mood.stressed, label: 'Stressed', emoji: '😫', color: 'from-orange-400 to-red-400' },
  { value: Mood.lonely, label: 'Lonely', emoji: '😔', color: 'from-gray-400 to-blue-400' },
  { value: Mood.hopeful, label: 'Hopeful', emoji: '🌟', color: 'from-cyan-400 to-blue-400' },
  { value: Mood.content, label: 'Content', emoji: '😊', color: 'from-green-400 to-emerald-400' },
  { value: Mood.overwhelmed, label: 'Overwhelmed', emoji: '😵', color: 'from-purple-400 to-red-400' },
  { value: Mood.inspired, label: 'Inspired', emoji: '✨', color: 'from-yellow-400 to-pink-400' },
  { value: Mood.relaxed, label: 'Relaxed', emoji: '😎', color: 'from-blue-400 to-cyan-400' },
];

const MOOD_SCORES: Record<Mood, number> = {
  [Mood.happy]: 8,
  [Mood.sad]: 3,
  [Mood.anxious]: 4,
  [Mood.calm]: 7,
  [Mood.angry]: 2,
  [Mood.grateful]: 9,
  [Mood.stressed]: 3,
  [Mood.lonely]: 3,
  [Mood.hopeful]: 7,
  [Mood.content]: 8,
  [Mood.overwhelmed]: 2,
  [Mood.inspired]: 9,
  [Mood.relaxed]: 8,
};

export default function MoodTracker({ onBack }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const saveMoodMutation = useSaveMood();
  const { actor, isFetching } = useActor();

  const isActorReady = !!actor && !isFetching;

  const handleSave = async () => {
    if (!selectedMood || !isActorReady) return;

    try {
      await saveMoodMutation.mutateAsync({
        timestamp: BigInt(Date.now() * 1_000_000),
        mood: selectedMood,
        note: note.trim() || undefined,
        moodScore: BigInt(MOOD_SCORES[selectedMood]),
      });

      toast.success('Mood saved successfully!');
      setSelectedMood(null);
      setNote('');
      onBack();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save mood';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="icon" className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            How are you feeling?
          </h1>
          <p className="text-muted-foreground mt-2">
            Select your current mood and add optional notes
          </p>
        </div>
      </div>

      {!isActorReady && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">Service Initializing</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Mood tracking is loading. Please wait a moment.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-xl border-2 border-purple-100 dark:border-purple-900">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardTitle className="text-2xl">Select Your Mood</CardTitle>
          <CardDescription>
            Choose the emotion that best describes how you're feeling right now
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                disabled={!isActorReady || saveMoodMutation.isPending}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedMood === mood.value
                    ? `bg-gradient-to-br ${mood.color} text-white border-transparent shadow-lg scale-105`
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md'
                } ${!isActorReady ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-4xl mb-2">{mood.emoji}</div>
                <div className="text-sm font-medium">{mood.label}</div>
              </button>
            ))}
          </div>

          {selectedMood && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add a note (optional)
                </label>
                <Textarea
                  placeholder="What's on your mind? Share your thoughts..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={!isActorReady || saveMoodMutation.isPending}
                  className="min-h-[120px] border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={!isActorReady || saveMoodMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                >
                  {saveMoodMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Mood'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedMood(null);
                    setNote('');
                  }}
                  variant="outline"
                  disabled={saveMoodMutation.isPending}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
