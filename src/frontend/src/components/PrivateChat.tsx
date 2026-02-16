import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useGetMyPrivateThreads, useGetPrivateMessages, useSendPrivateMessage } from '../hooks/useQueries';
import { UserProfile } from '../types/backend-extended';
import { formatDistanceToNow } from 'date-fns';
import StartPrivateChatDialog from './StartPrivateChatDialog';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface PrivateChatProps {
  onBack: () => void;
  userProfile: UserProfile | null | undefined;
}

export default function PrivateChat({ onBack, userProfile }: PrivateChatProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showStartDialog, setShowStartDialog] = useState(false);

  const { identity } = useInternetIdentity();
  const { data: threads = [], isLoading: threadsLoading } = useGetMyPrivateThreads();
  const { data: messages = [], isLoading: messagesLoading } = useGetPrivateMessages(selectedThreadId || '');
  const sendMessage = useSendPrivateMessage();

  const selectedThread = threads.find(t => t.id === selectedThreadId);
  const myPrincipal = identity?.getPrincipal().toString();

  const getOtherParticipant = (thread: typeof threads[0]) => {
    if (!myPrincipal) return 'Unknown';
    return thread.participant1.toString() === myPrincipal
      ? thread.participant2.toString()
      : thread.participant1.toString();
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedThreadId || sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        threadId: selectedThreadId,
        message: message.trim(),
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Private Chats</CardTitle>
            <Button size="sm" onClick={() => setShowStartDialog(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {threadsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
              </div>
            )}

            {!threadsLoading && threads.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No private chats yet. Start one to connect!
              </p>
            )}

            <div className="space-y-2">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedThreadId === thread.id
                      ? 'bg-lavender-100 border-lavender-300 border'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-sm truncate">{getOtherParticipant(thread)}</p>
                  <p className="text-xs text-muted-foreground">
                    {thread.messages.length} messages
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>
              {selectedThread ? getOtherParticipant(selectedThread) : 'Select a chat'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {!selectedThreadId ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a private chat to start messaging
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 px-6">
                  {messagesLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
                    </div>
                  )}

                  {!messagesLoading && messages.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </p>
                  )}

                  <div className="space-y-4 py-4">
                    {messages.map((msg, idx) => {
                      const isMyMessage = msg.sender.toString() === myPrincipal;
                      return (
                        <div
                          key={idx}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              isMyMessage
                                ? 'bg-lavender-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatDistanceToNow(Number(msg.timestamp) / 1000000, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={sendMessage.isPending}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!message.trim() || sendMessage.isPending}
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <StartPrivateChatDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
      />
    </div>
  );
}
