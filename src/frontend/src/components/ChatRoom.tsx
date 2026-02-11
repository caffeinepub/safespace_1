import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Loader2, RefreshCw } from 'lucide-react';
import { useGetChatMessages, useSendChatMessage, useGetChatRooms } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface ChatRoomProps {
  userId: string;
  roomId: string;
  onBack: () => void;
}

export default function ChatRoom({ userId, roomId, onBack }: ChatRoomProps) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: messages, isLoading, refetch, isFetching } = useGetChatMessages(roomId);
  const { data: chatRooms } = useGetChatRooms();
  const sendMessageMutation = useSendChatMessage();

  const roomDetails = chatRooms?.find(([id]) => id === roomId);
  const roomInfo = roomDetails?.[1];
  const roomName = roomInfo ? roomInfo.name : 'Support Chat Room';
  const roomTopic = roomInfo ? roomInfo.topic : '';

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
        roomId,
        message: {
          timestamp: BigInt(Date.now() * 1_000_000),
          userId,
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
      <Card className="shadow-xl border-2 border-purple-100 dark:border-purple-900">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <CardTitle className="text-2xl">{roomName}</CardTitle>
                {roomTopic && (
                  <span className="inline-block mt-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                    {roomTopic}
                  </span>
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
                  const isOwnMessage = msg.userId === userId;
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-medium text-muted-foreground">
                          {isOwnMessage ? 'You' : msg.userId}
                        </span>
                        {msg.profession && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300">
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
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border border-purple-100 dark:border-purple-800'
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
                  <p className="text-muted-foreground">No messages yet. Be the first to share!</p>
                  <p className="text-sm text-muted-foreground/70">
                    This is a safe space to express your feelings and support others.
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4 bg-gradient-to-r from-purple-50/30 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/20">
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
                className="flex-1 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all"
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
