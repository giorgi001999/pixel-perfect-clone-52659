import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { conditionLabel, listProducts } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";
import { createNewProduct, uploadProductImage } from "@/lib/adminActions";
import type { Product } from "@/lib/catalog-types";

export const Route = createFileRoute("/")({
  component: Index,
});

const inputCls = "w-full rounded-md border p-2 text-sm bg-card mt-1 text-foreground";

function Index() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '',
    condition: 'new_aftermarket', brand: '', inStock: true,
    make: '', model: '', yearStart: '', yearEnd: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadLiveParts() {
      try {
        if (!supabase) return;
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
            condition: (p.condition || 'new_aftermarket') as any,
            brand: p.brand,
            stock: p.in_stock ? "in_stock" : "out_of_stock",
            imageUrl: p.image_url || undefined,
            featured: true,
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
        console.error("Supabase sync issue:", err);
      }
    }
    loadLiveParts();
  }, [message]);

  // Safe execution of catalog list combining filters and dynamic fallback structures
  const baseItems = listProducts({ dbProducts: dbProducts || [] }) || [];
  const featuredProducts = baseItems.filter(p => p && p.id) || [];

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
      {/* Admin Panel Deck Command Header */}
      <div className="flex items-center justify-between bg-muted border p-4 rounded-lg mb-8">
        <div>
          <h4 className="font-bold text-sm uppercase">Catalog Control Deck</h4>
          <p className="text-xs text-muted-foreground">Switch views to upload real data records dynamically or browse the storefront home screen.</p>
        </div>
        <button type="button" onClick={() => setIsAdminMode(!isAdminMode)} className="bg-primary text-primary-foreground text-xs font-bold uppercase px-4 py-2 rounded cursor-pointer">
          {isAdminMode ? "⚡ View Storefront Home" : "🛠️ Open Panel"}
        </button>
      </div>

      {isAdminMode ? (
        /* ADMIN FORM VIEW INTERFACE */
        <div className="max-w-2xl mx-auto py-4">
          <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">Parts Administration</h1>
          <p className="text-muted-foreground mb-6">Publish real auto components to live catalogs.</p>
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
                  <option value="Brakes">Brakes</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Engine">Engine</option>
                  <option value="Filters">Filters</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Suspension">Suspension</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold uppercase">Brand *</label>
                <select required className={inputCls} value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
                  <option value="Toyota">Toyota</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Brembo">Brembo</option>
                  <option value="Aisin">Aisin</option>
                  <option value="Mann-Filter">Mann-Filter</option>
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
              <input type="file" accept="image/*" className={inputCls} onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground h-11 font-bold rounded uppercase cursor-pointer">
              {loading ? 'Uploading...' : 'Publish Part'}
            </button>
          </form>
        </div>
      ) : (
        /* STANDARD HOMEPAGE STOREFRONT VIEW */
        <div className="space-y-12">
          <section className="text-center py-12 bg-muted/30 rounded-xl border px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">The right part. Guaranteed fit.</h1>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Select your vehicle to see only parts with confirmed compatibility.</p>
            <div className="max-w-3xl mx-auto bg-card p-4 rounded-lg shadow-sm border">
              <VehicleSelector initial={{}} compact={false} />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-wide">Featured Parts Inventory</h2>
              <Link to="/products" className="text-sm text-primary font-semibold hover:underline">View all catalog →</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((p) => p && p.id ? (
                <ProductCard key={p.id} product={p} />
              ) : null)}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
