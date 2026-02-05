import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useCreateChatRoom } from '../hooks/useQueries';
import { toast } from 'sonner';

interface CreateChatRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOPICS = [
  'General Support',
  'Anxiety & Stress',
  'Depression',
  'Relationships',
  'Work & Career',
  'Self-Care',
  'Grief & Loss',
  'Daily Check-in',
  'Positive Vibes',
  'Other',
];

export default function CreateChatRoomDialog({ open, onOpenChange }: CreateChatRoomDialogProps) {
  const [roomName, setRoomName] = useState('');
  const [topic, setTopic] = useState('General Support');
  const createRoomMutation = useCreateChatRoom();

  const handleCreate = async () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    // Generate a unique room ID based on timestamp and random string
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      await createRoomMutation.mutateAsync({
        roomId,
        roomName: roomName.trim(),
        topic,
      });
      toast.success(`Chat room "${roomName}" created successfully!`);
      setRoomName('');
      setTopic('General Support');
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create chat room';
      toast.error(errorMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !createRoomMutation.isPending) {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create New Chat Room
          </DialogTitle>
          <DialogDescription>
            Create a supportive space for others to join and share their feelings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              placeholder="e.g., Daily Check-in, Evening Support"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={createRoomMutation.isPending}
              className="border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="topic">Topic</Label>
            <Select value={topic} onValueChange={setTopic} disabled={createRoomMutation.isPending}>
              <SelectTrigger className="border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createRoomMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!roomName.trim() || createRoomMutation.isPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {createRoomMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Room'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
