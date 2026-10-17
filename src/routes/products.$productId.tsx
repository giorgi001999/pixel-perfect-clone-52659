import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProductImage, StockBadge } from "@/components/store/ProductCard";
import { conditionLabel, formatGel, getProduct } from "@/lib/catalog";

export const Route = createFileRoute("/products/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} (${p.oemNumber}) — PARTS.GE` : "Part not found — PARTS.GE";
    const desc = p?.description ?? "This part is unavailable.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Part not found</h1>
      <Link to="/products" className="mt-4 inline-block text-primary hover:underline">Back to all parts</Link>
    </div>
  ),
  component: Detail,
});

function Detail() {
  const { product: p } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link to="/products" className="text-sm text-muted-foreground hover:text-primary">← All parts</Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <ProductImage product={p} className="aspect-square w-full rounded-lg border" />
        <div>
          <p className="text-sm text-muted-foreground">{p.brand} · {p.category}</p>
          <h1 className="mt-1 text-4xl font-bold uppercase">{p.name}</h1>
          <dl className="mt-4 grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">SKU</dt><dd className="font-mono">{p.sku}</dd>
            <dt className="text-muted-foreground">OEM number</dt><dd className="font-mono">{p.oemNumber}</dd>
            <dt className="text-muted-foreground">Condition</dt><dd>{conditionLabel[p.condition]}</dd>
          </dl>
          <div className="mt-6 flex items-center gap-4">
            <span className="font-display text-4xl font-bold">{formatGel(p.priceGel)}</span>
            <StockBadge stock={p.stock} />
          </div>
          <p className="mt-6 leading-relaxed">{p.description}</p>
          <h2 className="mt-8 text-xl font-bold uppercase">Confirmed compatible vehicles</h2>
          <ul className="mt-2 divide-y rounded-lg border bg-card text-sm">
            {p.compatibility.map((c, i) => (
              <li key={i} className="flex justify-between px-4 py-2.5">
                <span>{c.make} {c.model}</span>
                <span className="text-muted-foreground">{c.startYear}–{c.endYear}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Only vehicles listed above are confirmed. Contact us if unsure.</p>
        </div>
      </div>
    </div>
  );
}
