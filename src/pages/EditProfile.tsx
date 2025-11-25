import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload } from "lucide-react";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    title: "",
    bio: "",
    location: "",
    experience_years: 0,
    skills: [] as string[],
    avatar_url: ""
  });
  const [skillInput, setSkillInput] = useState("");

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

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile(data);
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: session.user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully"
      });

      navigate(`/profile/${session.user.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skill)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="glass-effect mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in-up">
          Edit Profile
        </h1>
        <p className="text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Update your personal information and preferences
        </p>

        <Card className="glass-effect border-border p-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar */}
            <div>
              <Label className="mb-3 block">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                  {profile.full_name?.charAt(0) || "U"}
                </div>
                <Button type="button" variant="outline" className="glass-effect">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Your full name"
                className="glass-effect border-border mt-1"
              />
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                placeholder="e.g., Web Developer, Designer"
                className="glass-effect border-border mt-1"
              />
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="glass-effect border-border mt-1 resize-none"
                rows={4}
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="City, Country"
                className="glass-effect border-border mt-1"
              />
            </div>

            {/* Experience */}
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={profile.experience_years}
                onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) })}
                placeholder="Number of years"
                className="glass-effect border-border mt-1"
              />
            </div>

            {/* Skills */}
            <div>
              <Label>Skills</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  placeholder="Add a skill"
                  className="glass-effect border-border"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="glass-effect"
                  onClick={handleAddSkill}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.skills.map((skill) => (
                  <div
                    key={skill}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-primary-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-blue-500"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 glass-effect"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
