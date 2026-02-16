import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useGetChatRooms, useGetChatMessages, useSendChatMessage, useJoinChatRoom } from '../hooks/useQueries';
import { UserProfile } from '../types/backend-extended';
import { formatDistanceToNow } from 'date-fns';
import CreateChatRoomDialog from './CreateChatRoomDialog';

interface ChatRoomProps {
  onBack: () => void;
  userProfile: UserProfile | null | undefined;
}

export default function ChatRoom({ onBack, userProfile }: ChatRoomProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: rooms = [], isLoading: roomsLoading } = useGetChatRooms();
  const { data: messages = [], isLoading: messagesLoading } = useGetChatMessages(selectedRoomId || '');
  const sendMessage = useSendChatMessage();
  const joinRoom = useJoinChatRoom();

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const handleSelectRoom = async (roomId: string) => {
    setSelectedRoomId(roomId);
    try {
      await joinRoom.mutateAsync(roomId);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedRoomId || sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        roomId: selectedRoomId,
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
            <CardTitle>Chat Rooms</CardTitle>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {roomsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
              </div>
            )}

            {!roomsLoading && rooms.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No chat rooms yet. Create one to get started!
              </p>
            )}

            <div className="space-y-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleSelectRoom(room.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedRoomId === room.id
                      ? 'bg-lavender-100 border-lavender-300 border'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-sm">{room.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{room.topic}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>{selectedRoom ? selectedRoom.name : 'Select a room'}</CardTitle>
            {selectedRoom && (
              <p className="text-sm text-muted-foreground">{selectedRoom.topic}</p>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {!selectedRoomId ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a chat room to start messaging
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
                    {messages.map((msg, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-sm">{msg.userId}</span>
                          {msg.profession && (
                            <span className="text-xs text-muted-foreground">({msg.profession})</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(Number(msg.timestamp) / 1000000, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm bg-gray-50 rounded-lg px-3 py-2">{msg.message}</p>
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

      <CreateChatRoomDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
