import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/useWishlist";
import {
  ShoppingCart,
  Heart,
  Search,
  Filter,
  ArrowLeft
} from "lucide-react";
import { Product } from "@/types";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItem } = useWishlist();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent animate-fade-in-up">
            Product Marketplace
          </h1>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-effect border-border"
              />
            </div>
            <Button className="glass-effect">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="glass-effect border-border overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted/50 rounded animate-pulse w-full" />
                  <div className="h-3 bg-muted/50 rounded animate-pulse w-2/3" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-muted/50 rounded animate-pulse w-20" />
                    <div className="h-8 bg-muted/50 rounded animate-pulse w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="glass-effect border-border p-12 text-center animate-fade-in-up">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-2">No Products Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "Try adjusting your search" : "Be the first to list a product!"}
            </p>
            {!searchTerm && (
              <Button className="bg-gradient-to-r from-primary to-blue-500">
                List Your Product
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <Card
                key={product.id}
                className="group glass-effect border-border hover-scale cursor-pointer overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`absolute top-2 right-2 glass-effect transition-all duration-200 ${
                      isInWishlist(product.id)
                        ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                        : 'text-muted-foreground hover:text-red-500'
                    }`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (isInWishlist(product.id)) {
                        const wishlistItem = getWishlistItem(product.id);
                        if (wishlistItem) {
                          await removeFromWishlist(wishlistItem.id);
                        }
                      } else {
                        await addToWishlist(product.id);
                      }
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 transition-all duration-200 ${
                        isInWishlist(product.id) ? 'fill-current scale-110' : ''
                      }`}
                    />
                  </Button>
                  {product.stock_quantity < 10 && (
                    <Badge className="absolute bottom-2 left-2 bg-destructive">
                      Only {product.stock_quantity} left
                    </Badge>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-primary to-blue-500">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
