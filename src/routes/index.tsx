import { createFileRoute } from "@tanstack/react-router";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { ProductCard } from "@/components/store/ProductCard";
import { getFeatured } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const featuredProducts = getFeatured() || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-12">
      <section className="text-center py-12 bg-muted/30 rounded-xl border px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">The right part. Guaranteed fit.</h1>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Select your vehicle to see only parts with confirmed compatibility.</p>
        <div className="max-w-3xl mx-auto bg-card p-4 rounded-lg shadow-sm border">
          <VehicleSelector initial={{}} compact={false} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide">Featured Parts</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
