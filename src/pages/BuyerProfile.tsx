import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit2,
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Shield,
  CheckCircle,
  Camera
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  avatar?: string;
  joined_date: string;
  verification_status: "verified" | "unverified" | "pending";
  rating: number;
  total_reviews: number;
  total_purchases: number;
}

const BuyerProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      const userData: UserProfile = {
        id: session.user.id,
        name: profileData?.full_name || session.user.user_metadata?.name || "User",
        email: session.user.email || "",
        phone: profileData?.phone,
        address: profileData?.address,
        city: profileData?.city,
        country: profileData?.country,
        bio: profileData?.bio,
        avatar: profileData?.avatar_url,
        joined_date: new Date(session.user.created_at).toLocaleDateString(),
        verification_status: profileData?.verification_status || "unverified",
        rating: profileData?.rating || 0,
        total_reviews: profileData?.total_reviews || 0,
        total_purchases: profileData?.total_purchases || 0
      };

      setProfile(userData);
      setFormData(userData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase
        .from("profiles")
        .update({
          full_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          bio: formData.bio
        })
        .eq("user_id", session.user.id);

      setProfile(formData as UserProfile);
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <p className="mt-4">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
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
            <h1 className="text-3xl font-bold">My Profile</h1>
            <Button
              onClick={() => setEditing(!editing)}
              variant="outline"
              size="sm"
            >
              {editing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-effect border-border p-6 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-primary to-accent text-white">
                    {profile.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-0 right-0 bg-primary rounded-full p-2 h-auto w-auto"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </Button>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  {profile.verification_status === "verified" && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{profile.email}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {profile.joined_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{profile.rating.toFixed(1)} ({profile.total_reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>{profile.total_purchases} purchases</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect border-border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  disabled
                  className="glass-effect border-border bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  className="glass-effect border-border"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Address Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              <MapPin className="h-4 w-4 inline mr-2" />
              Address
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Input
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!editing}
                  className="glass-effect border-border"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!editing}
                    className="glass-effect border-border"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <Input
                    value={formData.country || ""}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    disabled={!editing}
                    className="glass-effect border-border"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect border-border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Bio</h3>

            <Textarea
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!editing}
              className="glass-effect border-border"
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </Card>
        </motion.div>

        {/* Action Buttons */}
        {editing && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={() => {
                setEditing(false);
                setFormData(profile);
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BuyerProfile;
