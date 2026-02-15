export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-lavender-200 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-lavender-700">
        <p>
          © {new Date().getFullYear()} SafeSpace. Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lavender-600 hover:text-lavender-800 underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
