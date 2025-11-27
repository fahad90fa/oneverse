import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminLoginModal = ({ isOpen, onClose, onSuccess }: AdminLoginModalProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'fahad123@fa';
  const maxAttempts = 3;

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShowPassword(false);
      setAttempts(0);
    }
  }, [isOpen]);

  const ensureAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const email = session.user.email || session.user.user_metadata?.email || "";
      const fullName = session.user.user_metadata?.full_name || email;

      await supabase
        .from("admin_users")
        .upsert(
          {
            user_id: session.user.id,
            email,
            full_name: fullName,
          },
          { onConflict: "user_id" }
        );
    } catch (error) {
      console.error("Failed to ensure admin access", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (attempts >= maxAttempts) {
      toast({
        title: "Too many attempts",
        description: "Please try again later",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === correctPassword) {
      await ensureAdminAccess();
      localStorage.setItem('admin_password', password);
      toast({
        title: "Access granted",
        description: "Welcome to the admin panel",
      });
      onSuccess();
      onClose();
    } else {
      setAttempts(prev => prev + 1);
      toast({
        title: "Access denied",
        description: `Invalid password. ${maxAttempts - attempts - 1} attempts remaining.`,
        variant: "destructive"
      });
      setPassword("");
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-effect border-border animate-fade-in-up">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-electric-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center animate-pulse-glow">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Access Required
          </DialogTitle>
          <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Enter the administrator password to continue
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-medium">
              Administrator Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-10 glass-effect focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                disabled={isLoading || attempts >= maxAttempts}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {attempts > 0 && attempts < maxAttempts && (
            <div className="text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>{maxAttempts - attempts} attempts remaining</span>
              </div>
            </div>
          )}

          {attempts >= maxAttempts && (
            <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Maximum attempts exceeded. Please try again later.</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 glass-effect hover-scale"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !password.trim() || attempts >= maxAttempts}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 animate-pulse-glow"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Access Admin
                </div>
              )}
            </Button>
          </div>
        </form>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-xs text-muted-foreground">
            This action requires administrator privileges
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoginModal;