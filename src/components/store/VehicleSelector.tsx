import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Car } from "lucide-react";
import { getMakes, getModels, getYears } from "@/lib/catalog";
import type { VehicleSelection } from "@/lib/catalog-types";

const selectCls =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring";

export function VehicleSelector({ initial = {}, compact = false }: { initial?: VehicleSelection; compact?: boolean }) {
  const navigate = useNavigate();
  const [make, setMake] = useState(initial.make ?? "");
  const [model, setModel] = useState(initial.model ?? "");
  const [year, setYear] = useState(initial.year ? String(initial.year) : "");
  const models = make ? getModels(make) : [];
  const years = make && model ? getYears(make, model) : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/products",
      search: (prev) => ({ ...prev, make: make || undefined, model: model || undefined, year: year ? Number(year) : undefined }),
    });
  };

  return (
    <form onSubmit={submit} className={`grid gap-3 ${compact ? "" : "sm:grid-cols-[1fr_1fr_1fr_auto]"}`}>
      <select aria-label="Make" className={selectCls} value={make} onChange={(e) => { setMake(e.target.value); setModel(""); setYear(""); }}>
        <option value="">Make</option>
        {getMakes().map((m) => <option key={m}>{m}</option>)}
      </select>
      <select aria-label="Model" className={selectCls} value={model} disabled={!make} onChange={(e) => { setModel(e.target.value); setYear(""); }}>
        <option value="">Model</option>
        {models.map((m) => <option key={m}>{m}</option>)}
      </select>
      <select aria-label="Year" className={selectCls} value={year} disabled={!model} onChange={(e) => setYear(e.target.value)}>
        <option value="">Year</option>
        {years.map((y) => <option key={y}>{y}</option>)}
      </select>
      <button type="submit" disabled={!make} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
        <Car className="h-4 w-4" /> Find parts
      </button>
    </form>
  );
}
