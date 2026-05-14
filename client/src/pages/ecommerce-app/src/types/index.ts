export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  products: Product[];
}

export interface AiRecommendation {
  productId: string;
  reason: string;
}