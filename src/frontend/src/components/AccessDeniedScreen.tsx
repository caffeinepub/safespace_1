import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface AccessDeniedScreenProps {
  onBack: () => void;
}

export default function AccessDeniedScreen({ onBack }: AccessDeniedScreenProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-destructive" />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You do not have permission to access this page. This area is restricted to administrators only.
          </p>
          <Button onClick={onBack} variant="outline">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
