import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { WishlistGrid } from "@/components/Wishlist/WishlistGrid";
import { ArrowLeft } from "lucide-react";

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/buyer")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-electric-blue-500 to-cyan-500 bg-clip-text text-transparent animate-fade-in-up">
            My Wishlist
          </h1>
          <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Your saved items and favorites
          </p>
        </div>

        <WishlistGrid
          items={wishlistItems}
          onRemove={removeFromWishlist}
        />
      </div>
    </div>
  );
};

export default Wishlist;
