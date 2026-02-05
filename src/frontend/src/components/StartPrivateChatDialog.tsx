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
import { Loader2, MessageSquare } from 'lucide-react';
import { useCreatePrivateThread } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

interface StartPrivateChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StartPrivateChatDialog({ open, onOpenChange }: StartPrivateChatDialogProps) {
  const [otherUserPrincipal, setOtherUserPrincipal] = useState('');
  const createThreadMutation = useCreatePrivateThread();
  const { identity } = useInternetIdentity();

  const handleCreate = async () => {
    if (!otherUserPrincipal.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    if (!identity) {
      toast.error('You must be logged in to start a private chat');
      return;
    }

    // Generate a unique thread ID
    const threadId = `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const participant1 = identity.getPrincipal();
      const participant2 = Principal.fromText(otherUserPrincipal.trim());
      
      await createThreadMutation.mutateAsync({
        threadId,
        participant1,
        participant2,
      });
      toast.success('Private conversation started successfully!');
      setOtherUserPrincipal('');
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start private conversation';
      toast.error(errorMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !createThreadMutation.isPending) {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-pink-600" />
            Start Private Chat
          </DialogTitle>
          <DialogDescription>
            Begin a confidential one-on-one conversation with another user.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="otherUserPrincipal">User Principal ID</Label>
            <Input
              id="otherUserPrincipal"
              placeholder="Enter the user's principal ID"
              value={otherUserPrincipal}
              onChange={(e) => setOtherUserPrincipal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={createThreadMutation.isPending}
              className="border-pink-200 dark:border-pink-800 focus:border-pink-400 dark:focus:border-pink-600"
            />
            <p className="text-xs text-muted-foreground">
              You can find principal IDs in group chat rooms. All conversations remain private.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createThreadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!otherUserPrincipal.trim() || createThreadMutation.isPending}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {createThreadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              'Start Chat'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
