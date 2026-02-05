import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { usePdfPresentation } from '../hooks/useQueries';
import { toast } from 'sonner';

interface PresentationViewerProps {
  onBack: () => void;
}

const SLIDE_IMAGES = [
  { name: 'Title Slide', path: '/assets/generated/presentation-title-slide-corrected.dim_1024x768.png' },
  { name: 'Vision & Purpose', path: '/assets/generated/presentation-vision-slide-corrected.dim_1024x768.png' },
  { name: 'Key Features', path: '/assets/generated/presentation-features-slide-corrected.dim_1024x768.png' },
  { name: 'Design Philosophy', path: '/assets/generated/presentation-design-slide-corrected.dim_1024x768.png' },
  { name: 'User Experience', path: '/assets/generated/presentation-ux-slide-corrected.dim_1024x768.png' },
  { name: 'Analytics Dashboard', path: '/assets/generated/presentation-analytics-slide-corrected.dim_1024x768.png' },
  { name: 'Admin Controls', path: '/assets/generated/presentation-admin-slide-corrected.dim_1024x768.png' },
  { name: 'Monetization Model', path: '/assets/generated/presentation-monetization-slide-corrected.dim_1024x768.png' },
  { name: 'Impact & Growth', path: '/assets/generated/presentation-impact-slide-corrected.dim_1024x768.png' },
  { name: 'Closing Slide', path: '/assets/generated/presentation-closing-slide-corrected.dim_1024x768.png' },
];

export default function PresentationViewer({ onBack }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: pdfBlob, isLoading: isPdfLoading } = usePdfPresentation();

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : SLIDE_IMAGES.length - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev < SLIDE_IMAGES.length - 1 ? prev + 1 : 0));
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      if (pdfBlob) {
        // Use the direct URL from the blob
        const url = pdfBlob.getDirectURL();
        const link = document.createElement('a');
        link.href = url;
        link.download = 'SafeSpace-Presentation.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('PDF downloaded successfully', {
          description: 'Your SafeSpace presentation is ready',
        });
      } else {
        toast.error('PDF not available', {
          description: 'Please try again later',
        });
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF', {
        description: 'Please try again',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="ghost"
          className="hover:bg-purple-50 dark:hover:bg-purple-950/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button
          onClick={handleDownloadPdf}
          disabled={isDownloading || isPdfLoading || !pdfBlob}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      <Card className="border-2 border-purple-100 dark:border-purple-900/30 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SafeSpace Presentation
          </CardTitle>
          <CardDescription>
            A comprehensive 10-slide showcase of the SafeSpace app with corrected content
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Slide Viewer */}
          <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 rounded-lg overflow-hidden shadow-inner">
            <div className="aspect-[4/3] flex items-center justify-center p-4">
              <img
                src={SLIDE_IMAGES[currentSlide].path}
                alt={SLIDE_IMAGES[currentSlide].name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'flex flex-col items-center justify-center gap-4 text-muted-foreground';
                    placeholder.innerHTML = `
                      <div class="w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 flex items-center justify-center">
                        <svg class="w-12 h-12 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div class="text-center">
                        <p class="text-lg font-medium">${SLIDE_IMAGES[currentSlide].name}</p>
                        <p class="text-sm">Slide ${currentSlide + 1} of ${SLIDE_IMAGES.length}</p>
                      </div>
                    `;
                    parent.appendChild(placeholder);
                  }
                }}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <Button
                onClick={handlePrevSlide}
                variant="ghost"
                size="icon"
                className="ml-2 bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 shadow-lg backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button
                onClick={handleNextSlide}
                variant="ghost"
                size="icon"
                className="mr-2 bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 shadow-lg backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Slide Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
              <p className="text-sm font-medium">
                Slide {currentSlide + 1} of {SLIDE_IMAGES.length}
              </p>
            </div>
          </div>

          {/* Slide Title */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">
              {SLIDE_IMAGES[currentSlide].name}
            </h3>
          </div>

          {/* Slide Thumbnails */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {SLIDE_IMAGES.map((slide, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  currentSlide === index
                    ? 'border-purple-500 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <img
                  src={slide.path}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.classList.add('bg-gradient-to-br', 'from-purple-100', 'to-pink-100', 'dark:from-purple-900', 'dark:to-pink-900');
                    }
                  }}
                />
              </button>
            ))}
          </div>

          {/* Presentation Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-6 space-y-4">
            <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              About This Presentation
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                This comprehensive 10-slide presentation showcases the SafeSpace app, highlighting its key features, design philosophy, and impact on emotional wellness.
              </p>
              <p>
                The presentation includes:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Professional lavender-blush themed design</li>
                <li>Visual assets and screenshots from the app</li>
                <li>Detailed feature explanations and benefits</li>
                <li>Analytics and monetization insights</li>
                <li>Grammar and spelling corrected for professional quality</li>
                <li>Ready for business presentations and investor meetings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
