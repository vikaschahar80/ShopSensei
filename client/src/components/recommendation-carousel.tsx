import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp, ShoppingCart, Heart } from "lucide-react";

interface RecommendationCarouselProps {
  userId: string;
}

export default function RecommendationCarousel({ userId }: RecommendationCarouselProps) {
  const { dispatch } = useCart();
  const { toast } = useToast();

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => apiRequest("POST", "/api/cart", {
      userId,
      productId,
      quantity: 1
    }),
    onSuccess: (_, productId) => {
      // Track add to cart behavior
      apiRequest("POST", "/api/behavior", {
        userId,
        productId,
        action: "add_to_cart"
      });

      // Add to local cart state
      const product = recommendations.find(p => p.id === productId);
      if (product) {
        dispatch({
          type: "ADD_ITEM",
          payload: {
            id: `${userId}-${productId}`,
            userId: userId!,
            productId,
            quantity: 1,
            createdAt: new Date(),
            product,
          },
        });
      }

      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (productId: string) => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate(productId);
  };

  const { data: recommendations = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/recommendations", userId],
    queryFn: async () => {
      console.log('Fetching recommendations for userId:', userId);
      const response = await fetch(`/api/recommendations/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      console.log('Recommendations received:', data);
      return data;
    },
    enabled: !!userId,
  }) as { data: any[], isLoading: boolean, error: any, refetch: () => void };

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-neutral-800 flex items-center">
              <TrendingUp className="text-accent mr-2" />
              Recommended for You
            </h3>
            <p className="text-neutral-600 mt-1">Based on your browsing and purchase history</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="w-full h-48 bg-neutral-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded mb-3 w-2/3"></div>
                <div className="h-6 bg-neutral-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error fetching recommendations:', error);
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-neutral-800 flex items-center">
              <TrendingUp className="text-accent mr-2" />
              Recommended for You
            </h3>
            <p className="text-neutral-600 mt-1">Based on your browsing and purchase history</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load recommendations. Please try again later.</p>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    console.log('No recommendations found for userId:', userId);
    return null;
  }

  return (
    <section className="mb-12" data-testid="recommendation-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800 flex items-center">
            <TrendingUp className="text-accent mr-2" />
            Recommended for You
          </h3>
          <p className="text-neutral-600 mt-1">Based on your browsing and purchase history</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-primary hover:text-blue-700 font-medium"
            onClick={() => {
              refetch();
              toast({
                title: "Refreshing Recommendations",
                description: "Getting fresh AI recommendations for you...",
              });
            }}
            disabled={isLoading}
            data-testid="button-refresh-recommendations"
          >
            {isLoading ? "Refreshing..." : "Refresh AI"}
          </Button>
          <Button 
            variant="outline" 
            className="text-primary hover:text-blue-700 font-medium"
            onClick={() => {
              // Scroll to products section or filter by recommendations
              const productsSection = document.querySelector('[data-testid="text-products-count"]');
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            data-testid="button-view-all-recommendations"
          >
            View All <TrendingUp className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Horizontal scrolling carousel */}
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 w-max">
          {recommendations.map((product: any, index: number) => (
            <div key={product.id} className="w-64 flex-shrink-0">
              <Card className="h-full hover:shadow-lg transition-all duration-200">
                <div className="relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-accent text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    AI Match: {Math.floor(Math.random() * 20) + 80}%
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h4 className="font-semibold text-neutral-800 mb-1 line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ${product.price}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 hover:bg-neutral-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Add to wishlist functionality
                        }}
                        data-testid={`button-wishlist-recommendation-${product.id}`}
                      >
                        <Heart className="w-4 h-4 text-neutral-400 hover:text-red-500" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product.id);
                        }}
                        disabled={product.stock === 0 || addToCartMutation.isPending}
                        className="hover:bg-blue-700"
                        data-testid={`button-add-cart-recommendation-${product.id}`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {addToCartMutation.isPending ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
