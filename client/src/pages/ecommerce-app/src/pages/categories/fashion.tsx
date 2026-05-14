import React, { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';

const FashionPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { dispatch } = useCartHelpers();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categories = await categoriesRes.json();
        const fashionCategory = categories.find((cat: any) => cat.slug === 'fashion');
        if (!fashionCategory) throw new Error('Fashion category not found');

        const productsRes = await fetch(`/api/products?categoryId=${fashionCategory.id}`);
        if (!productsRes.ok) throw new Error('Failed to fetch products');
        const productsData = await productsRes.json();
        setProducts(productsData);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const userId = localStorage.getItem("shopai_user") ? JSON.parse(localStorage.getItem("shopai_user")!).id : "guest";
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Fashion</h1>
      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} userId={userId} />
        ))}
      </div>
    </div>
  );
};

export default FashionPage;