import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateResponse } from '@/lib/ai/generator';
import { initializeSessionContext, saveSessionContext, clearSessionContext } from '@/lib/ai/sessionContext';
import { SessionContext } from '@/lib/ai/types';

interface AIChatProps {
  userId: string;
  onBack: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

export default function AIChat({ userId, onBack }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionContext, setSessionContext] = useState<SessionContext>(initializeSessionContext());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting on mount (session-only, no localStorage)
  useEffect(() => {
    const sessionMessages = sessionStorage.getItem(`ai-chat-messages-${userId}`);
    if (sessionMessages) {
      try {
        const parsed = JSON.parse(sessionMessages);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (error) {
        console.error('Failed to load session messages:', error);
        sendInitialGreeting();
      }
    } else {
      sendInitialGreeting();
    }
  }, [userId]);

  const sendInitialGreeting = () => {
    const greetings = [
      "I'm glad you're here. This is a safe space for you to share whatever you're feeling.",
      "Welcome. I'm here to listen and support you, without judgment.",
      "Thank you for reaching out. I'm here to understand what you're experiencing.",
    ];
    
    const greeting: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      message: greetings[Math.floor(Math.random() * greetings.length)],
      timestamp: new Date(),
    };
    setMessages([greeting]);
  };

  // Save messages to sessionStorage (not localStorage)
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(`ai-chat-messages-${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  // Save session context
  useEffect(() => {
    saveSessionContext(sessionContext);
  }, [sessionContext]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Generate AI response using new rulebook system
    const { response, updatedContext } = generateResponse(
      userMessage.message,
      sessionContext
    );

    // Update session context
    setSessionContext(updatedContext);

    // Simulate natural thinking time (400-1200ms)
    const thinkingTime = 400 + Math.random() * 800;
    
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: response.message,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, thinkingTime);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    // Clear session context when leaving
    clearSessionContext();
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="shrink-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Support Companion
          </h1>
          <p className="text-muted-foreground mt-1">
            A safe, supportive space for emotional support
          </p>
        </div>
      </div>

      <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Your AI Companion</CardTitle>
              <CardDescription>
                Here to listen and provide emotional support
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300',
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                        : 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border border-purple-200 dark:border-purple-800'
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                    <p
                      className={cn(
                        'text-xs mt-2',
                        msg.sender === 'user'
                          ? 'text-purple-100'
                          : 'text-muted-foreground'
                      )}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {userId.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 animate-in fade-in-50 duration-300">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border border-purple-200 dark:border-purple-800 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-sm text-muted-foreground">Listening...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share your feelings... (Press Enter to send)"
                className="min-h-[60px] max-h-[120px] resize-none border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="shrink-0 h-[60px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Your conversation is private and stored only for this session
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">About Your AI Companion</p>
              <p>
                This companion provides empathetic support and helps you process emotions through reflective conversation. 
                It's designed to listen, validate, and gently guide—but it's not a replacement for professional care. 
                If you need deeper support, please reach out to a mental health professional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
