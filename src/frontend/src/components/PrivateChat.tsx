import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { UserProfile } from '../types/backend-extended';

interface PrivateChatProps {
  onBack: () => void;
  userProfile: UserProfile | null | undefined;
}

export default function PrivateChat({ onBack }: PrivateChatProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Private Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Private chat functionality will be available once the backend is fully restored.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
