import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface PresentationViewerProps {
  onBack: () => void;
}

export default function PresentationViewer({ onBack }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    '/assets/generated/presentation-title-slide-corrected.dim_1024x768.png',
    '/assets/generated/presentation-vision-slide-corrected.dim_1024x768.png',
    '/assets/generated/presentation-features-slide-corrected.dim_1024x768.png',
    '/assets/generated/presentation-design-slide-corrected.dim_1024x768.png',
    '/assets/generated/presentation-ux-slide-corrected.dim_1024x768.png',
    '/assets/generated/presentation-analytics-slide-corrected.dim_1024x768.png',
    '/assets/generated/presentation-admin-slide-corrected.dim_1024x768.png',
    '/assets/generated/presentation-monetization-slide-corrected.dim_1024x768.png',
    '/assets/generated/presentation-impact-slide-corrected.dim_1024x768.png',
    '/assets/generated/presentation-closing-slide-corrected.dim_1024x768.png',
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SafeSpace Presentation
            </h1>
            <p className="text-muted-foreground mt-1">
              Slide {currentSlide + 1} of {slides.length}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardContent className="p-0">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <img
              src={slides[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              className="w-full h-full object-contain"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button onClick={prevSlide} variant="outline" disabled={currentSlide === 0}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-purple-600 w-8'
                  : 'bg-purple-200 dark:bg-purple-800 hover:bg-purple-400 dark:hover:bg-purple-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <Button onClick={nextSlide} variant="outline" disabled={currentSlide === slides.length - 1}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Slide Thumbnails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentSlide
                    ? 'border-purple-600 ring-2 ring-purple-600 ring-offset-2'
                    : 'border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600'
                }`}
              >
                <img src={slide} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
