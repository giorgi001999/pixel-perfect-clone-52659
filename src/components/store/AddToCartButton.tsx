import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { canPurchase, maxQuantity } from "@/lib/cart-logic";
import type { Product } from "@/lib/catalog-types";

export function AddToCartButton({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(t);
  }, [added]);

  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const max = maxQuantity(product);
  const atMax = max !== undefined && max > 0 && inCart >= max;
  const disabled = !canPurchase(product) || atMax;
  const label = !canPurchase(product) ? "Unavailable" : atMax ? "Max in cart" : added ? "Added" : "Add to cart";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => { add(product.id); setAdded(true); }}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground ${size === "lg" ? "h-12 px-8" : "h-9 w-full px-3 text-sm"}`}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {label}
    </button>
  );
}
