import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useCreateChatRoom } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateChatRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateChatRoomDialog({ open, onOpenChange }: CreateChatRoomDialogProps) {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const createRoom = useCreateChatRoom();

  const handleSubmit = async () => {
    if (!name.trim() || !topic.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const id = `room-${Date.now()}`;
      await createRoom.mutateAsync({ id, name: name.trim(), topic: topic.trim() });
      toast.success('Chat room created!');
      setName('');
      setTopic('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create chat room');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Chat Room</DialogTitle>
          <DialogDescription>
            Create a new topic-based group chat room
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name *</Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Check-in"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-topic">Topic *</Label>
            <Textarea
              id="room-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What will this room be about?"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !topic.trim() || createRoom.isPending}
          >
            {createRoom.isPending ? (
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
