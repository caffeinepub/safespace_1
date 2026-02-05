import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          © 2025. Built with <Heart className="w-4 h-4 text-pink-500" fill="currentColor" /> using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
