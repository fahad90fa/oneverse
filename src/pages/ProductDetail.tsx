import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  ArrowLeft,
  MessageCircle,
  Truck,
  Shield
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          seller:seller_id (full_name, avatar_url)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          buyer:buyer_id (full_name, avatar_url)
        `)
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      toast({
        title: "Added to cart!",
        description: `${quantity} item(s) added to your cart`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-effect border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button onClick={() => navigate("/products")}>
            Back to Products
          </Button>
        </Card>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="glass-effect mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-fade-in-up">
          {/* Product Image */}
          <Card className="glass-effect border-border overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <ShoppingCart className="h-24 w-24 text-muted-foreground" />
            </div>
          </Card>

          {/* Product Info */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(avgRating as any)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {avgRating} ({reviews.length} reviews)
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
              <div className="flex gap-2 flex-wrap">
                {product.category && (
                  <Badge variant="secondary">{product.category}</Badge>
                )}
                {product.tags?.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Seller Info */}
            <Card className="glass-effect border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                      {product.seller?.full_name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{product.seller?.full_name || "Seller"}</p>
                    <p className="text-xs text-muted-foreground">Verified Seller</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </Card>

            {/* Price & Stock */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Price</p>
                <p className="text-5xl font-bold text-primary">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Stock Available</p>
                <p className="text-lg font-semibold">
                  {product.stock_quantity > 0 ? (
                    <span className="text-green-500">{product.stock_quantity} items</span>
                  ) : (
                    <span className="text-red-500">Out of Stock</span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Quantity</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-blue-500 text-white"
                size="lg"
                disabled={product.stock_quantity === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" className="glass-effect">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="glass-effect">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Shipping & Returns */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-effect border-border p-4 text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $50</p>
              </Card>
              <Card className="glass-effect border-border p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">Buyer Protection</p>
                <p className="text-xs text-muted-foreground">Money-back guarantee</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <Card className="glass-effect border-border p-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary mb-2">{avgRating}</p>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(avgRating as any)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Based on {reviews.length} reviews</p>
            </div>

            {/* Rating Distribution */}
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(r => r.rating === rating).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm font-medium min-w-fit">{rating} star</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-fit">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Individual Reviews */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              reviews.map((review, index) => (
                <Card
                  key={review.id}
                  className="glass-effect border-border p-4 animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-xs">
                          {review.buyer?.full_name?.charAt(0) || "B"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{review.buyer?.full_name || "Buyer"}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;
