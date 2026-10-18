import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { conditionLabel, getBrands, getCategories, listProducts, type SortKey } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/catalog-types";

const schema = z.object({
  q: z.string().optional().catch(undefined),
  make: z.string().optional().catch(undefined),
  model: z.string().optional().catch(undefined),
  year: z.coerce.number().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  condition: z.string().optional().catch(undefined),
  brand: z.string().optional().catch(undefined),
  inStock: z.boolean().optional().catch(undefined),
  sort: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/products/")({
  validateSearch: (s) => schema.parse(s),
  head: () => ({
    meta: [
      { title: "Shop Car Parts — PARTS.GE" },
      { name: "description", content: "Browse and filter car parts by vehicle, category, brand and condition." },
    ],
  }),
  component: Listing,
});

const selCls = "h-10 w-full rounded-md border border-input bg-card px-3 text-sm";

function Listing() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/products/" });
  const set = (patch: Partial<typeof s>) => navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  // Automatically load real database parts uploaded via the admin panel
  useEffect(() => {
    async function loadLiveParts() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        if (data) {
          // Format raw PostgreSQL fields to align seamlessly with Lovable's Product type structure
          const formatted: Product[] = data.map((p: any) => ({
            id: p.id || String(Math.random()),
            name: p.name || "Unnamed Component",
            sku: String(p.id || '').slice(0, 8).toUpperCase(),
            oemNumber: String(p.id || '').slice(0, 10).toUpperCase(),
            priceGel: Number(p.price) || 0,
            category: p.category || "Other",
            condition: (p.condition || 'new_aftermarket') as any,
            brand: p.brand || "Generic",
            stock: p.in_stock ? "in_stock" : "out_of_stock",
            imageUrl: p.image_url || undefined,
            featured: false,
            compatibility: p.make ? [{
              make: p.make,
              model: p.model || "",
              startYear: Number(p.year_start) || 2000,
              endYear: Number(p.year_end) || 2026
            }] : []
          }));
          setDbProducts(formatted);
        }
      } catch (err) {
        console.error("Database alignment fallback log:", err);
      }
    }
    loadLiveParts();
  }, []);

  // Inject real dbProducts array straight into the static search pipeline
  const products = listProducts({ ...s, sort: s.sort as SortKey, dbProducts }) || [];
  const vehicle = [s.make, s.model, s.year].filter(Boolean).join(" ");
