import { Link } from "@tanstack/react-router";
import { ShoppingCart, Wrench } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { SearchBar } from "./SearchBar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide">
          <Wrench className="h-5 w-5 text-primary" /> PARTS<span className="text-primary">.GE</span>
        </Link>
        <nav className="text-sm flex items-center gap-4">
          <a 
  href="/admin.html" 
  className="text-xs font-bold uppercase border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-primary-foreground transition-all"
>
  🛠️ Admin
</a>


        </nav>
        <div className="order-last w-full sm:order-none sm:ml-auto sm:max-w-md">
          <SearchBar />
        </div>
        <CartLink />
      </div>
    </header>
  );
}

function CartLink() {
  const { count } = useCart();
  return (
    <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative ml-auto p-2 opacity-90 hover:opacity-100 sm:ml-0">
      <ShoppingCart className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
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
