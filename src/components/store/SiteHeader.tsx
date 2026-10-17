import { Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { SearchBar } from "./SearchBar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide">
          <Wrench className="h-5 w-5 text-primary" /> PARTS<span className="text-primary">.GE</span>
        </Link>
        <nav className="text-sm">
          <Link to="/products" className="opacity-80 hover:opacity-100">All parts</Link>
        </nav>
        <div className="order-last w-full sm:order-none sm:ml-auto sm:max-w-md">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm opacity-70">
        © {new Date().getFullYear()} PARTS.GE · Car parts delivered across Georgia · Prices in GEL (₾)
      </div>
    </footer>
  );
}
