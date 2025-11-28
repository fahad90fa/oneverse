import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { VerificationForm } from "@/components/Verification/VerificationForm";
import { VerificationBadge } from "@/components/Badges/VerificationBadge";
import {
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Star,
  TrendingUp,
  Mail,
  Phone,
  CreditCard,
  FileText
} from "lucide-react";

interface Verification {
  id: string;
  verification_type: string;
  status: string;
  submitted_data: Record<string, unknown>;
  admin_notes?: string;
  verified_at?: string;
  expires_at?: string;
  created_at: string;
}

const Verification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [profile, setProfile] = useState<Record<string, unknown>>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      // Fetch verifications
      const { data: verificationsData, error: verificationsError } = await supabase
        .from("verifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (verificationsError) throw verificationsError;

      // Fetch profile with trust score
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profileError) throw profileError;

      setVerifications(verificationsData || []);
      setProfile(profileData);
    } catch (error: unknown) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load verification data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerificationIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-5 w-5" />;
      case 'phone': return <Phone className="h-5 w-5" />;
      case 'id_document': return <FileText className="h-5 w-5" />;
      case 'payment_method': return <CreditCard className="h-5 w-5" />;
      case 'top_rated': return <Star className="h-5 w-5" />;
      case 'rising_talent': return <TrendingUp className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getVerificationName = (type: string) => {
    switch (type) {
      case 'email': return 'Email Verified';
      case 'phone': return 'Phone Verified';
      case 'id_document': return 'ID Verified';
      case 'payment_method': return 'Payment Method Verified';
      case 'top_rated': return 'Top Rated';
      case 'rising_talent': return 'Rising Talent';
      default: return type;
    }
  };

  const approvedCount = verifications.filter(v => v.status === 'approved').length;
  const totalVerifications = 6; // Total possible verifications
  const progressPercentage = (approvedCount / totalVerifications) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/worker")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent animate-fade-in-up">
            Verification Center
          </h1>
          <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Build trust and unlock premium features
          </p>
        </div>

        {/* Trust Score Overview */}
        <Card className="glass-effect border-border p-6 mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Trust Score</h2>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-primary">{profile?.trust_score || 0}</span>
                <div className="flex-1 max-w-xs">
                  <Progress value={progressPercentage} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {approvedCount} of {totalVerifications} verifications completed
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {profile?.verification_badges?.map((badge: string) => (
                <VerificationBadge key={badge} type={badge} size="sm" />
              ))}
            </div>
          </div>
        </Card>

        {/* Verification Requests */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            { type: 'email', description: 'Verify your email address', required: true },
            { type: 'phone', description: 'Verify your phone number', required: false },
            { type: 'id_document', description: 'Upload government ID', required: false },
            { type: 'payment_method', description: 'Verify payment method', required: false },
            { type: 'top_rated', description: 'Achieve top rated status', required: false, auto: true },
            { type: 'rising_talent', description: 'Recognized as rising talent', required: false, auto: true }
          ].map((verification, index) => {
            const existingVerification = verifications.find(v => v.verification_type === verification.type);

            return (
              <Card
                key={verification.type}
                className="glass-effect border-border p-6 hover-scale cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => {
                  if (!existingVerification || existingVerification.status === 'rejected') {
                    setSelectedType(verification.type);
                    setShowForm(true);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getVerificationIcon(verification.type)}
                    <div>
                      <h3 className="font-bold">{getVerificationName(verification.type)}</h3>
                      <p className="text-sm text-muted-foreground">{verification.description}</p>
                    </div>
                  </div>
                  {existingVerification && getStatusIcon(existingVerification.status)}
                </div>

                {existingVerification ? (
                  <div className="space-y-2">
                    <Badge className={`${getStatusColor(existingVerification.status)} text-white`}>
                      {existingVerification.status.charAt(0).toUpperCase() + existingVerification.status.slice(1)}
                    </Badge>
                    {existingVerification.admin_notes && (
                      <p className="text-sm text-muted-foreground">
                        Note: {existingVerification.admin_notes}
                      </p>
                    )}
                    {existingVerification.expires_at && (
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(existingVerification.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : verification.auto ? (
                  <p className="text-sm text-muted-foreground">Automatically granted based on performance</p>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedType(verification.type);
                      setShowForm(true);
                    }}
                  >
                    {verification.required ? 'Verify Now' : 'Get Verified'}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        {verifications.length > 0 && (
          <Card className="glass-effect border-border p-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {verifications.slice(0, 5).map((verification) => (
                <div key={verification.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getVerificationIcon(verification.verification_type)}
                    <div>
                      <p className="font-medium">{getVerificationName(verification.verification_type)}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(verification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(verification.status)} text-white`}>
                    {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Verification Form Modal */}
        {showForm && (
          <VerificationForm
            verificationType={selectedType}
            onClose={() => {
              setShowForm(false);
              setSelectedType('');
            }}
            onSuccess={() => {
              setShowForm(false);
              setSelectedType('');
              fetchData();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Verification;