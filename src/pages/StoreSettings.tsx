import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Store,
  CreditCard,
  Bell,
  Lock,
  Save,
  Globe,
  AlertCircle
} from "lucide-react";

interface StoreSettingsState {
  storeName: string;
  storeDescription: string;
  storePhone: string;
  storeEmail: string;
  businessLicense: string;
  taxId: string;
  currency: string;
  shippingOption: boolean;
  autoConfirm: boolean;
  allowReturns: boolean;
  returnDays: string;
  notifyNewOrders: boolean;
  notifyShipped: boolean;
  notifyDelivered: boolean;
  apiKey: string;
}

const StoreSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<StoreSettingsState>({
    storeName: "My Store",
    storeDescription: "Welcome to my store",
    storePhone: "+1 (555) 123-4567",
    storeEmail: "store@example.com",
    businessLicense: "LIC-12345",
    taxId: "TAX-98765",
    currency: "USD",
    shippingOption: true,
    autoConfirm: false,
    allowReturns: true,
    returnDays: "30",
    notifyNewOrders: true,
    notifyShipped: true,
    notifyDelivered: true,
    apiKey: "sk_test_*****"
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/auth");
    }
  };

  const handleInputChange = (field: keyof StoreSettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase
        .from("store_settings")
        .upsert({
          user_id: session.user.id,
          store_name: settings.storeName,
          store_description: settings.storeDescription,
          store_phone: settings.storePhone,
          store_email: settings.storeEmail,
          currency: settings.currency,
          auto_confirm_orders: settings.autoConfirm,
          allow_returns: settings.allowReturns,
          return_days: parseInt(settings.returnDays)
        }, { onConflict: "user_id" });

      toast({
        title: "Success",
        description: "Store settings updated successfully"
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
          <h1 className="text-3xl font-bold mt-4">Store Settings</h1>
          <p className="text-muted-foreground">Configure your store preferences</p>
        </motion.div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Business</span>
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Policies</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6">Store Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Store Name</label>
                    <Input
                      value={settings.storeName}
                      onChange={(e) => handleInputChange('storeName', e.target.value)}
                      className="glass-effect border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Store Email</label>
                    <Input
                      type="email"
                      value={settings.storeEmail}
                      onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                      className="glass-effect border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Store Phone</label>
                    <Input
                      type="tel"
                      value={settings.storePhone}
                      onChange={(e) => handleInputChange('storePhone', e.target.value)}
                      className="glass-effect border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Store Description</label>
                    <Textarea
                      value={settings.storeDescription}
                      onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                      placeholder="Tell customers about your store..."
                      className="glass-effect border-border"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background glass-effect text-foreground"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleSaveSettings}
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

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6">Business Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Business License</label>
                    <Input
                      value={settings.businessLicense}
                      onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                      placeholder="Enter your business license number"
                      className="glass-effect border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tax ID</label>
                    <Input
                      value={settings.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      placeholder="Enter your tax ID"
                      className="glass-effect border-border"
                    />
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Verify Your Business</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Complete verification to unlock selling features and increase trust
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleSaveSettings}
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

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6">Return Policy</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div>
                      <label className="font-medium cursor-pointer">Allow Returns</label>
                      <p className="text-sm text-muted-foreground">Enable customers to return items</p>
                    </div>
                    <Checkbox
                      checked={settings.allowReturns}
                      onCheckedChange={(checked) => handleInputChange('allowReturns', checked)}
                    />
                  </div>

                  {settings.allowReturns && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Return Period (Days)</label>
                      <Input
                        type="number"
                        value={settings.returnDays}
                        onChange={(e) => handleInputChange('returnDays', e.target.value)}
                        className="glass-effect border-border"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div>
                      <label className="font-medium cursor-pointer">Automatic Order Confirmation</label>
                      <p className="text-sm text-muted-foreground">Auto-confirm orders without manual review</p>
                    </div>
                    <Checkbox
                      checked={settings.autoConfirm}
                      onCheckedChange={(checked) => handleInputChange('autoConfirm', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div>
                      <label className="font-medium cursor-pointer">Offer Free Shipping</label>
                      <p className="text-sm text-muted-foreground">Enable free shipping for all orders</p>
                    </div>
                    <Checkbox
                      checked={settings.shippingOption}
                      onCheckedChange={(checked) => handleInputChange('shippingOption', checked)}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleSaveSettings}
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

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-effect border-border p-6">
                <h2 className="text-lg font-semibold mb-6">Email Notifications</h2>

                <div className="space-y-3">
                  {[
                    { key: 'notifyNewOrders', label: 'New Orders', description: 'Get notified when you receive a new order' },
                    { key: 'notifyShipped', label: 'Shipment Confirmation', description: 'Get notified when items are shipped' },
                    { key: 'notifyDelivered', label: 'Delivery Confirmation', description: 'Get notified when items are delivered' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                      <div>
                        <label className="font-medium cursor-pointer">{item.label}</label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Checkbox
                        checked={settings[item.key as keyof StoreSettingsState] as boolean}
                        onCheckedChange={(checked) => handleInputChange(item.key as keyof StoreSettingsState, checked)}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleSaveSettings}
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
        </Tabs>
      </div>
    </div>
  );
};

export default StoreSettings;
