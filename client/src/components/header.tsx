import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCartHelpers } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, Search, Mic, Heart, User, Star, LogOut, Settings } from "lucide-react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { itemCount, total, dispatch } = useCartHelpers();
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleCartClick = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm text-neutral-600 border-b border-neutral-100">
          <div className="hidden md:block">
            <span>Free shipping on orders over $75</span>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-primary">
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarImage src={user?.avatar || undefined} />
                      <AvatarFallback>
                        {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {user?.firstName || user?.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-primary">
                  <User className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-primary">
              <Heart className="w-4 h-4 mr-1" />
              Wishlist
            </Button>
          </div>
        </div>
        
        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">
                <ShoppingCart className="w-6 h-6 mr-2 inline" />
                ShopAI
              </h1>
            </Link>
          </div>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-8 relative">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-20 py-2 border-neutral-200 rounded-full focus:ring-2 focus:ring-primary focus:border-primary"
                data-testid="input-search"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  className="text-neutral-400 hover:text-primary p-1"
                  data-testid="button-voice-search"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  variant="ghost" 
                  className="text-neutral-400 hover:text-primary p-1"
                  data-testid="button-search"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
          
          {/* Cart and actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleCartClick}
              className="relative hover:text-primary"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-accent hover:bg-accent px-1.5 py-0.5 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
            <div className="hidden md:flex items-center text-sm">
              <span className="text-neutral-600">Total: </span>
              <span className="font-semibold text-primary ml-1" data-testid="text-cart-total">
                ${total}
              </span>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="border-t border-neutral-100">
           <div className="flex space-x-8 py-3 overflow-x-auto">
        <Link href="/categories/all" className="text-primary font-medium whitespace-nowrap">
          All Categories
        </Link>
        <Link href="/categories/electronics" className="text-neutral-600 hover:text-primary whitespace-nowrap transition-colors">
          Electronics
        </Link>
        <Link href="/categories/fashion" className="text-neutral-600 hover:text-primary whitespace-nowrap transition-colors">
          Fashion
        </Link>
        <Link href="/categories/home-garden" className="text-neutral-600 hover:text-primary whitespace-nowrap transition-colors">
          Home &amp; Garden
        </Link>
        <Link href="/categories/sports" className="text-neutral-600 hover:text-primary whitespace-nowrap transition-colors">
          Sports
        </Link>
        <Link href="/categories/books" className="text-neutral-600 hover:text-primary whitespace-nowrap transition-colors">
          Books
        </Link>
        <Link href="/ai-recommended" className="text-accent font-medium whitespace-nowrap">
          <Star className="w-4 h-4 mr-1 inline" />
          AI Recommended
        </Link>
      </div>
        </nav>
      </div>
    </header>
  );
}
