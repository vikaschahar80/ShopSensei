import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ProductFilters from "@/components/product-filters";
import ProductCard from "@/components/product-card";
import RecommendationCarousel from "@/components/recommendation-carousel";
import CartSidebar from "@/components/cart-sidebar";
import { useCart, useCartHelpers } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, TrendingUp } from "lucide-react";

export default function Home() {
  const [filters, setFilters] = useState({
    categoryId: "",
    search: "",
    minPrice: "",
    maxPrice: "",
  });
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { dispatch } = useCart();
  const { itemCount } = useCartHelpers();

  useEffect(() => {
    const savedUser = localStorage.getItem("shopai_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      // Create a guest user for demo purposes
      const guestUser = {
        id: "guest-" + Math.random().toString(36).substr(2, 9),
        username: "Guest User",
        email: "guest@example.com",
      };
      setCurrentUser(guestUser);
      localStorage.setItem("shopai_user", JSON.stringify(guestUser));
      dispatch({ type: "SET_USER", payload: guestUser.id });
    }
  }, [dispatch]);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  }) as { data: any[] };

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const response = await fetch(`/api/products?${params}`);
      return response.json();
    },
  });

  const { data: popularProducts = [] } = useQuery({
    queryKey: ["/api/products/popular"],
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Smart Shopping with AI
              </h2>
              <p className="text-xl text-blue-100 mb-6">
                Discover products tailored to your preferences with our intelligent recommendation system
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-neutral-50"
                  data-testid="button-shop-now"
                >
                  Shop Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                  data-testid="button-watch-demo"
                >
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-current rounded-full flex items-center justify-center mr-2">
                      <div className="w-2 h-2 bg-current transform translate-x-[1px]" style={{clipPath: "polygon(0 0, 100% 50%, 0 100%)"}} />
                    </div>
                    Watch Demo
                  </div>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-white/80" />
                  </div>
                  <div className="text-lg font-medium">AI-Powered Shopping</div>
                  <div className="text-blue-100">Personalized recommendations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommendations Section */}
        {currentUser && (
          <RecommendationCarousel userId={currentUser.id} />
        )}

        {/* Products Section */}
        <section className="mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <ProductFilters 
              categories={categories}
              filters={filters}
              onFiltersChange={setFilters}
            />
            
            <div className="flex-1">
              {/* Sort and View Options */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-neutral-600" data-testid="text-products-count">
                    {products.length} products found
                  </span>
                </div>
              </div>

              {/* Products Grid */}
              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                      <div className="w-full h-48 bg-neutral-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded w-2/3 mb-4"></div>
                      <div className="h-8 bg-neutral-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">No products found</h3>
                  <p className="text-neutral-600">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product: any) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      userId={currentUser?.id} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4 flex items-center">
                <ShoppingCart className="text-primary mr-2" />
                ShopAI
              </h4>
              <p className="text-neutral-300 mb-4">
                Experience the future of shopping with AI-powered recommendations tailored just for you.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <div className="space-y-2">
                <a href="#" className="block text-neutral-300 hover:text-white transition-colors">About Us</a>
                <a href="#" className="block text-neutral-300 hover:text-white transition-colors">Contact</a>
                <a href="#" className="block text-neutral-300 hover:text-white transition-colors">FAQ</a>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Categories</h5>
              <div className="space-y-2">
                {categories.slice(0, 4).map((category: any) => (
                  <a key={category.id} href="#" className="block text-neutral-300 hover:text-white transition-colors">
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Stay Updated</h5>
              <p className="text-neutral-300 text-sm mb-4">
                Subscribe for AI-powered deals and personalized recommendations.
              </p>
            </div>
          </div>
          
          <div className="border-t border-neutral-700 mt-8 pt-8 text-center">
            <p className="text-neutral-400 text-sm">&copy; 2024 ShopAI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <CartSidebar />
    </div>
  );
}
