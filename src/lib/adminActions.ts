import { supabase } from './supabase';

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  brand: string;
  inStock: boolean;
  make?: string;
  model?: string;
  yearStart?: number;
  yearEnd?: number;
}

export async function uploadProductImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError.message);
    return null;
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function createNewProduct(product: ProductInput, imageUrl: string | null) {
  const { data, error } = await supabase.from('products').insert([
    {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      condition: product.condition,
      brand: product.brand,
      in_stock: product.inStock,
      make: product.make || null,
      model: product.model || null,
      year_start: product.yearStart || null,
      year_end: product.yearEnd || null,
      image_url: imageUrl,
    },
  ]);

  if (error) throw new Error(error.message);
  return data;
}
