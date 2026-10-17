// Pure cart logic (no React, no storage) so it is easy to test and reuse.
import type { Product } from "./catalog-types";

export interface CartItem { productId: string; quantity: number }

/** Max units allowed, or undefined when no numeric stock is recorded. 0 = cannot buy. */
export function maxQuantity(p: Product | undefined): number | undefined {
  if (!p || p.stock === "out_of_stock") return 0;
  return typeof p.stockQty === "number" ? Math.max(0, Math.floor(p.stockQty)) : undefined;
}

export function hasValidPrice(p: Product | undefined): p is Product {
  return !!p && typeof p.priceGel === "number" && Number.isFinite(p.priceGel) && p.priceGel >= 0;
}

export function canPurchase(p: Product | undefined): boolean {
  return hasValidPrice(p) && maxQuantity(p) !== 0;
}

function clamp(qty: number, p: Product | undefined): number {
  const max = maxQuantity(p);
  let q = Math.max(1, Math.floor(qty));
  if (max !== undefined) q = Math.min(q, max);
  return q;
}

export function addItem(items: CartItem[], p: Product | undefined, qty = 1): CartItem[] {
  if (!p || !canPurchase(p)) return items;
  const existing = items.find((i) => i.productId === p.id);
  if (existing) return items.map((i) => (i.productId === p.id ? { ...i, quantity: clamp(i.quantity + qty, p) } : i));
  return [...items, { productId: p.id, quantity: clamp(qty, p) }];
}

export function setQuantity(items: CartItem[], p: Product | undefined, id: string, qty: number): CartItem[] {
  return items.map((i) => (i.productId === id ? { ...i, quantity: clamp(qty, p) } : i));
}

export function removeItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((i) => i.productId !== id);
}

export function totalQuantity(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.quantity, 0);
}

export function lineSubtotal(item: CartItem, p: Product | undefined): number | null {
  return canPurchase(p) ? (p as Product).priceGel * item.quantity : null;
}

/** Sum of purchasable lines only; unavailable or unpriced items are excluded. */
export function cartTotal(items: CartItem[], lookup: (id: string) => Product | undefined): number {
  const cents = items.reduce((s, i) => s + Math.round((lineSubtotal(i, lookup(i.productId)) ?? 0) * 100), 0);
  return cents / 100;
}

/** Parse untrusted localStorage content into a valid, de-duplicated cart. */
export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const map = new Map<string, number>();
    for (const d of data) {
      if (d && typeof d.productId === "string" && Number.isFinite(d.quantity) && d.quantity >= 1) {
        map.set(d.productId, (map.get(d.productId) ?? 0) + Math.floor(d.quantity));
      }
    }
    return [...map].map(([productId, quantity]) => ({ productId, quantity }));
  } catch {
    return [];
  }
}
