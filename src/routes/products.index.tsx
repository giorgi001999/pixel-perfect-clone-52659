import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { conditionLabel, getBrands, getCategories, listProducts, type SortKey } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";
import { createNewProduct, uploadProductImage } from "@/lib/adminActions";

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
  component: Listing,
});

const selCls = "h-10 w-full rounded-md border border-input bg-card px-3 text-sm";
const inputCls = "w-full rounded-md border p-2 text-sm bg-card mt-1 text-foreground";

function Listing() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/products/" });
  const set = (patch: Partial<typeof s>) => navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '',
    condition: 'new_aftermarket', brand: '', inStock: true,
    make: '', model: '', yearStart: '', yearEnd: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mode = window.localStorage.getItem('admin_mode');
      if (mode === 'true') {
        setIsAdminMode(true);
      }
    }
  }, []);

  useEffect(() => {
    async function loadLiveParts() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        if (data) {
          const formatted = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.id.slice(0, 8).toUpperCase(),
            oemNumber: p.id.slice(0, 10).toUpperCase(),
            priceGel: Number(p.price),
            category: p.category,
            condition: p.condition || 'new_aftermarket',
            brand: p.brand,
            stock: p.in_stock ? "in_stock" : "out_of_stock",
            imageUrl: p.image_url || undefined,
            featured: false,
            compatibility: p.make ? [{
              make: p.make,
              model: p.model || "",
              startYear: p.year_start || 2000,
              endYear: p.year_end || 2026
            }] : []
          }));
          setDbProducts(formatted);
        }
      } catch (err) {
        console.error("Database connection logs fallback:", err);
      }
    }
    loadLiveParts();
  }, [message]);

  const products = listProducts({ ...s, sort: s.sort as SortKey, dbProducts: dbProducts || [] }) || [];
  const vehicle = [s.make, s.model, s.year].filter(Boolean).join(" ");

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      let imageUrl = null;
      if (imageFile) imageUrl = await uploadProductImage(imageFile);
      await createNewProduct({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        condition: form.condition,
        brand: form.brand,
        inStock: form.inStock,
        make: form.make || undefined,
        model: form.model || undefined,
        yearStart: form.yearStart ? parseInt(form.yearStart) : undefined,
        yearEnd: form.yearEnd ? parseInt(form.yearEnd) : undefined,
      }, imageUrl);
      setMessage('🎉 Success!');
      setForm({ name: '', description: '', price: '', category: '', condition: 'new_aftermarket', brand: '', inStock: true, make: '', model: '', yearStart: '', yearEnd: '' });
      setImageFile(null);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between bg-muted border p-4 rounded-lg mb-8">
        <div>
          <h4 className="font-bold text-sm uppercase">Catalog Control Deck</h4>
          <p className="text-xs text-muted-foreground">Manage real inventory settings.</p>
        </div>
        <button 
          type="button" 
          onClick={() => {
            if (typeof window !== 'undefined') {
              if (isAdminMode) {
                window.localStorage.removeItem('admin_mode');
              } else {
                window.localStorage.setItem('admin_mode', 'true');
              }
            }
            setIsAdminMode(!isAdminMode);
          }} 
          className="bg-primary text-primary-foreground text-xs font-bold uppercase px-4 py-2 rounded cursor-pointer"
        >
          {isAdminMode ? "⚡ View Store" : "🛠️ Open Panel"}
        </button>
      </div>

      {isAdminMode ? (
        <div className="max-w-2xl mx-auto py-4">
          <h1 className="text-3xl font-bold uppercase mb-6">Parts Administration</h1>
          {message && <div className="p-4 mb-4 rounded border bg-secondary">{message}</div>}
          <form onSubmit={handleAdminSubmit} className="space-y-4 border p-6 rounded-lg bg-card">
            <div>
              <label className="text-sm font-semibold uppercase">Part Name *</label>
              <input required type="text" className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold uppercase">Price (₾) *</label>
                <input required type="number" className={inputCls} value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-semibold uppercase">Condition *</label>
                <select className={inputCls} value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                  {Object.entries(conditionLabel).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold uppercase">Category *</label>
                <select required className={inputCls} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="">Select</option>
                  {getCategories().map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold uppercase">Brand *</label>
                <select required className={inputCls} value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
                  <option value="">Select</option>
                  {getBrands().map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="border-t border-dashed pt-4">
              <h3 className="text-sm font-bold uppercase mb-2">Compatibility</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <input type="text" className={inputCls} placeholder="Make" value={form.make} onChange={e => setForm({...form, make: e.target.value})} />
                <input type="text" className={inputCls} placeholder="Model" value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 mt-2">
                <input type="number" className={inputCls} placeholder="From Year" value={form.yearStart} onChange={e => setForm({...form, yearStart: e.target.value})} />
                <input type="number" className={inputCls} placeholder="To Year" value={form.yearEnd} onChange={e => setForm({...form, yearEnd: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold uppercase">Image</label>
              <input type="file" accept="image/*" className={inputCls} onChange={e => setImageFile(e.target.files ? e.target.files : null)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground h-11 font-bold rounded uppercase cursor-pointer">
              {loading ? 'Uploading...' : 'Publish Part'}
            </button>
          </form>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
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
            </div>
          </aside>
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div>
                <h1 className="text-3xl font-bold uppercase">{vehicle ? `Parts for ${vehicle}` : "All parts"}</h1>
                <p className="text-sm text-muted-foreground">{products.length} results</p>
              </div>
            </div>
            {products.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="mt-10 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                No parts match these filters.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
