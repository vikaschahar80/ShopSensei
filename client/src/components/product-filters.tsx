import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star } from "lucide-react";

interface ProductFiltersProps {
  categories: any[];
  filters: {
    categoryId: string;
    search: string;
    minPrice: string;
    maxPrice: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function ProductFilters({ 
  categories, 
  filters, 
  onFiltersChange 
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [selectedRating, setSelectedRating] = useState("");

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCategoryToggle = (categoryId: string) => {
    // If the same category is clicked, clear the filter
    if (localFilters.categoryId === categoryId) {
      handleFilterChange("categoryId", "");
    } else {
      // Otherwise, select the new category
      handleFilterChange("categoryId", categoryId);
    }
  };

  const handlePriceFilter = () => {
    onFiltersChange(localFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      categoryId: "",
      search: "",
      minPrice: "",
      maxPrice: "",
    };
    setLocalFilters(clearedFilters);
    setSelectedRating("");
    onFiltersChange(clearedFilters);
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Filters
            {(localFilters.categoryId || localFilters.search || localFilters.minPrice || localFilters.maxPrice) && (
              <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-3 block">
              Search Products
            </Label>
            <Input
              type="text"
              placeholder="Search by name, description, or tags..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="text-sm"
              data-testid="input-search-products"
            />
          </div>

          {/* Categories */}
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-3 block">
              Categories
            </Label>
            <div className="space-y-2">
              <Button
                variant={localFilters.categoryId === "" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => handleCategoryToggle("")}
                data-testid="button-category-all"
              >
                Show All Categories
                {localFilters.categoryId === "" && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={localFilters.categoryId === category.id ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => handleCategoryToggle(category.id)}
                  data-testid={`button-category-${category.slug}`}
                >
                  {category.name}
                  {localFilters.categoryId === category.id && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-3 block">
              Price Range
            </Label>
            <div className="space-y-3">
              {/* Quick Price Filters */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={localFilters.minPrice === "0" && localFilters.maxPrice === "50" ? "default" : "outline"}
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, minPrice: "0", maxPrice: "50" }));
                    onFiltersChange({ ...localFilters, minPrice: "0", maxPrice: "50" });
                  }}
                  data-testid="button-price-under-50"
                >
                  Under $50
                </Button>
                <Button
                  size="sm"
                  variant={localFilters.minPrice === "50" && localFilters.maxPrice === "200" ? "default" : "outline"}
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, minPrice: "50", maxPrice: "200" }));
                    onFiltersChange({ ...localFilters, minPrice: "50", maxPrice: "200" });
                  }}
                  data-testid="button-price-50-200"
                >
                  $50-$200
                </Button>
                <Button
                  size="sm"
                  variant={localFilters.minPrice === "200" && localFilters.maxPrice === "500" ? "default" : "outline"}
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, minPrice: "200", maxPrice: "500" }));
                    onFiltersChange({ ...localFilters, minPrice: "200", maxPrice: "500" });
                  }}
                  data-testid="button-price-200-500"
                >
                  $200-$500
                </Button>
                <Button
                  size="sm"
                  variant={localFilters.minPrice === "500" ? "default" : "outline"}
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, minPrice: "500", maxPrice: "" }));
                    onFiltersChange({ ...localFilters, minPrice: "500", maxPrice: "" });
                  }}
                  data-testid="button-price-over-500"
                >
                  Over $500
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minPrice}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="text-sm"
                  data-testid="input-min-price"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxPrice}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="text-sm"
                  data-testid="input-max-price"
                />
              </div>
              <Button 
                size="sm" 
                className="w-full" 
                onClick={handlePriceFilter}
                data-testid="button-apply-price"
              >
                Apply Custom Price
              </Button>
            </div>
          </div>

          {/* Rating */}
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-3 block">
              Rating
            </Label>
            <RadioGroup value={selectedRating} onValueChange={setSelectedRating}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="rating-5" />
                  <Label htmlFor="rating-5" className="text-sm flex items-center cursor-pointer">
                    <div className="flex text-accent mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    5 stars
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="rating-4" />
                  <Label htmlFor="rating-4" className="text-sm flex items-center cursor-pointer">
                    <div className="flex text-accent mr-2">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                      <Star className="w-3 h-3 text-neutral-300" />
                    </div>
                    4+ stars
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="rating-3" />
                  <Label htmlFor="rating-3" className="text-sm flex items-center cursor-pointer">
                    <div className="flex text-accent mr-2">
                      {[...Array(3)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                      {[...Array(2)].map((_, i) => (
                        <Star key={i + 3} className="w-3 h-3 text-neutral-300" />
                      ))}
                    </div>
                    3+ stars
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Clear Filters */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={clearAllFilters}
            data-testid="button-clear-filters"
          >
            Clear All Filters
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
