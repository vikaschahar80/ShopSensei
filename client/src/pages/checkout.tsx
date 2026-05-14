import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCartHelpers, useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG";

if (!STRIPE_PUBLIC_KEY || STRIPE_PUBLIC_KEY === "pk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG") {
  console.warn('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
  console.log('Please replace the placeholder key with your actual Stripe publishable key');
}

const stripePromise = STRIPE_PUBLIC_KEY && STRIPE_PUBLIC_KEY !== "pk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG" ? 
  loadStripe(STRIPE_PUBLIC_KEY) : null;

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { items, total, userId, dispatch } = useCartHelpers();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !userId) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Create order
        await apiRequest("POST", "/api/orders", {
          userId,
          total: parseFloat(total),
          status: "paid",
          items: items.map(item => ({
            productId: item.productId,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          }))
        });

        // Clear cart
        await apiRequest("DELETE", `/api/cart/user/${userId}`);
        dispatch({ type: "CLEAR_CART" });

        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase! Order confirmation sent to your email.",
        });

        // Redirect to home after success
        setTimeout(() => setLocation("/"), 2000);
      }
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Order Summary */}
      <div className="order-2 lg:order-1">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4" data-testid={`order-item-${item.productId}`}>
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-neutral-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-primary" data-testid="text-order-total">${total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Form */}
      <div className="order-1 lg:order-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" data-testid="input-first-name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" data-testid="input-last-name" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" data-testid="input-email" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Payment Information</h4>
                <PaymentElement />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!stripe || !elements || isProcessing}
                data-testid="button-complete-payment"
              >
                {isProcessing ? "Processing..." : `Complete Payment - $${total}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const { total, items } = useCartHelpers();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Your cart is empty. Add items to proceed with checkout.",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: parseFloat(total),
      currency: "usd" 
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error(data.message || "Failed to create payment intent");
        }
      })
      .catch((error) => {
        toast({
          title: "Payment Setup Failed",
          description: error.message || "Unable to setup payment. Please check your Stripe configuration.",
          variant: "destructive",
        });
      });
  }, [total, items.length, toast, setLocation]);

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Configuration Required</h2>
              <p className="text-neutral-600 mb-4">
                Stripe payment is not configured. Please add your Stripe keys to enable checkout.
              </p>
              <Button onClick={() => setLocation("/")} data-testid="button-back-home">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" aria-label="Loading"/>
          <p className="text-neutral-600">Setting up your payment...</p>
        </div>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back-shopping"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Shopping
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-neutral-600 mt-2">Complete your purchase securely</p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
