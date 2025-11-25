import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  ArrowLeft,
  MoreHorizontal,
  Filter
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: "active" | "draft" | "archived";
  views: number;
  sales: number;
  rating: number;
  image?: string;
}

const ProductManage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "draft" | "archived">("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Premium Wireless Headphones",
          price: 299.99,
          stock: 45,
          category: "electronics",
          status: "active",
          views: 2340,
          sales: 28,
          rating: 4.8,
          image: "📱"
        },
        {
          id: "2",
          name: "Designer T-Shirt",
          price: 49.99,
          stock: 120,
          category: "clothing",
          status: "active",
          views: 1890,
          sales: 156,
          rating: 4.5,
          image: "👕"
        },
        {
          id: "3",
          name: "Organic Coffee Beans",
          price: 24.99,
          stock: 0,
          category: "food",
          status: "active",
          views: 890,
          sales: 34,
          rating: 4.9,
          image: "☕"
        },
        {
          id: "4",
          name: "Yoga Mat",
          price: 39.99,
          stock: 30,
          category: "sports",
          status: "draft",
          views: 120,
          sales: 5,
          rating: 0,
          image: "🧘"
        }
      ];

      setProducts(mockProducts);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (productId: string, newStatus: "active" | "draft") => {
    try {
      setProducts(products.map(p =>
        p.id === productId ? { ...p, status: newStatus } : p
      ));
      toast({
        title: "Success",
        description: `Product ${newStatus === 'active' ? 'published' : 'archived'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === "active").length,
    draft: products.filter(p => p.status === "draft").length,
    archived: products.filter(p => p.status === "archived").length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold">Manage Products</h1>
              <p className="text-muted-foreground">Manage and organize your products</p>
            </div>
            <Button
              onClick={() => navigate("/products/new")}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: stats.total, color: "from-blue-500 to-cyan-500" },
            { label: "Active", value: stats.active, color: "from-green-500 to-emerald-500" },
            { label: "Draft", value: stats.draft, color: "from-amber-500 to-orange-500" },
            { label: "Archived", value: stats.archived, color: "from-gray-500 to-slate-500" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect border-border p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search and Filter */}
        <motion.div
          className="mb-6 flex gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="pl-10 glass-effect border-border"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/50">
                  <tr className="bg-muted/30">
                    <th className="text-left p-4 font-semibold">Product</th>
                    <th className="text-left p-4 font-semibold">Price</th>
                    <th className="text-left p-4 font-semibold">Stock</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Views</th>
                    <th className="text-left p-4 font-semibold">Sales</th>
                    <th className="text-left p-4 font-semibold">Rating</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{product.image}</div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold">${product.price.toFixed(2)}</p>
                          </td>
                          <td className="p-4">
                            <Badge variant={product.stock > 20 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}>
                              {product.stock} items
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant="secondary"
                              className={product.status === "active"
                                ? "bg-green-500/20 text-green-500 border-green-500/50"
                                : product.status === "draft"
                                ? "bg-amber-500/20 text-amber-500 border-amber-500/50"
                                : "bg-gray-500/20 text-gray-500 border-gray-500/50"
                              }
                            >
                              {product.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{product.views.toLocaleString()}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-sm">{product.sales}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{product.rating > 0 ? `${product.rating}★` : "—"}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(product.id, product.status === "active" ? "draft" : "active")}
                              >
                                {product.status === "active" ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/product/${product.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-12 text-center">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">No products found</p>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductManage;
