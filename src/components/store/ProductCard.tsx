import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { conditionLabel, formatGel, stockLabel } from "@/lib/catalog";
import type { Product, StockStatus } from "@/lib/catalog-types";

const stockCls: Record<StockStatus, string> = {
  in_stock: "text-success",
  low_stock: "text-warning",
  out_of_stock: "text-destructive",
};

export function StockBadge({ stock }: { stock: StockStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${stockCls[stock]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {stockLabel[stock]}
    </span>
  );
}

export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  return product.images[0] ? (
    <img src={product.images[0]} alt={product.name} className={`object-cover ${className}`} loading="lazy" />
  ) : (
    <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
      <Package className="h-10 w-10" strokeWidth={1.25} />
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/products/$productId"
      params={{ productId: product.id }}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <ProductImage product={product} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{product.brand}</span>
          <span className="rounded bg-accent px-1.5 py-0.5 text-accent-foreground">{conditionLabel[product.condition]}</span>
        </div>
        <h3 className="text-lg font-semibold leading-tight group-hover:text-primary">{product.name}</h3>
        <p className="font-mono text-xs text-muted-foreground">OEM {product.oemNumber}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="font-display text-2xl font-bold">{formatGel(product.priceGel)}</span>
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </Link>
  );
}
