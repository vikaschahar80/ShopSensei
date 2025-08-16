import React, { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';

const BooksPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all categories to get the books categoryId
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categories = await categoriesRes.json();
        const booksCategory = categories.find((cat: any) => cat.slug === 'books');
        
        if (booksCategory) {
          // Fetch products for books category
          const productsRes = await fetch(`/api/products?categoryId=${booksCategory.id}`);
          if (!productsRes.ok) throw new Error('Failed to fetch products');
          const productsData = await productsRes.json();
          setProducts(productsData);
        } else {
          // If no books category exists, show some sample books
          setProducts([
            {
              id: 1,
              name: 'The Great Gatsby',
              description: 'F. Scott Fitzgerald',
              price: "10.99",
              imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
              stock: 25,
              rating: "4.5",
              reviewCount: 89,
            },
            {
              id: 2,
              name: '1984',
              description: 'George Orwell',
              price: "8.99",
              imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
              stock: 30,
              rating: "4.7",
              reviewCount: 156,
            },
            {
              id: 3,
              name: 'To Kill a Mockingbird',
              description: 'Harper Lee',
              price: "12.99",
              imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
              stock: 20,
              rating: "4.8",
              reviewCount: 234,
            },
            {
              id: 4,
              name: 'The Catcher in the Rye',
              description: 'J.D. Salinger',
              price: "9.99",
              imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
              stock: 15,
              rating: "4.4",
              reviewCount: 78,
            },
            {
              id: 5,
              name: 'Pride and Prejudice',
              description: 'Jane Austen',
              price: "11.99",
              imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
              stock: 35,
              rating: "4.6",
              reviewCount: 189,
            },
          ]);
        }
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
      <h1 className="text-2xl font-bold mb-4">Books</h1>
      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} userId={userId} />
        ))}
      </div>
    </div>
  );
};

export default BooksPage;