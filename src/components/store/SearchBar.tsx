import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({ initial = "" }: { initial?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initial);
  return (
    <form
      role="search"
      onSubmit={(e) => { e.preventDefault(); navigate({ to: "/products", search: (prev) => ({ ...prev, q: q.trim() || undefined }) }); }}
      className="relative w-full"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by part name, SKU or OEM number"
        aria-label="Search parts"
        className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </form>
  );
}
