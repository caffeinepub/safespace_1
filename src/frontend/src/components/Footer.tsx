import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'safespace-app'
  );

  return (
    <footer className="footer-premium border-t border-pink-200 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-pink-700">
          <p>© {currentYear} SafeSpace. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Built with <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-800 transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
