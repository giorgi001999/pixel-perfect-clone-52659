import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { createNewProduct, uploadProductImage } from "@/lib/adminActions";
import { getBrands, getCategories, conditionLabel } from "@/lib/catalog";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

const inputCls = "w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors mt-1";

function AdminDashboard() {
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'Brakes',
    condition: 'new_aftermarket', brand: 'Toyota', inStock: true,
    make: '', model: '', yearStart: '', yearEnd: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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

      setMessage('🎉 Success! Part listed in the dynamic database.');
      setForm({ name: '', description: '', price: '', category: 'Brakes', condition: 'new_aftermarket', brand: 'Toyota', inStock: true, make: '', model: '', yearStart: '', yearEnd: '' });
      setImageFile(null);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur top-0 sticky z-50 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-white uppercase">
            🛠️ PARTS<span class="text-orange-500">.GE</span> Control Center
          </Link>
          <Link to="/products" className="text-xs uppercase bg-zinc-800 text-zinc-300 font-bold px-3 py-1.5 rounded-md border border-zinc-700 hover:bg-zinc-700 transition-all">
            ← Storefront
          </Link>
        </div>
      </header>

      <main class="max-w-2xl mx-auto w-full px-4 py-12 flex-grow">
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold uppercase tracking-tight text-white">Inventory Management</h1>
          <p class="text-zinc-400 text-sm mt-1">Publish records directly to your active PostgreSQL database.</p>
        </div>

        {message && <div class="p-4 mb-6 rounded-md text-sm border font-medium bg-zinc-900 border-zinc-700">{message}</div>}

        <form onSubmit={handleSubmit} class="space-y-5 bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-xl">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400">Spare Part Name *</label>
            <input required type="text" class={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Front Light Headlamp TOYOTA Prius" />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400">Price (₾) *</label>
              <input required type="number" step="0.01" class={inputCls} value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="120.00" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400">Condition *</label>
              <select class={inputCls} value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                {Object.entries(conditionLabel).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400">Category *</label>
              <select required class={inputCls} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {getCategories().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400">Brand *</label>
              <select required class={inputCls} value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
                {getBrands().map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div class="border-t border-zinc-800 pt-5">
            <h3 class="text-xs font-bold uppercase text-orange-500 mb-3.5 tracking-wider">Vehicle Compatibility</h3>
            <div class="grid gap-3 sm:grid-cols-2">
              <input type="text" class={inputCls} placeholder="Make (e.g. Toyota)" value={form.make} onChange={e => setForm({...form, make: e.target.value})} />
              <input type="text" class={inputCls} placeholder="Model (e.g. Prius)" value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400">Part Image</label>
            <input type="file" accept="image/*" class={inputCls} onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} />
          </div>

          <button type="submit" disabled={loading} class="w-full bg-orange-600 text-white h-12 font-bold rounded-md uppercase tracking-wider hover:bg-orange-500 disabled:opacity-50 transition-all cursor-pointer">
            {loading ? 'Uploading Assets...' : 'Publish Asset Record'}
          </button>
        </form>
      </main>
    </div>
  );
}
