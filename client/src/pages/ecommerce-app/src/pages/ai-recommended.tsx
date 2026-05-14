import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { RefreshCw, ShoppingCart } from 'lucide-react';
import { useCartHelpers } from '../../../../lib/cart-store';

const AIRecommended = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [recommendationType, setRecommendationType] = useState<'ai' | 'cart-based'>('ai');
  const { items: cartItems } = useCartHelpers();
  const userId = localStorage.getItem("shopai_user") ? JSON.parse(localStorage.getItem("shopai_user")!).id : "guest";

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/recommendations/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      const data = await res.json();
      setProducts(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartBasedRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get categories from cart items
      const cartCategories = new Set<string>();
      cartItems.forEach(item => {
        if (item.product.categoryId) {
          cartCategories.add(item.product.categoryId);
        }
      });

      if (cartCategories.size === 0) {
        // If no categories in cart, fall back to AI recommendations
        await fetchRecommendations();
        return;
      }

      // Fetch products from categories in cart
      const categoryPromises = Array.from(cartCategories).map(async (categoryId) => {
        const res = await fetch(`/api/products?categoryId=${categoryId}`);
        if (res.ok) {
          const data = await res.json();
          return data.filter((product: any) => 
            !cartItems.some(cartItem => cartItem.productId === product.id)
          );
        }
        return [];
      });

      const categoryResults = await Promise.all(categoryPromises);
      const allProducts = categoryResults.flat();
      
      // Remove duplicates and shuffle
      const uniqueProducts = allProducts.filter((product: any, index: number, self: any[]) => 
        index === self.findIndex((p: any) => p.id === product.id)
      );
      
      // Shuffle and take first 6
      const shuffledProducts = uniqueProducts.sort(() => Math.random() - 0.5);
      setProducts(shuffledProducts.slice(0, 6));
      setLastUpdated(new Date());
      setRecommendationType('cart-based');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchCartBasedRecommendations();
    } else {
      fetchRecommendations();
    }
  }, [userId, cartItems.length]);

  const handleRefresh = () => {
    if (cartItems.length > 0) {
      fetchCartBasedRecommendations();
    } else {
      fetchRecommendations();
    }
  };

  const handleSwitchToAI = () => {
    setRecommendationType('ai');
    fetchRecommendations();
  };

  const handleSwitchToCartBased = () => {
    setRecommendationType('cart-based');
    fetchCartBasedRecommendations();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">AI Recommended Products</h1>
          <p className="text-gray-600">
            {recommendationType === 'cart-based' 
              ? 'Recommendations based on items in your cart'
              : 'Personalized recommendations based on your browsing and shopping behavior'
            }
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {cartItems.length > 0 && (
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={handleSwitchToAI}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  recommendationType === 'ai' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                AI Recommendations
              </button>
              <button
                onClick={handleSwitchToCartBased}
                className={`px-3 py-1 rounded-md text-sm transition-colors flex items-center gap-1 ${
                  recommendationType === 'cart-based' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ShoppingCart className="w-3 h-3" />
                Cart-Based
              </button>
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">
            {recommendationType === 'cart-based' 
              ? 'Loading cart-based recommendations...'
              : 'Loading personalized recommendations...'
            }
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No recommendations available yet.</p>
          <p className="text-sm text-gray-500">
            {cartItems.length === 0 
              ? 'Start browsing products and adding items to your cart to get personalized recommendations!'
              : 'Try adding more items to your cart from different categories to get better recommendations!'
            }
          </p>
        </div>
      )}
      
      {!loading && !error && products.length > 0 && (
        <>
          {recommendationType === 'cart-based' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-blue-800 text-sm">
                💡 Showing recommendations from categories in your cart: 
                {Array.from(new Set(cartItems.map(item => item.product.categoryId).filter(Boolean))).join(', ')}
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} userId={userId} trackView={false} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AIRecommended;