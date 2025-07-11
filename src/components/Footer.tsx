import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold text-primary">
              Star Beads Kreation
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              © 2025 All rights reserved
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Built with ❤️ by</span>
            <a 
              href="#" 
              className="font-semibold text-primary hover:underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              EMPRINX TECHNOLOGIES
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 