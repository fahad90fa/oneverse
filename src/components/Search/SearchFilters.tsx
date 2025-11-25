import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SearchFilters as SearchFiltersType } from "@/services/search";
import { X } from "lucide-react";

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFiltersType) => void;
  categories?: string[];
  initialFilters?: SearchFiltersType;
}

export const SearchFilters = ({ onFiltersChange, categories = [], initialFilters = {} }: SearchFiltersProps) => {
  const [filters, setFilters] = React.useState<SearchFiltersType>(initialFilters);
  const [priceRange, setPriceRange] = React.useState([
    initialFilters.minPrice || 0,
    initialFilters.maxPrice || 1000,
  ]);

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    const newFilters = { ...filters, minPrice: value[0], maxPrice: value[1] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category: filters.category === category ? undefined : category };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStatusChange = (status: string) => {
    const newFilters = { ...filters, status: filters.status === status ? undefined : status };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSortChange = (sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating') => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setPriceRange([0, 1000]);
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card className="p-4 space-y-6 h-fit sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Price Range</Label>
        <Slider
          value={priceRange}
          onValueChange={handlePriceChange}
          min={0}
          max={10000}
          step={100}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Category</Label>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${cat}`}
                  checked={filters.category === cat}
                  onCheckedChange={() => handleCategoryChange(cat)}
                />
                <Label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer font-normal">
                  {cat}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Status</Label>
        <div className="space-y-2">
          {["active", "completed", "archived"].map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={filters.status === status}
                onCheckedChange={() => handleStatusChange(status)}
              />
              <Label htmlFor={`status-${status}`} className="text-sm cursor-pointer font-normal capitalize">
                {status}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort" className="text-sm font-semibold">
          Sort By
        </Label>
        <Select value={filters.sortBy || "relevance"} onValueChange={handleSortChange}>
          <SelectTrigger id="sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={clearFilters} variant="outline" className="w-full" disabled={!hasActiveFilters}>
        Reset All
      </Button>
    </Card>
  );
};
