import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../../../../lib/cart-store';
import { useToast } from '../../../../hooks/use-toast';

interface ProductCardProps {
  product: {
    id?: number | string;
    name?: string;
    title?: string;
    image?: string;
    imageUrl?: string;
    price: number | string;
    originalPrice?: number | string;
    description?: string;
    author?: string;
    category?: string;
    categoryId?: string | null;
    stock?: number;
    rating?: string;
    reviewCount?: number;
  };
  userId?: string;
  trackView?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, userId, trackView }) => {
  const { dispatch } = useCart();
  const { toast } = useToast();

  // Support both 'name' and 'title', 'image' and 'imageUrl', 'description' or fallback
  const title = product.name || product.title || '';
  const image = product.image || product.imageUrl || '';
  const description = product.description || product.author || product.category || '';
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const originalPrice = product.originalPrice 
    ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice)
    : null;
  
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Track product view when component mounts (unless disabled)
  React.useEffect(() => {
    if (trackView === false) return;
    if (userId && product.id) {
      fetch('/api/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: product.id,
          action: 'view'
        }),
      }).catch(console.error); // Silently fail for view tracking
    }
  }, [trackView, userId, product.id]);

  const handleAddToCart = async () => {
    try {
      // Add to server cart
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'guest',
          productId: product.id,
          quantity: 1,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to add to cart');

      // Track add to cart behavior
      if (userId && product.id) {
        fetch('/api/behavior', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            productId: product.id,
            action: 'add_to_cart'
          }),
        }).catch(console.error);
      }

      // Add to local cart state (preserve categoryId for cart-based recommendations)
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: `${userId || 'guest'}-${String(product.id)}`,
          userId: userId || 'guest',
          productId: String(product.id),
          quantity: 1,
          createdAt: new Date(),
          product: {
            id: String(product.id),
            name: title,
            description: description,
            price: price.toString(),
            originalPrice: originalPrice?.toString() || null,
            imageUrl: image,
            categoryId: product.categoryId ?? null,
            stock: product.stock || null,
            rating: product.rating || null,
            reviewCount: product.reviewCount || null,
            tags: null,
            features: null,
            isActive: true,
            createdAt: new Date(),
          },
        },
      });

      toast({
        title: "Added to Cart",
        description: `${title} has been added to your cart.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement wishlist functionality
    toast({
      title: "Wishlist",
      description: "Wishlist functionality coming soon!",
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
      <div className="relative">
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full p-0 flex items-center justify-center"
        >
          <Heart className="w-4 h-4 text-neutral-400 hover:text-red-500" />
        </button>
        
        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {discountPercent}% Off
          </div>
        )}
        
        {/* Out of stock badge */}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 bg-neutral-500 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        
        {/* Price display */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">
              ${price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${originalPrice!.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Add to cart button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={product.stock === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
        
        {/* Stock warning */}
        {product.stock && product.stock > 0 && product.stock < 5 && (
          <p className="text-xs text-amber-600">
            Only {product.stock} left in stock!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;