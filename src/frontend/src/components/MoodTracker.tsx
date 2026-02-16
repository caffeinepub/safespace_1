import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateMoodEntry } from '../hooks/useQueries';
import { Mood } from '../backend';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MoodTrackerProps {
  onBack: () => void;
  guestId?: string;
}

const MOOD_OPTIONS: { mood: Mood; emoji: string; label: string; score: number }[] = [
  { mood: Mood.happy, emoji: '😊', label: 'Happy', score: 8 },
  { mood: Mood.sad, emoji: '😢', label: 'Sad', score: 3 },
  { mood: Mood.anxious, emoji: '😰', label: 'Anxious', score: 4 },
  { mood: Mood.calm, emoji: '😌', label: 'Calm', score: 7 },
  { mood: Mood.angry, emoji: '😠', label: 'Angry', score: 2 },
  { mood: Mood.grateful, emoji: '🙏', label: 'Grateful', score: 9 },
  { mood: Mood.stressed, emoji: '😫', label: 'Stressed', score: 3 },
  { mood: Mood.lonely, emoji: '😔', label: 'Lonely', score: 4 },
  { mood: Mood.hopeful, emoji: '🌟', label: 'Hopeful', score: 7 },
  { mood: Mood.content, emoji: '😊', label: 'Content', score: 8 },
  { mood: Mood.overwhelmed, emoji: '😵', label: 'Overwhelmed', score: 2 },
  { mood: Mood.inspired, emoji: '✨', label: 'Inspired', score: 9 },
  { mood: Mood.relaxed, emoji: '😎', label: 'Relaxed', score: 8 },
];

export default function MoodTracker({ onBack, guestId }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const createMood = useCreateMoodEntry();

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }

    const moodOption = MOOD_OPTIONS.find(m => m.mood === selectedMood);
    if (!moodOption) return;

    try {
      await createMood.mutateAsync({
        mood: selectedMood,
        note: note.trim() || null,
        moodScore: moodOption.score,
        guestId,
      });
      toast.success('Mood entry saved!');
      setSelectedMood(null);
      setNote('');
      onBack();
    } catch (error) {
      toast.error('Failed to save mood entry');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>How are you feeling?</CardTitle>
          <CardDescription>Select your current mood and add optional notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.mood}
                onClick={() => setSelectedMood(option.mood)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMood === option.mood
                    ? 'border-lavender-500 bg-lavender-50 scale-105'
                    : 'border-gray-200 hover:border-lavender-300'
                }`}
              >
                <div className="text-4xl mb-2">{option.emoji}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedMood || createMood.isPending}
            className="w-full"
          >
            {createMood.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Mood Entry'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
