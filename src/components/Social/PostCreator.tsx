import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fileUploadService } from "@/services/fileUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Image,
  Send,
  X,
  Globe,
  Users,
  Lock
} from "lucide-react";

interface PostCreatorProps {
  onPostCreated: () => void;
}

export const PostCreator = ({ onPostCreated }: PostCreatorProps) => {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user info
  useState(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("user_id", session.user.id)
          .single();
        setCurrentUser({ ...session.user, ...profile });
      }
    };
    getCurrentUser();
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      toast({
        title: "Too many images",
        description: "Maximum 4 images allowed per post",
        variant: "destructive"
      });
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      // Upload images if any
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        const uploadPromises = images.map(file => fileUploadService.uploadFile(file, 'posts'));
        const uploadResults = await Promise.all(uploadPromises);
        uploadedImageUrls = uploadResults.map(result => result.url);
      }

      // Create post
      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: session.user.id,
          content: content.trim(),
          images: uploadedImageUrls,
          // Note: visibility would need additional implementation
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been shared with the community"
      });

      // Reset form
      setContent("");
      setImages([]);
      setImageUrls([]);
      setVisibility("public");

      onPostCreated();
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityIcon = (vis: string) => {
    switch (vis) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'connections': return <Users className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* User info and visibility */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser?.avatar_url} />
            <AvatarFallback>
              {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{currentUser?.full_name || 'User'}</p>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="w-32 h-6 text-xs border-0 p-0 bg-transparent">
                <div className="flex items-center gap-1">
                  {getVisibilityIcon(visibility)}
                  <span className="capitalize">{visibility}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Public
                  </div>
                </SelectItem>
                <SelectItem value="connections">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Connections
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Private
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content input */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? Share your thoughts, projects, or ask for help..."
        className="glass-effect border-border resize-none min-h-[100px]"
        maxLength={500}
      />

      {/* Character count */}
      <div className="text-right text-xs text-muted-foreground">
        {content.length}/500
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="image-upload" className="cursor-pointer">
            <Button variant="ghost" size="sm" className="glass-effect" asChild>
              <span>
                <Image className="h-4 w-4 mr-2" />
                Photo
              </span>
            </Button>
          </label>
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && images.length === 0)}
          className="bg-gradient-to-r from-primary to-blue-500"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Post
            </>
          )}
        </Button>
      </div>
    </div>
  );
};