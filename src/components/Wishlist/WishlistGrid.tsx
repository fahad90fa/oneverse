import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import {
  ShoppingCart,
  Trash2,
  Share2
} from "lucide-react";
import { WishlistItem } from "@/hooks/useWishlist";

interface WishlistGridProps {
  items: WishlistItem[];
  onRemove: (id: string) => void;
  onMoveToCart?: (productId: string) => void;
}

export const WishlistGrid = ({ items, onRemove, onMoveToCart }: WishlistGridProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();

  const handleShare = async () => {
    const url = window.location.origin + '/wishlist';
    try {
      await navigator.share({
        title: 'My Wishlist',
        text: 'Check out my wishlist!',
        url: url,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'Wishlist link copied to clipboard',
      });
    }
  };

  if (items.length === 0) {
    return (
      <Card className="glass-effect border-border p-12 text-center animate-fade-in-up">
        <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h3>
        <p className="text-muted-foreground mb-6">
          Add items to your wishlist and come back later to purchase them
        </p>
        <Button
          className="bg-gradient-to-r from-primary to-blue-500"
          onClick={() => navigate("/products")}
        >
          Start Shopping
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Wishlist ({items.length} items)</h2>
        <Button
          variant="outline"
          className="glass-effect"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <Card
            key={item.id}
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
                className="absolute top-2 right-2 glass-effect bg-red-500/10 hover:bg-red-500/20 text-red-500"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {item.product?.stock_quantity && item.product.stock_quantity < 10 && (
                <Badge className="absolute bottom-2 left-2 bg-destructive">
                  Only {item.product.stock_quantity} left
                </Badge>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {item.product?.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {item.product?.description}
              </p>

              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-primary">
                  ${parseFloat(item.product?.price?.toString() || '0').toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-blue-500"
                  onClick={() => navigate(`/product/${item.product?.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 glass-effect"
                  onClick={async () => {
                    try {
                      await addToCart(item.product_id);
                      if (onMoveToCart) {
                        onMoveToCart(item.product_id);
                      } else {
                        // Optionally remove from wishlist after adding to cart
                        // onRemove(item.id);
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to add item to cart",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};