export function Footer() {
  const year = new Date().getFullYear();
  const link = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="mt-auto border-t border-border py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © {year}. Built with ❤️ using{" "}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </div>
    </footer>
  );
}
