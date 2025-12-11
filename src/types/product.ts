export type ProductCategory = 
  | "preenchedores" 
  | "toxinas" 
  | "fios" 
  | "bioestimuladores" 
  | "insumos";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  badge?: "bestseller" | "promotion" | "new";
}

export interface CartItem extends Product {
  quantity: number;
}
