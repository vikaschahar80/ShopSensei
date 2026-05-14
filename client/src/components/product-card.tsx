import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  userId?: string;
}

export default function ProductCard({ product, userId }: ProductCardProps) {
  const { dispatch } = useCart();
  const { toast } = useToast();

  // Track product view
  const trackViewMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/behavior", {
      userId,
      productId: product.id,
      action: "view"
    }),
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/cart", {
      userId,
      productId: product.id,
      quantity: 1
    }),
    onSuccess: () => {
      // Track add to cart behavior
      apiRequest("POST", "/api/behavior", {
        userId,
        productId: product.id,
        action: "add_to_cart"
      });

      // Add to local cart state
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: `${userId}-${product.id}`,
          userId: userId!,
          productId: product.id,
          quantity: 1,
          createdAt: new Date(),
          product,
        },
      });

      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
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

  const handleAddToCart = () => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate();
  };

  const handleView = () => {
    if (userId) {
      trackViewMutation.mutate();
    }
  };

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount 
    ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
      onClick={handleView}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
          loading="lazy"
        />
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full p-0"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Add to wishlist functionality
          }}
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart className="w-4 h-4 text-neutral-400 hover:text-red-500" />
        </Button>
        
        {hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500">
            {discountPercent}% Off
          </Badge>
        )}
        
        {product.stock === 0 && (
          <Badge className="absolute top-3 left-3 bg-neutral-500 hover:bg-neutral-500">
            Out of Stock
          </Badge>
        )}
        
        {!hasDiscount && product.stock && product.stock > 0 && product.stock < 10 && (
          <Badge className="absolute top-3 left-3 bg-accent hover:bg-accent">
            Low Stock
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h4 className="font-semibold text-neutral-800 mb-2 line-clamp-2" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h4>
        
        <div className="flex items-center mb-2">
          <div className="flex text-accent mr-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(parseFloat(product.rating || "0"))
                    ? "fill-current"
                    : "text-neutral-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-neutral-600" data-testid={`text-product-reviews-${product.id}`}>
            ({product.reviewCount} reviews)
          </span>
        </div>
        
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
              ${product.price}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-500 line-through ml-2">
                ${product.originalPrice}
              </span>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={product.stock === 0 || addToCartMutation.isPending}
            className="hover:bg-blue-700"
            data-testid={`button-add-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
        
        {product.stock && product.stock > 0 && product.stock < 5 && (
          <p className="text-xs text-amber-600 mt-2">
            Only {product.stock} left in stock!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
