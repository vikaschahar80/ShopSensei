import React, { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';

const ElectronicsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all categories to get the electronics categoryId
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categories = await categoriesRes.json();
        const electronicsCategory = categories.find((cat: any) => cat.slug === 'electronics');
        if (!electronicsCategory) throw new Error('Electronics category not found');

        // Fetch products for electronics category
        const productsRes = await fetch(`/api/products?categoryId=${electronicsCategory.id}`);
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
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Electronics</h1>
      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} userId={userId} />
        ))}
      </div>
    </div>
  );
};

export default ElectronicsPage;