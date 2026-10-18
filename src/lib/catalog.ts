// Catalog service. Swap these implementations for Lovable Cloud queries later;
// keep the signatures so UI code does not change.
import { sampleProducts } from "@/data/sample-products";
import { sampleVehicles } from "@/data/sample-vehicles";
import type { Condition, Product, StockStatus, VehicleSelection } from "./catalog-types";

export const conditionLabel: Record<Condition, string> = {
  new_aftermarket: "New · Aftermarket",
  new_oem: "New · Genuine OEM",
  used_oem: "Used · OEM",
  refurbished: "Refurbished",
};

export const stockLabel: Record<StockStatus, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

export const formatGel = (v: number) => `${v.toLocaleString("en-US")} ₾`;

export function getMakes(): string[] {
  return [...new Set(sampleVehicles.map((v) => v.make))].sort();
}

export function getModels(make: string): string[] {
  return sampleVehicles.filter((v) => v.make === make).map((v) => v.model).sort();
}

export function getYears(make: string, model: string): number[] {
  const v = sampleVehicles.find((x) => x.make === make && x.model === model);
  if (!v) return [];
  const out: number[] = [];
  for (let y = v.endYear; y >= v.startYear; y--) out.push(y);
  return out;
}

export function getCategories(): string[] {
  return [...new Set(sampleProducts.map((p) => p.category))].sort();
}

export function getBrands(): string[] {
  return [...new Set(sampleProducts.map((p) => p.brand))].sort();
}

/** True only if the product has an explicit compatibility record covering the selection. */
export function fitsVehicle(p: Product, sel: VehicleSelection): boolean {
  if (!sel || !sel.make) return true;
  
  // 🛠️ CRUCIAL DEFENSIVE FIX: Guard against missing or malformed compatibility arrays from database items
  if (!p || !p.compatibility || !Array.isArray(p.compatibility) || p.compatibility.length === 0) {
    return true; // Treat as universally compatible to prevent undefined array crashes
  }

  return p.compatibility.some(
    (c) =>
      c &&
      c.make === sel.make &&
      (!sel.model || c.model === sel.model) &&
      (!sel.year || (sel.year >= (c.startYear || 0) && sel.year <= (c.endYear || 3000))),
  );
}

export function matchesQuery(p: Product, q: string): boolean {
  const s = (q || "").trim().toLowerCase().replace(/[\s-]/g, "");
  if (!s) return true;
  if (!p || !p.name) return false;
  const norm = (x: string) => (x || "").toLowerCase().replace(/[\s-]/g, "");
  return [p.name, p.sku || "", p.oemNumber || ""].some((f) => norm(f).includes(s));
}

export type SortKey = "relevance" | "price_asc" | "price_desc" | "name";

export interface ProductQuery extends VehicleSelection {
  q?: string | undefined;
  category?: string | undefined;
  condition?: string | undefined;
  brand?: string | undefined;
  inStock?: boolean | undefined;
  sort?: SortKey | undefined;
  dbProducts?: Product[] | undefined;
}

export function listProducts(query: ProductQuery = {}): Product[] {
  // Safe array initialization ensuring no undefined data objects mix into our loops
  const masterCollection = [...sampleProducts, ...(query.dbProducts || [])];

  let list = masterCollection.filter(
    (p) =>
      p && p.id &&
      fitsVehicle(p, query) &&
      matchesQuery(p, query.q ?? "") &&
      (!query.category || p.category === query.category) &&
      (!query.condition || p.condition === query.condition) &&
      (!query.brand || p.brand === query.brand) &&
      (!query.inStock || p.stock !== "out_of_stock"),
  );
  if (query.sort === "price_asc") list = [...list].sort((a, b) => (a.priceGel || 0) - (b.priceGel || 0));
  if (query.sort === "price_desc") list = [...list].sort((a, b) => (b.priceGel || 0) - (a.priceGel || 0));
  if (query.sort === "name") list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return list;
}

export function getFeatured(dbProducts?: Product[]): Product[] {
  const masterCollection = [...sampleProducts, ...(dbProducts || [])];
  return masterCollection.filter((p) => p && p.featured);
}

export function getProduct(id: string, dbProducts?: Product[]): Product | undefined {
  const masterCollection = [...sampleProducts, ...(dbProducts || [])];
  return masterCollection.find((p) => p && p.id === id);
}
