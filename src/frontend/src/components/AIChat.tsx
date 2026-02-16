import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCreateAISession, useAppendAIMessage, useGetAITranscript, useGetAIResponse } from '../hooks/useQueries';
import { formatDistanceToNow } from 'date-fns';
import { Variant_ai_user } from '../backend';

interface AIChatProps {
  onBack: () => void;
}

export default function AIChat({ onBack }: AIChatProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const createSession = useCreateAISession();
  const appendMessage = useAppendAIMessage();
  const getAIResponse = useGetAIResponse();
  const { data: transcript = [], isLoading: transcriptLoading } = useGetAITranscript(sessionId || '');

  useEffect(() => {
    const initSession = async () => {
      try {
        const newSessionId = await createSession.mutateAsync();
        setSessionId(newSessionId);
      } catch (error) {
        console.error('Failed to create AI session:', error);
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleSend = async () => {
    if (!message.trim() || !sessionId || appendMessage.isPending) return;

    const userMessage = message.trim();
    setMessage('');

    try {
      await appendMessage.mutateAsync({
        sessionId,
        message: userMessage,
        sender: 'user',
      });

      const aiResponse = await getAIResponse.mutateAsync('default');
      
      await appendMessage.mutateAsync({
        sessionId,
        message: aiResponse,
        sender: 'ai',
      });
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
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>AI Companion</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6" ref={scrollRef}>
            {transcriptLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
              </div>
            )}
            
            {!transcriptLoading && transcript.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>Start a conversation with your AI companion.</p>
                <p className="text-sm mt-2">I'm here to listen and support you.</p>
              </div>
            )}

            <div className="space-y-4 py-4">
              {transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === Variant_ai_user.user ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.sender === Variant_ai_user.user
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
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!sessionId || appendMessage.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || !sessionId || appendMessage.isPending}
              >
                {appendMessage.isPending ? (
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
