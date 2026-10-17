import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct } from "./catalog";
import * as C from "./cart-logic";

const STORAGE_KEY = "partsge.cart.v1";

interface CartCtx {
  items: C.CartItem[];
  hydrated: boolean;
  count: number;
  total: number;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<C.CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(C.parseStoredCart(localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(C.parseStoredCart(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((id: string, qty = 1) => setItems((s) => C.addItem(s, getProduct(id), qty)), []);
  const setQty = useCallback((id: string, qty: number) => setItems((s) => C.setQuantity(s, getProduct(id), id, qty)), []);
  const remove = useCallback((id: string) => setItems((s) => C.removeItem(s, id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, hydrated, count: C.totalQuantity(items), total: C.cartTotal(items, getProduct), add, setQty, remove, clear }),
    [items, hydrated, add, setQty, remove, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
