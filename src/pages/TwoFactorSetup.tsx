import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Copy, Check, AlertCircle } from "lucide-react";
import QRCode from "qrcode";

export default function TwoFactorSetup() {
  const [step, setStep] = useState<"setup" | "verify" | "backup">("setup");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/2fa/setup", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Setup failed");

      const data = await response.json();
      setSecret(data.secret);
      setQrCode(data.qrCode);
      setBackupCodes(data.backupCodes);
      setStep("verify");

      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code with your authenticator app",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start 2FA setup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      toast({
        title: "Invalid Token",
        description: "Please enter a valid 6-digit token",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/2fa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          secret,
          backupCodes,
        }),
      });

      if (!response.ok) throw new Error("Verification failed");

      setStep("backup");
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication is now active",
      });
    } catch (error) {
      toast({
        title: "Invalid Token",
        description: "The token you entered is incorrect",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    });
  };

  const handleComplete = () => {
    navigate("/settings");
    toast({
      title: "Success",
      description: "2FA setup completed successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Two-Factor Authentication</h1>
            <p className="text-muted-foreground mt-2">Secure your account with 2FA</p>
          </div>

          {step === "setup" && (
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Step 1: Enable 2FA</h2>
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication adds an extra layer of security to your account. You'll need an authenticator app like Google Authenticator or Authy.
                </p>
              </div>

              <Button onClick={handleSetup} disabled={loading} className="w-full">
                {loading ? "Starting setup..." : "Start Setup"}
              </Button>
            </Card>
          )}

          {step === "verify" && (
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Step 2: Scan QR Code</h2>
                <p className="text-sm text-muted-foreground">
                  Use your authenticator app to scan this QR code:
                </p>
              </div>

              {qrCode && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Manual Entry Code</Label>
                <div className="flex gap-2">
                  <Input value={secret} disabled className="font-mono text-sm" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopySecret}
                    className="w-10"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">Enter 6-digit code from your app</Label>
                <Input
                  id="token"
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest"
                />
              </div>

              <Button onClick={handleVerify} disabled={loading || token.length !== 6} className="w-full">
                {loading ? "Verifying..." : "Verify Code"}
              </Button>

              <Button variant="outline" onClick={() => setStep("setup")} disabled={loading} className="w-full">
                Back
              </Button>
            </Card>
          )}

          {step === "backup" && (
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Step 3: Save Backup Codes</h2>
                <p className="text-sm text-muted-foreground">
                  Save these backup codes in a secure location. You can use them to access your account if you lose access to your authenticator app.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2 font-mono text-sm">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{idx + 1}.</span>
                    <span>{code}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 items-center p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-amber-800 dark:text-amber-200">
                  Do not share these codes with anyone. Each code can only be used once.
                </p>
              </div>

              <Button onClick={handleCopyBackupCodes} variant="outline" className="w-full">
                <Copy className="h-4 w-4 mr-2" /> Copy Codes
              </Button>

              <Button onClick={handleComplete} className="w-full">
                Done
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
