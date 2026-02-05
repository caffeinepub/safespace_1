import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Loader2, RefreshCw, Lock } from 'lucide-react';
import { usePrivateMessages, useSendPrivateMessage, usePrivateThreads } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface PrivateChatProps {
  threadId: string;
  onBack: () => void;
}

export default function PrivateChat({ threadId, onBack }: PrivateChatProps) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: messages, isLoading, refetch, isFetching } = usePrivateMessages(threadId);
  const { data: threads } = usePrivateThreads();
  const { identity } = useInternetIdentity();
  const sendMessageMutation = useSendPrivateMessage();

  const threadDetails = threads?.find(([id]) => id === threadId);
  const myPrincipal = identity?.getPrincipal().toString();
  const otherParticipant = threadDetails 
    ? (threadDetails[1].toString() === myPrincipal ? threadDetails[2] : threadDetails[1])
    : null;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || sendMessageMutation.isPending) return;

    const messageToSend = message;
    setMessage('');

    try {
      await sendMessageMutation.mutateAsync({
        threadId,
        message: messageToSend,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(errorMessage);
      setMessage(messageToSend);
    }
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl border-2 border-pink-100 dark:border-pink-900">
        <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Lock className="w-5 h-5 text-pink-600" />
                  Private Conversation
                </CardTitle>
                {otherParticipant && (
                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-[300px]">
                    With: {otherParticipant.toString().substring(0, 30)}...
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => refetch()}
              variant="ghost"
              size="icon"
              disabled={isFetching}
              title="Refresh messages"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg, index) => {
                  const isOwnMessage = msg.sender.toString() === myPrincipal;
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-medium text-muted-foreground">
                          {isOwnMessage ? 'You' : 'Anonymous'}
                        </span>
                        {msg.profession && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-700 dark:text-pink-300">
                            {msg.profession}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                            : 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/50 dark:to-purple-950/50 border border-pink-100 dark:border-pink-800'
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center px-4">
                <div className="space-y-2">
                  <Lock className="w-12 h-12 mx-auto text-pink-400 mb-4" />
                  <p className="text-muted-foreground">This is a private, secure conversation.</p>
                  <p className="text-sm text-muted-foreground/70">
                    Share your thoughts in confidence. Only you and the other person can see these messages.
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4 bg-gradient-to-r from-pink-50/30 to-purple-50/30 dark:from-pink-950/20 dark:to-purple-950/20">
            <div className="flex gap-2">
              <Input
                placeholder="Type your private message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={sendMessageMutation.isPending}
                className="flex-1 border-pink-200 dark:border-pink-800 focus:border-pink-400 dark:focus:border-pink-600"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
