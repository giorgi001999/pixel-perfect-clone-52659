import { createFileRoute, Link } from "@tanstack/react-router";
import { Disc, Filter, Lightbulb, Cog, Zap, MoveVertical } from "lucide-react";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { ProductCard } from "@/components/store/ProductCard";
import { getCategories, getFeatured } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PARTS.GE — Car Parts in Georgia" },
      { name: "description", content: "Find new, OEM, used and refurbished car parts that fit your vehicle. Prices in GEL." },
      { property: "og:title", content: "PARTS.GE — Car Parts in Georgia" },
      { property: "og:description", content: "Find car parts that fit your vehicle. Prices in GEL." },
    ],
  }),
  component: Home,
});

const icons: Record<string, typeof Disc> = { Brakes: Disc, Filters: Filter, Lighting: Lightbulb, Engine: Cog, Electrical: Zap, Suspension: MoveVertical };

function Home() {
  return (
    <>
      <section className="stripe-bg bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <h1 className="max-w-2xl text-5xl font-bold uppercase leading-none sm:text-6xl">
            The right part. <span className="text-primary">Guaranteed fit.</span>
          </h1>
          <p className="mt-4 max-w-xl opacity-75">Select your vehicle to see only parts with confirmed compatibility.</p>
          <div className="mt-8 rounded-lg bg-card p-4 text-card-foreground shadow-xl">
            <VehicleSelector />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-3xl font-bold uppercase">Categories</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {getCategories().map((c) => {
            const Icon = icons[c] ?? Cog;
            return (
              <Link key={c} to="/products" search={{ category: c }} className="flex flex-col items-center gap-2 rounded-lg border bg-card p-5 transition-colors hover:border-primary hover:text-primary">
                <Icon className="h-7 w-7" strokeWidth={1.5} />
                <span className="font-medium">{c}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold uppercase">Featured parts</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline">View all →</Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {getFeatured().map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </>
  );
}
