import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useCart, useCartHelpers } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, Trash2 } from "lucide-react";

export default function CartSidebar() {
  const { items, isOpen, total, dispatch } = useCartHelpers();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      apiRequest("PUT", `/api/cart/${id}`, { quantity }),
    onSuccess: () => {
      // Local state is updated optimistically
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cart/${id}`),
    onSuccess: () => {
      // Local state is updated optimistically
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }

    // Update local state optimistically
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: newQuantity } });
    
    // Update on server
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: string) => {
    // Update local state optimistically
    dispatch({ type: "REMOVE_ITEM", payload: id });
    
    // Remove on server
    removeItemMutation.mutate(id);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: "TOGGLE_CART" });
    setLocation("/checkout");
  };

  const handleContinueShopping = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
        onClick={() => dispatch({ type: "TOGGLE_CART" })}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="cart-sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold">Shopping Cart</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => dispatch({ type: "TOGGLE_CART" })}
              data-testid="button-close-cart"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-600 mb-4">Your cart is empty</p>
                <Button onClick={handleContinueShopping} data-testid="button-continue-shopping-empty">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center space-x-4 border-b border-neutral-100 pb-4"
                    data-testid={`cart-item-${item.productId}`}
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-800">{item.product.name}</h4>
                      <p className="text-sm text-neutral-600">{item.product.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 p-0"
                            data-testid={`button-decrease-${item.productId}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm min-w-[2rem] text-center" data-testid={`text-quantity-${item.productId}`}>
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 p-0"
                            data-testid={`button-increase-${item.productId}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="font-semibold text-primary" data-testid={`text-item-price-${item.productId}`}>
                          ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-neutral-400 hover:text-red-500 p-1"
                      data-testid={`button-remove-${item.productId}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary" data-testid="text-cart-total-sidebar">${total}</span>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                data-testid="button-checkout"
              >
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleContinueShopping}
                data-testid="button-continue-shopping"
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
