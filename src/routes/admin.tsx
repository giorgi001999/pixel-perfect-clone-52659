import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { getBrands, getCategories, conditionLabel } from '@/lib/catalog';
import { createNewProduct, uploadProductImage } from '@/lib/adminActions';

export const Route = createFileRoute('/admin')({
  component: AdminPanel,
});

function AdminPanel() {
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '',
    condition: 'new', brand: '', inStock: true,
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

      setMessage('🎉 Product uploaded successfully to PARTS.GE real catalog!');
      setForm({ name: '', description: '', price: '', category: '', condition: 'new', brand: '', inStock: true, make: '', model: '', yearStart: '', yearEnd: '' });
      setImageFile(null);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-md border p-2 text-sm bg-card mt-1";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">Parts Administration</h1>
      <p className="text-muted-foreground mb-6">Fill out the fields to publish real spare parts inventory records directly to live storefront routing.</p>
      
      {message && <div className="p-4 mb-4 rounded-md text-sm border font-medium bg-secondary">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 border p-6 rounded-lg bg-card/50">
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
              {getCategories().map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold uppercase">Brand *</label>
            <select required className={inputCls} value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
              <option value="">Choose brand</option>
              {getBrands().map(b => <option key={b}>{b}</option>)}
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

        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground h-11 font-bold rounded-md uppercase tracking-wider hover:opacity-90 disabled:opacity-50 mt-4 transition-all">
          {loading ? 'Processing Upload Asset...' : 'Publish Item to Parts.ge storefront'}
        </button>
      </form>
    </div>
  );
}
