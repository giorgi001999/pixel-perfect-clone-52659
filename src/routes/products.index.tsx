import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { conditionLabel, getBrands, getCategories, listProducts, type SortKey } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";
import { createNewProduct, uploadProductImage } from "@/lib/adminActions";
import type { Product } from "@/lib/catalog-types";

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
      { property: "og:title", content: "Shop Car Parts — PARTS.GE" },
      { property: "og:description", content: "Browse and filter car parts by vehicle, category and condition." },
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

  // Mode Control state toggles
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  // Form uploading properties states
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '',
    condition: 'new_aftermarket', brand: '', inStock: true,
    make: '', model: '', yearStart: '', yearEnd: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch real upload assets dynamically on mount & on success messages updates
  useEffect(() => {
    async function loadLiveParts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        if (data) {
          const formatted: Product[] = data.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.id.slice(0, 8).toUpperCase(),
            oemNumber: p.id.slice(0, 10).toUpperCase(),
            priceGel: Number(p.price),
            category: p.category,
            condition: p.condition as any,
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
        console.error("Supabase live catalog collection error:", err);
      }
    }
    loadLiveParts();
  }, [message]);

  // Feed merged products to catalog function matching your schema constraints
  const products = listProducts({ ...s, sort: s.sort as SortKey, dbProducts });
  const vehicle = [s.make, s.model, s.year].filter(Boolean).join(" ");

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

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

      setMessage('🎉 Product uploaded successfully to PARTS.GE real catalog pipeline!');
      setForm({ name: '', description: '', price: '', category: '', condition: 'new_aftermarket', brand: '', inStock: true, make: '', model: '', yearStart: '', yearEnd: '' });
      setImageFile(null);
    } catch (err: any) {
      setMessage(`❌ Error uploading data asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Admin Panel Deck Command Header */}
      <div className="flex items-center justify-between bg-muted border p-4 rounded-lg mb-8">
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wide">Catalog Control Deck</h4>
          <p className="text-xs text-muted-foreground">Switch views to upload real data records dynamically or view shop inventory.</p>
        </div>
        <button 
          onClick={() => setIsAdminMode(!isAdminMode)} 
          className="bg-primary text-primary-foreground text-xs font-bold uppercase px-4 py-2 rounded shadow hover:opacity-90 transition-all cursor-pointer"
        >
          {isAdminMode ? "⚡ View Storefront Grid" : "🛠️ Open Upload Panel"}
        </button>
      </div>

      {isAdminMode ? (
        /* ADMIN FORM VIEW INTERFACE */
        <div className="max-w-2xl mx-auto py-4">
          <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">Parts Administration</h1>
          <p className="text-muted-foreground mb-6">Fill out the variables to push real auto components to live catalogs.</p>
          
          {message && <div className="p-4 mb-4 rounded-md text-sm border font-medium bg-secondary text-secondary-foreground">{message}</div>}

          <form onSubmit={handleAdminSubmit} className="space-y-4 border p-6 rounded-lg bg-card shadow-sm">
            <div>
              <label className="text-sm font-semibold uppercase">Part Name *</label>
              <input required type="text" className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Front Light Headlamp TOYOTA Prius" />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold uppercase">Price (₾) *</label>
                <input required type="number" className={inputCls} value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="120" />
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
                  <option value="">Choose category</option>
                  {getCategories().map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold uppercase">Brand *</label>
                <select required className={inputCls} value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
                  <option value="">Choose brand</option>
                  {getBrands().map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-dashed pt-4">
              <h3 className="text-sm font-bold uppercase mb-2 text-primary">Vehicle Diagnostics Compatibility</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <input type="text" className={inputCls} placeholder="Make (e.g. Toyota)" value={form.make} onChange={e => setForm({...form, make: e.target.value})} />
                <input type="text" className={inputCls} placeholder="Model (e.g. Prius)" value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 mt-2">
                <input type="number" className={inputCls} placeholder="Compatible From Year" value={form.yearStart} onChange={e => setForm({...form, yearStart: e.target.value})} />
                <input type="number" className={inputCls} placeholder="Compatible To Year" value={form.yearEnd} onChange={e => setForm({...form, yearEnd: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold uppercase">Part Image File Drop</label>
              <input type="file" accept="image/*" className={inputCls} onChange={e => setImageFile(e.target.files?.[0] || null)} />
            </div>

