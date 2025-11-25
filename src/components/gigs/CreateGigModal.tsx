import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateGigModalProps {
  children: React.ReactNode;
}

const CreateGigModal = ({ children }: CreateGigModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    deliveryDays: "",
    category: "",
    skills: [] as string[],
    images: [] as string[]
  });
  const [currentSkill, setCurrentSkill] = useState("");

  const categories = [
    "Web Development",
    "Mobile Development",
    "Design",
    "Writing",
    "Marketing",
    "Consulting",
    "Video & Animation",
    "Music & Audio",
    "Photography",
    "Data Entry",
    "Translation",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price || !formData.deliveryDays) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a gig.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('gigs')
        .insert([{
          worker_id: session.user.id,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          delivery_days: parseInt(formData.deliveryDays),
          category: formData.category || null,
          skills: formData.skills,
          images: formData.images,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your gig has been created successfully.",
      });

      setOpen(false);
      setFormData({
        title: "",
        description: "",
        price: "",
        deliveryDays: "",
        category: "",
        skills: [],
        images: []
      });

      // Refresh the page to show the new gig
      window.location.reload();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create gig. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addImage = () => {
    // For now, just add a placeholder. In a real app, you'd handle file uploads
    const imageUrl = prompt("Enter image URL:");
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
    }
  };

  const removeImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(image => image !== imageToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Gig</DialogTitle>
          <DialogDescription>
            Fill in the details below to create your freelance service offering.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Professional Web Development"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your service in detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="1"
                placeholder="99.99"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryDays">Delivery Days *</Label>
              <Input
                id="deliveryDays"
                type="number"
                min="1"
                placeholder="7"
                value={formData.deliveryDays}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryDays: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <Button type="button" onClick={addImage} variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Add Image URL
            </Button>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.images.map((image) => (
                <Badge key={image} variant="secondary" className="flex items-center gap-1 max-w-xs">
                  <span className="truncate">{image}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive flex-shrink-0"
                    onClick={() => removeImage(image)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Gig"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGigModal;