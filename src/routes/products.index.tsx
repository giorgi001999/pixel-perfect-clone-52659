import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ProductCard } from "@/components/store/ProductCard";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { conditionLabel, getBrands, getCategories, listProducts, type SortKey } from "@/lib/catalog";

const schema = z.object({
  q: z.string().optional().catch(undefined),
  make: z.string().optional().catch(undefined),
  model: z.string().optional().catch(undefined),
  year: z.coerce.number().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  condition: z.string().optional().catch(undefined),
  brand: z.string().optional().catch(undefined),
  inStock: z.boolean().optional().catch(undefined),
  sort: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/products/")({
  validateSearch: (s) => schema.parse(s),
  component: Listing,
});

const selCls = "h-10 w-full rounded-md border border-input bg-card px-3 text-sm";

function Listing() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/products/" });
  const set = (patch: Partial<typeof s>) => navigate({ search: (prev) => ({ ...prev, ...patch }) });
  const products = listProducts({ ...s, sort: s.sort as SortKey });
  const vehicle = [s.make, s.model, s.year].filter(Boolean).join(" ");

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <div>
          <h2 className="mb-2 text-lg font-bold uppercase">Your vehicle</h2>
          <VehicleSelector key={vehicle} initial={s} compact />
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-bold uppercase">Filters</h2>
          <select className={selCls} value={s.category ?? ""} onChange={(e) => set({ category: e.target.value || undefined })}>
            <option value="">All categories</option>
            {getCategories().map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className={selCls} value={s.condition ?? ""} onChange={(e) => set({ condition: e.target.value || undefined })}>
            <option value="">Any condition</option>
            {Object.entries(conditionLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </aside>

      <section>
        <h1 className="text-3xl font-bold uppercase border-b pb-4">{vehicle ? `Parts for ${vehicle}` : "All parts"}</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
