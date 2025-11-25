import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  X,
  Save,
  DollarSign,
  Package,
  Tag,
  FileText
} from "lucide-react";

interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  sku: string;
  images: string[];
  tags: string[];
  specifications: Record<string, string>;
}

const ProductNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    category: "electronics",
    price: "",
    stock: "",
    sku: "",
    images: [],
    tags: [],
    specifications: {}
  });

  const handleInputChange = (field: keyof Omit<ProductForm, 'images' | 'tags' | 'specifications'>, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput] }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleAddSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setForm(prev => ({
        ...prev,
        specifications: { ...prev.specifications, [specKey]: specValue }
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const handleRemoveSpecification = (key: string) => {
    setForm(prev => ({
      ...prev,
      specifications: Object.fromEntries(
        Object.entries(prev.specifications).filter(([k]) => k !== key)
      )
    }));
  };

  const handlePublish = async () => {
    if (!form.name || !form.description || !form.price || !form.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Product published successfully"
      });

      navigate("/products/manage");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ["electronics", "clothing", "books", "home", "sports", "toys", "other"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
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
          <h1 className="text-3xl font-bold mt-4">Create New Product</h1>
          <p className="text-muted-foreground">Add a new product to your store</p>
        </motion.div>

        {/* Product Form */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Images</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6">Basic Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                    <Input
                      value={form.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Premium Wireless Headphones"
                      className="glass-effect border-border"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <DollarSign className="h-4 w-4 inline mr-2" />
                        Price *
                      </label>
                      <Input
                        type="number"
                        value={form.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="99.99"
                        className="glass-effect border-border"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Package className="h-4 w-4 inline mr-2" />
                        Stock *
                      </label>
                      <Input
                        type="number"
                        value={form.stock}
                        onChange={(e) => handleInputChange('stock', e.target.value)}
                        placeholder="100"
                        className="glass-effect border-border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-border bg-background glass-effect text-foreground"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat} className="bg-background">
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">SKU</label>
                      <Input
                        value={form.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        placeholder="e.g., SKU-12345"
                        className="glass-effect border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your product in detail..."
                      className="glass-effect border-border"
                      rows={6}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Details */}
          <TabsContent value="details" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6">Tags</h2>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add a tag and press Enter"
                      className="glass-effect border-border"
                    />
                    <Button onClick={handleAddTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {form.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6">Specifications</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      value={specKey}
                      onChange={(e) => setSpecKey(e.target.value)}
                      placeholder="e.g., Color"
                      className="glass-effect border-border"
                    />
                    <Input
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      placeholder="e.g., Black"
                      className="glass-effect border-border"
                    />
                    <Button onClick={handleAddSpecification} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(form.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{key}</p>
                          <p className="text-sm text-muted-foreground">{value}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSpecification(key)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Images */}
          <TabsContent value="images" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6">Product Images</h2>

                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-border transition-colors cursor-pointer">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium mb-2">Upload Images</p>
                  <p className="text-sm text-muted-foreground">Drag and drop or click to select</p>
                  <p className="text-xs text-muted-foreground mt-2">Supported formats: JPG, PNG, GIF</p>
                </div>

                {form.images.length > 0 && (
                  <div className="mt-6">
                    <p className="font-medium mb-4">Uploaded Images</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {form.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-white hover:bg-destructive/90"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-3 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handlePublish}
            disabled={loading}
            className="bg-gradient-to-r from-primary to-accent"
          >
            <Save className="h-4 w-4 mr-2" />
            Publish Product
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Cancel
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductNew;
