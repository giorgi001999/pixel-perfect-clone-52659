
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { ProductImage, StockBadge } from "@/components/store/ProductCard";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { conditionLabel, formatGel, getProduct } from "@/lib/catalog";
import type { Condition, Product } from "@/lib/catalog-types";

const validConditions: Condition[] = [
  "new_aftermarket",
  "new_oem",
  "used_oem",
  "refurbished",
];

export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params }) => {
    // Keep existing sample products working.
    const sample = getProduct(params.productId);
    if (sample) return { product: sample };

    // Fetch products added through Supabase.
    if (!supabase) throw notFound();

    const { data: p, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.productId)
      .maybeSingle();

    if (error) {
      console.error("Failed to load product:", error);
      throw error;
    }

    if (!p) throw notFound();

    const condition: Condition = validConditions.includes(p.condition)
      ? p.condition
      : "new_aftermarket";

    const images = Array.isArray(p.images)
      ? p.images.filter(
          (image: unknown): image is string =>
            typeof image === "string" && image.trim().length > 0
        )
      : [];

    const imageUrl =
      images[0] ||
      (typeof p.image_url === "string" && p.image_url.trim()
        ? p.image_url
        : "/placeholder.svg");

    const hasMake = Boolean(p.make && String(p.make).trim());

    // Convert the database row to the Product shape used by the store.
    const product = {
      id: String(p.id),
      name: p.name || "Unnamed Component",
      sku: String(p.sku || p.id).slice(0, 8).toUpperCase(),
      oemNumber: String(p.oem_number || p.id).toUpperCase(),
      priceGel: Number(p.price) || 0,
      stock: p.in_stock
        ? ("in_stock" as const)
        : ("out_of_stock" as const),
      images: images.length ? images : [imageUrl],
      image: imageUrl,
      imageUrl,
      condition,
      brand: p.brand || "Generic",
      category: p.category || "Other",
      description: p.description || "",
      featured: Boolean(p.featured),
      compatibility: hasMake
        ? [
            {
              make: String(p.make),
              model: String(p.model || ""),
              startYear: Number(p.year_start) || 1990,
              endYear: Number(p.year_end) || 2026,
            },
          ]
        : [
            {
              make: "Universal",
              model: "All Models",
              startYear: 1990,
              endYear: 2026,
            },
          ],
    } satisfies Product;

    return { product };
  },

  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p
      ? `${p.name} (${p.oemNumber}) — PARTS.GE`
      : "Part not found — PARTS.GE";
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
      <Link
        to="/products"
        className="mt-4 inline-block text-primary hover:underline"
      >
        Back to all parts
      </Link>
    </div>
  ),

  component: Detail,
});

function Detail() {
  const { product: p } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        to="/products"
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← All parts
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <ProductImage
          product={p}
          className="aspect-square w-full rounded-lg border"
        />

        <div>
          <p className="text-sm text-muted-foreground">
            {p.brand} · {p.category}
          </p>

          <h1 className="mt-1 text-4xl font-bold uppercase">{p.name}</h1>

          <dl className="mt-4 grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">SKU</dt>
            <dd className="font-mono">{p.sku}</dd>

            <dt className="text-muted-foreground">OEM number</dt>
            <dd className="font-mono">{p.oemNumber}</dd>

            <dt className="text-muted-foreground">Condition</dt>
            <dd>{conditionLabel[p.condition]}</dd>
          </dl>

          <div className="mt-6 flex items-center gap-4">
            <span className="font-display text-4xl font-bold">
              {formatGel(p.priceGel)}
            </span>
            <StockBadge stock={p.stock} />
          </div>

          <div className="mt-4">
            <AddToCartButton product={p} size="lg" />
          </div>

          <p className="mt-6 leading-relaxed">{p.description}</p>

          <h2 className="mt-8 text-xl font-bold uppercase">
            Confirmed compatible vehicles
          </h2>

          <ul className="mt-2 divide-y rounded-lg border bg-card text-sm">
            {p.compatibility.map((c, i) => (
              <li
                key={i}
                className="flex justify-between px-4 py-2.5"
              >
                <span>{c.make} {c.model}</span>
                <span className="text-muted-foreground">
                  {c.startYear}–{c.endYear}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-xs text-muted-foreground">
            Only vehicles listed above are confirmed. Contact us if unsure.
          </p>
        </div>
      </div>
    </div>
  );
}
