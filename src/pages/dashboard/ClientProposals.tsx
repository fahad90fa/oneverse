import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/animations/variants";
import { ArrowLeft, Check, X, Eye, Star } from "lucide-react";

interface Proposal {
  id: string;
  workerName: string;
  workerId: string;
  title: string;
  description: string;
  budget: number;
  deliveryTime: number;
  status: "pending" | "accepted" | "rejected";
  rating?: number;
  completionTime?: number;
  submitDate: string;
}

const ClientProposals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  const [proposals] = useState<Proposal[]>([
    {
      id: "1",
      workerName: "Sarah Chen",
      workerId: "1",
      title: "Full Stack Development",
      description: "I can build a complete full-stack application with React, Node.js, and PostgreSQL. I have 5+ years of experience.",
      budget: 3500,
      deliveryTime: 14,
      status: "pending",
      rating: 4.9,
      submitDate: "2 days ago"
    },
    {
      id: "2",
      workerName: "Mike Johnson",
      workerId: "2",
      title: "React Components Library",
      description: "Expert in building reusable React components. Will create a comprehensive component library with documentation.",
      budget: 2500,
      deliveryTime: 10,
      status: "pending",
      rating: 4.7,
      submitDate: "1 day ago"
    },
    {
      id: "3",
      workerName: "Emma Wilson",
      workerId: "3",
      title: "Technical Documentation",
      description: "Comprehensive technical documentation writing with diagrams and examples.",
      budget: 1200,
      deliveryTime: 7,
      status: "accepted",
      rating: 4.8,
      submitDate: "3 days ago",
      completionTime: 6
    },
    {
      id: "4",
      workerName: "Alex Rodriguez",
      workerId: "4",
      title: "UI/UX Design",
      description: "Complete UI/UX design for your web application including wireframes and prototypes.",
      budget: 2000,
      deliveryTime: 12,
      status: "rejected",
      rating: 4.6,
      submitDate: "4 days ago"
    },
    {
      id: "5",
      workerName: "James Park",
      workerId: "5",
      title: "DevOps Setup",
      description: "Setup CI/CD pipeline, Docker containerization, and cloud deployment.",
      budget: 1800,
      deliveryTime: 8,
      status: "pending",
      rating: 4.5,
      submitDate: "5 days ago"
    },
    {
      id: "6",
      workerName: "Lisa Zhang",
      workerId: "6",
      title: "Project Management",
      description: "Full project management coordination and team communication setup.",
      budget: 1500,
      deliveryTime: 5,
      status: "accepted",
      rating: 4.7,
      submitDate: "1 week ago",
      completionTime: 5
    }
  ]);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "client")
        .single();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You need the Client role to access this page",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (proposalId: string) => {
    toast({
      title: "Proposal Accepted",
      description: "You have accepted this proposal. The worker will be notified.",
    });
  };

  const handleReject = (proposalId: string) => {
    toast({
      title: "Proposal Rejected",
      description: "The worker will be notified of your decision.",
    });
  };

  const filteredProposals = selectedStatus === "all" 
    ? proposals 
    : proposals.filter(p => p.status === selectedStatus);

  const statusCounts = {
    all: proposals.length,
    pending: proposals.filter(p => p.status === "pending").length,
    accepted: proposals.filter(p => p.status === "accepted").length,
    rejected: proposals.filter(p => p.status === "rejected").length
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
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/client")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent">
              Proposals Manager
            </h1>
            <p className="text-muted-foreground">
              Review and manage proposals from workers
            </p>
          </div>
        </motion.div>

        {/* Status Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "All", value: "all" as const, count: statusCounts.all },
              { label: "Pending", value: "pending" as const, count: statusCounts.pending },
              { label: "Accepted", value: "accepted" as const, count: statusCounts.accepted },
              { label: "Rejected", value: "rejected" as const, count: statusCounts.rejected }
            ].map((tab) => (
              <Button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                variant={selectedStatus === tab.value ? "default" : "outline"}
                className={`${selectedStatus === tab.value ? "glass-effect" : ""}`}
              >
                {tab.label}
                <span className="ml-2 text-xs opacity-70">({tab.count})</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Proposals Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6"
        >
          {filteredProposals.map((proposal) => (
            <motion.div key={proposal.id} variants={itemVariants}>
              <Card className="glass-effect border-border/50 hover:border-primary/50 transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {proposal.workerName.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{proposal.workerName}</h3>
                          <p className="text-sm text-muted-foreground">{proposal.title}</p>
                        </div>
                      </div>
                      {proposal.rating && (
                        <div className="flex items-center gap-1 mt-2 text-xs">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span>{proposal.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-500">${proposal.budget}</p>
                      <p className="text-xs text-muted-foreground">{proposal.deliveryTime} days</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/20">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Submitted {proposal.submitDate}</span>
                      {proposal.completionTime && (
                        <span>Completed in {proposal.completionTime} days</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {proposal.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleReject(proposal.id)}
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="gap-2 bg-green-500/20 text-green-600 hover:bg-green-500/30"
                            onClick={() => handleAccept(proposal.id)}
                          >
                            <Check className="h-4 w-4" />
                            Accept
                          </Button>
                        </>
                      )}
                      {proposal.status === "accepted" && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded text-xs font-semibold">
                          Accepted
                        </span>
                      )}
                      {proposal.status === "rejected" && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-600 rounded text-xs font-semibold">
                          Rejected
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredProposals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No proposals found.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClientProposals;
