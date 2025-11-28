import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertCircle,
  Bell,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  Shield
} from "lucide-react";

interface SettingsState {
  emailNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  securityAlerts: boolean;
  twoFactorEnabled: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const BuyerSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    securityAlerts: true,
    twoFactorEnabled: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/auth");
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSettingChange = (key: keyof SettingsState, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase
        .from("user_preferences")
        .upsert({
          user_id: session.user.id,
          email_notifications: settings.emailNotifications,
          order_updates: settings.orderUpdates,
          promotions: settings.promotions,
          security_alerts: settings.securityAlerts
        }, { onConflict: "user_id" });

      toast({
        title: "Success",
        description: "Notification settings updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!settings.newPassword || !settings.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }

    if (settings.newPassword !== settings.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: settings.newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully"
      });

      setSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase
        .from("user_security")
        .upsert({
          user_id: session.user.id,
          two_factor_enabled: !settings.twoFactorEnabled
        }, { onConflict: "user_id" });

      setSettings(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled
      }));

      toast({
        title: "Success",
        description: `Two-factor authentication ${!settings.twoFactorEnabled ? "enabled" : "disabled"}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold mt-4">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and security</p>
        </motion.div>

        {/* Settings Tabs */}
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6">Email Notifications</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified about your order status' },
                    { key: 'emailNotifications', label: 'General Notifications', description: 'Receive general platform updates' },
                    { key: 'promotions', label: 'Promotions & Offers', description: 'Get exclusive deals and promotions' },
                    { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security notifications' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                      <div>
                        <label className="font-medium cursor-pointer">{item.label}</label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Checkbox
                        checked={settings[item.key as keyof SettingsState] as boolean}
                        onCheckedChange={(checked) =>
                          handleSettingChange(item.key as keyof SettingsState, checked)
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6">Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={settings.newPassword}
                        onChange={(e) => handleSettingChange('newPassword', e.target.value)}
                        className="glass-effect border-border"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={settings.confirmPassword}
                      onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
                      className="glass-effect border-border"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Two-Factor Authentication
                </h2>
                
                <p className="text-sm text-muted-foreground mb-6">
                  {settings.twoFactorEnabled
                    ? "Two-factor authentication is enabled on your account. This adds an extra layer of security."
                    : "Two-factor authentication adds an extra layer of security to your account."}
                </p>

                <Button
                  onClick={handleToggle2FA}
                  disabled={loading}
                  variant={settings.twoFactorEnabled ? "destructive" : "default"}
                  className={settings.twoFactorEnabled ? "" : "bg-gradient-to-r from-primary to-accent"}
                >
                  {settings.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                </Button>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6">Privacy Settings</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium cursor-pointer">Public Profile</label>
                        <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium cursor-pointer">Show Purchase History</label>
                        <p className="text-sm text-muted-foreground">Display your order history publicly</p>
                      </div>
                      <Checkbox />
                    </div>
                  </div>

                  <div className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium cursor-pointer">Allow Messages</label>
                        <p className="text-sm text-muted-foreground">Accept messages from other users</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Data Privacy</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your personal data is protected according to our privacy policy. You can request a copy of your data at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BuyerSettings;
