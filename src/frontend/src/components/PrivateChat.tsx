import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Loader2, RefreshCw } from 'lucide-react';
import { useGetPrivateMessages, useSendPrivateMessage, useGetMyPrivateThreads } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';

interface PrivateChatProps {
  threadId: string;
  onBack: () => void;
}

export default function PrivateChat({ threadId, onBack }: PrivateChatProps) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: messages, isLoading, refetch, isFetching } = useGetPrivateMessages(threadId);
  const { data: threads } = useGetMyPrivateThreads();
  const sendMessageMutation = useSendPrivateMessage();
  const { identity } = useInternetIdentity();

  const myPrincipal = identity?.getPrincipal();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || sendMessageMutation.isPending || !myPrincipal) return;

    const messageToSend = message;
    setMessage('');

    try {
      await sendMessageMutation.mutateAsync({
        threadId,
        message: {
          timestamp: BigInt(Date.now() * 1_000_000),
          sender: myPrincipal,
          message: messageToSend,
          profession: undefined,
        },
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
      <Card className="shadow-xl border-2 border-blue-100 dark:border-blue-900">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <CardTitle className="text-2xl">Private Conversation</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{threadId}</p>
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
                  const isOwnMessage = myPrincipal && msg.sender.toString() === myPrincipal.toString();
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-medium text-muted-foreground">
                          {isOwnMessage ? 'You' : msg.sender.toString().slice(0, 8) + '...'}
                        </span>
                        {msg.profession && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300">
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
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                            : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border border-blue-100 dark:border-blue-800'
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
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  <p className="text-sm text-muted-foreground/70">
                    This is a private space for one-on-one communication.
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4 bg-gradient-to-r from-blue-50/30 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/20">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={sendMessageMutation.isPending}
                className="flex-1 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all"
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
