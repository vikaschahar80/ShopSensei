import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { CartProvider } from "./lib/cart-store";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Checkout from "@/pages/checkout";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { AuthPage } from "@/pages/auth";
import { AuthCallbackPage } from "@/pages/auth-callback";
import AllCategories from "@/pages/ecommerce-app/src/pages/categories/all";
import Electronics from "@/pages/ecommerce-app/src/pages/categories/electronics";
import Fashion from "@/pages/ecommerce-app/src/pages/categories/fashion";
import HomeGarden from "@/pages/ecommerce-app/src/pages/categories/home-garden";
import Sports from "@/pages/ecommerce-app/src/pages/categories/sports";
import Books from "@/pages/ecommerce-app/src/pages/categories/books";
import AIRecommended from "@/pages/ecommerce-app/src/pages/ai-recommended";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/callback" component={AuthCallbackPage} />
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/admin" component={Admin} />
      <Route path="/categories/all" component={AllCategories} />
      <Route path="/categories/electronics" component={Electronics} />
      <Route path="/categories/fashion" component={Fashion} />
      <Route path="/categories/home-garden" component={HomeGarden} />
      <Route path="/categories/sports" component={Sports} />
      <Route path="/categories/books" component={Books} />
      <Route path="/ai-recommended" component={AIRecommended} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
