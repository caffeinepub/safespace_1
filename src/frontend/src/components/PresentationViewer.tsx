import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Download } from 'lucide-react';
import AccessDeniedScreen from './AccessDeniedScreen';
import { useGetPDF } from '../hooks/useQueries';
import { useState } from 'react';

interface PresentationViewerProps {
  onBack: () => void;
  isAdmin: boolean;
}

export default function PresentationViewer({ onBack, isAdmin }: PresentationViewerProps) {
  const [fileId] = useState('safespace-presentation');
  const { data: pdfBlob, isLoading } = useGetPDF(fileId);

  if (!isAdmin) {
    return <AccessDeniedScreen onBack={onBack} />;
  }

  const handleDownload = () => {
    if (pdfBlob) {
      const url = pdfBlob.getDirectURL();
      window.open(url, '_blank');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Presentation Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
            </div>
          )}

          {!isLoading && !pdfBlob && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No presentation file found. Upload a presentation to view it here.
              </p>
            </div>
          )}

          {!isLoading && pdfBlob && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Presentation
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  src={pdfBlob.getDirectURL()}
                  className="w-full h-[600px]"
                  title="Presentation Viewer"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
