import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { conditionLabel, getBrands, getCategories, listProducts, type SortKey } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";

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
  head: () => ({
    meta: [
      { title: "Shop Car Parts — PARTS.GE" },
      { name: "description", content: "Browse and filter car parts by vehicle, category, brand and condition." },
    ],
  }),
  component: ListingWrapper, // 👈 Redirects TanStack straight to an isolated rendering component wrapper
});

const selCls = "h-10 w-full rounded-md border border-input bg-card px-3 text-sm";

// 🛠️ ISOLATED WRAPPER COMPONENT: Resolves the infinite render loop permanently
function ListingWrapper() {
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadLiveParts() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        if (data) {
          const formatted = data.map((p: any) => ({
            id: String(p.id || Math.random()),
            name: p.name || "Unnamed Component",
            sku: String(p.id || '').slice(0, 8).toUpperCase(),
            oemNumber: String(p.id || '').slice(0, 10).toUpperCase(),
            priceGel: Number(p.price) || 0,
            stock: p.in_stock ? "in_stock" : "out_of_stock",
            price: Number(p.price) || 0,
            stockStatus: p.in_stock ? "In stock" : "Out of stock",
            image: p.image_url || "/placeholder.svg",
            imageUrl: p.image_url || "/placeholder.svg",
            condition: p.condition || 'new_aftermarket',
            brand: p.brand || "Generic",
            category: p.category || "Other",
            featured: false,
            compatibility: p.make ? [{
              make: String(p.make),
              model: String(p.model || ""),
              startYear: Number(p.year_start) || 1990,
              endYear: Number(p.year_end) || 2026
            }] : []
          }));
          setDbProducts(formatted);
        }
      } catch (err) {
        console.error("Supabase load fallback tracking warning:", err);
      }
    }
    loadLiveParts();
  }, []); // 👈 Empty dependency array ensures this fires exactly ONCE per page view

  return <Listing dbProducts={dbProducts} />;
}

function Listing({ dbProducts }: { dbProducts: any[] }) {
  const s = Route.useSearch() || {};
  const navigate = useNavigate({ from: "/products/" });
  const set = (patch: Partial<typeof s>) => navigate({ search: (prev) => ({ ...prev, ...patch }) });

  // Safe mapping configuration options parameters
  const safeQuery = {
    q: s.q || "",
    make: s.make || undefined,
    model: s.model || undefined,
    year: s.year || undefined,
    category: s.category || undefined,
    condition: s.condition || undefined,
    brand: s.brand || undefined,
    inStock: s.inStock || undefined,
    sort: (s.sort as SortKey) || "relevance",
    dbProducts: dbProducts || []
  };

  const products = listProducts(safeQuery) || [];
  const vehicle = [s.make, s.model, s.year].filter(Boolean).join(" ");
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <div>
          <h2 className="mb-2 text-lg font-bold uppercase">Your vehicle</h2>
          <VehicleSelector key={vehicle} initial={s} compact />
          {s.make && (
            <button type="button" className="mt-2 text-sm text-muted-foreground hover:text-primary cursor-pointer" onClick={() => set({ make: undefined, model: undefined, year: undefined })}>
              Clear vehicle
            </button>
          )}
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-bold uppercase">Filters</h2>
          <select aria-label="Category" className={selCls} value={s.category ?? ""} onChange={(e) => set({ category: e.target.value || undefined })}>
            <option value="">All categories</option>
            {getCategories().map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select aria-label="Condition" className={selCls} value={s.condition ?? ""} onChange={(e) => set({ condition: e.target.value || undefined })}>
            <option value="">Any condition</option>
            {Object.entries(conditionLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select aria-label="Brand" className={selCls} value={s.brand ?? ""} onChange={(e) => set({ brand: e.target.value || undefined })}>
            <option value="">All brands</option>
            {getBrands().map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="accent-primary" checked={!!s.inStock} onChange={(e) => set({ inStock: e.target.checked || undefined })} />
            In stock only
          </label>
        </div>
      </aside>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold uppercase">{vehicle ? `Parts for ${vehicle}` : "All parts"}</h1>
            <p className="text-sm text-muted-foreground">{products.length} results</p>
          </div>
          <select aria-label="Sort" className="h-10 rounded-md border border-input bg-card px-3 text-sm" value={s.sort ?? "relevance"} onChange={(e) => set({ sort: e.target.value === "relevance" ? undefined : e.target.value })}>
            <option value="relevance">Sort: Relevance</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
        
        {products.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => p && p.id ? (
              <ProductCard key={p.id} product={p} />
            ) : null)}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            No parts match these filters.{" "}
            <Link to="/products" className="text-primary hover:underline">Reset all</Link>
          </div>
        )}
      </section>
    </div>
  );
}
