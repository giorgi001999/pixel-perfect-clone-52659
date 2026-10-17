export type Condition = "new_aftermarket" | "new_oem" | "used_oem" | "refurbished";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Vehicle { make: string; model: string; startYear: number; endYear: number }

export interface Compatibility { make: string; model: string; startYear: number; endYear: number }

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  oemNumber: string;
  priceGel: number;
  condition: Condition;
  images: string[];
  stock: StockStatus;
  compatibility: Compatibility[];
  featured?: boolean;
}

export interface VehicleSelection { make?: string | undefined; model?: string; year?: number | undefined }
