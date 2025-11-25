import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShoppingBag, Briefcase, User, Wrench } from "lucide-react";

type UserRole = "buyer" | "seller" | "client" | "worker";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const roles = [
    { value: "buyer" as UserRole, label: "Buyer", icon: ShoppingBag, description: "Shop for products" },
    { value: "seller" as UserRole, label: "Seller", icon: User, description: "Sell products" },
    { value: "client" as UserRole, label: "Client", icon: Briefcase, description: "Hire freelancers" },
    { value: "worker" as UserRole, label: "Worker", icon: Wrench, description: "Offer services" },
  ];

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (selectedRoles.length === 0) {
          toast({
            title: "Select at least one role",
            description: "Please select at least one role to continue",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Insert selected roles
          const roleInserts = selectedRoles.map(role => ({
            user_id: authData.user.id,
            role: role
          }));

          const { error: rolesError } = await supabase
            .from("user_roles")
            .insert(roleInserts);

          if (rolesError) throw rolesError;

          toast({
            title: "Account created!",
            description: "Let's set up your profile"
          });
          navigate("/onboarding");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in"
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 animate-gradient-shift bg-[length:200%_200%]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="w-full max-w-md relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 glass-effect"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="glass-effect border-border animate-scale-in">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp
                  ? "Join our multi-purpose platform"
                  : "Sign in to your account"}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="glass-effect border-border"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass-effect border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="glass-effect border-border"
                />
              </div>

              {isSignUp && (
                <div className="space-y-3">
                  <Label>Select Your Roles (choose at least one)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((role) => (
                      <label
                        key={role.value}
                        className={`glass-effect border-2 rounded-lg p-3 cursor-pointer transition-all hover-scale ${
                          selectedRoles.includes(role.value)
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            checked={selectedRoles.includes(role.value)}
                            onCheckedChange={() => toggleRole(role.value)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <role.icon className="h-4 w-4" />
                              <span className="font-medium text-sm">{role.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {role.description}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
