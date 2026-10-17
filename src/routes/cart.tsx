import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/store/ProductCard";
import { useCart } from "@/lib/cart-context";
import { canPurchase, lineSubtotal, maxQuantity } from "@/lib/cart-logic";
import { formatGel, getProduct } from "@/lib/catalog";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — PARTS.GE" },
      { name: "description", content: "Review the car parts in your cart." },
      { property: "og:title", content: "Your Cart — PARTS.GE" },
      { property: "og:description", content: "Review the car parts in your cart." },
    ],
  }),
  component: CartPage,
});

const qtyBtn = "flex h-9 w-9 items-center justify-center hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent";

function CartPage() {
  const { items, hydrated, total, count, setQty, remove } = useCart();

  if (!hydrated) return <div className="mx-auto max-w-7xl px-4 py-16 text-muted-foreground">Loading cart…</div>;

  if (!items.length) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" strokeWidth={1.25} />
        <h1 className="mt-4 text-3xl font-bold uppercase">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Select your vehicle and find parts that fit.</p>
        <Link to="/products" className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90">
          Browse parts
        </Link>
      </div>
    );
  }

  const hasUnavailable = items.some((i) => !canPurchase(getProduct(i.productId)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-4xl font-bold uppercase">Your cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y rounded-lg border bg-card">
          {items.map((item) => {
            const p = getProduct(item.productId);
            const ok = canPurchase(p);
            const max = maxQuantity(p);
            const sub = lineSubtotal(item, p);
            return (
              <li key={item.productId} className="flex gap-4 p-4">
                {p ? (
                  <ProductImage product={p} className="h-20 w-20 shrink-0 rounded-md sm:h-24 sm:w-24" />
                ) : (
                  <div className="h-20 w-20 shrink-0 rounded-md bg-muted sm:h-24 sm:w-24" />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    {p ? (
                      <Link to="/products/$productId" params={{ productId: p.id }} className="font-semibold hover:text-primary">{p.name}</Link>
                    ) : (
                      <span className="font-semibold">Unknown product</span>
                    )}
                    {p && <p className="font-mono text-xs text-muted-foreground">SKU {p.sku} · OEM {p.oemNumber}</p>}
                    <p className="text-sm text-muted-foreground">
                      {ok && p ? `${formatGel(p.priceGel)} each` : <span className="text-destructive">No longer available — remove to continue</span>}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    {ok && (
                      <div className="flex items-center rounded-md border">
                        <button aria-label="Decrease quantity" className={qtyBtn} disabled={item.quantity <= 1} onClick={() => setQty(item.productId, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium" aria-label="Quantity">{item.quantity}</span>
                        <button aria-label="Increase quantity" className={qtyBtn} disabled={max !== undefined && item.quantity >= max} onClick={() => setQty(item.productId, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <span className="w-24 text-right font-display text-xl font-bold">{sub === null ? "—" : formatGel(sub)}</span>
                    <button aria-label="Remove item" onClick={() => remove(item.productId)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit space-y-4 rounded-lg border bg-card p-5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Items</span><span>{count}</span>
          </div>
          <div className="flex items-end justify-between border-t pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-display text-3xl font-bold" data-testid="cart-total">{formatGel(total)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Delivery cost will be confirmed at checkout.</p>
          <button disabled className="h-12 w-full cursor-not-allowed rounded-md bg-muted font-semibold text-muted-foreground">
            Proceed to checkout
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Checkout is coming soon — no orders can be placed yet.
            {hasUnavailable && " Remove unavailable items first."}
          </p>
        </aside>
      </div>
    </div>
  );
}
