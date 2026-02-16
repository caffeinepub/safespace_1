import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useStartPrivateThread } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface StartPrivateChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StartPrivateChatDialog({ open, onOpenChange }: StartPrivateChatDialogProps) {
  const [principalText, setPrincipalText] = useState('');
  const startThread = useStartPrivateThread();

  const handleSubmit = async () => {
    if (!principalText.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(principalText.trim());
      await startThread.mutateAsync(principal);
      toast.success('Private chat started!');
      setPrincipalText('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Invalid principal ID or failed to start chat');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Private Chat</DialogTitle>
          <DialogDescription>
            Enter the principal ID of the user you want to chat with
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Principal ID *</Label>
            <Input
              id="principal"
              value={principalText}
              onChange={(e) => setPrincipalText(e.target.value)}
              placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!principalText.trim() || startThread.isPending}
          >
            {startThread.isPending ? (
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
