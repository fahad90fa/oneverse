import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  MessageCircle,
  Share2,
  Send
} from "lucide-react";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<Record<string, unknown>>(null);
  const [proposals, setProposals] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalText, setProposalText] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
      fetchProposals();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          client:client_id (full_name, avatar_url)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error: unknown) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Job not found",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from("proposals")
        .select(`
          *,
          worker:worker_id (full_name, avatar_url)
        `)
        .eq("job_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error: unknown) {
      console.error("Error:", error);
    }
  };

  const handleSubmitProposal = async () => {
    if (!proposalText.trim()) return;

    try {
      setSubmittingProposal(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("proposals")
        .insert({
          job_id: id,
          worker_id: session.user.id,
          content: proposalText,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Proposal submitted!",
        description: "Your proposal has been sent to the client"
      });

      setProposalText("");
      fetchProposals();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmittingProposal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-effect border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">Job not found</p>
          <Button onClick={() => navigate("/jobs")}>
            Back to Jobs
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/jobs")}
          className="glass-effect mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Job Details */}
          <div className="md:col-span-2 space-y-6 animate-fade-in-up">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{job.description}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">
                    {job.budget_min && job.budget_max
                      ? `$${job.budget_min} - $${job.budget_max}`
                      : `$${job.budget || 0}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{job.timeline || "Immediate"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>Remote</span>
                </div>
              </div>

              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                {job.status?.toUpperCase()}
              </Badge>
            </div>

            {/* Required Skills */}
            {job.required_skills && job.required_skills.length > 0 && (
              <Card className="glass-effect border-border p-6">
                <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill: string, i: number) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Scope of Work */}
            <Card className="glass-effect border-border p-6">
              <h3 className="text-lg font-semibold mb-3">Scope of Work</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.scope || job.description}</p>
            </Card>

            {/* Client Info */}
            <Card className="glass-effect border-border p-6">
              <h3 className="text-lg font-semibold mb-4">About the Client</h3>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                    {job.client?.full_name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{job.client?.full_name || "Client"}</p>
                  <p className="text-sm text-muted-foreground">Verified Client</p>
                </div>
                <Button
                  variant="outline"
                  className="glass-effect"
                  onClick={() => navigate("/chat")}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {/* Submit Proposal Card */}
            <Card className="glass-effect border-border p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <h3 className="text-lg font-semibold mb-3">Submit a Proposal</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tell the client why you're the right fit for this job
              </p>

              <Textarea
                placeholder="Write your proposal..."
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                className="mb-4 resize-none glass-effect border-border"
                rows={5}
              />

              <Button
                className="w-full bg-gradient-to-r from-primary to-blue-500"
                disabled={!proposalText.trim() || submittingProposal}
                onClick={handleSubmitProposal}
              >
                <Send className="h-4 w-4 mr-2" />
                {submittingProposal ? "Submitting..." : "Submit Proposal"}
              </Button>
            </Card>

            {/* Share */}
            <Button variant="outline" className="w-full glass-effect">
              <Share2 className="h-4 w-4 mr-2" />
              Share Job
            </Button>
          </div>
        </div>

        {/* Proposals Section */}
        {proposals.length > 0 && (
          <Card className="glass-effect border-border p-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-2xl font-bold mb-6">Proposals ({proposals.length})</h2>
            <div className="space-y-4">
              {proposals.map((proposal, index) => (
                <Card
                  key={proposal.id}
                  className="glass-effect border-border p-4 animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-xs">
                          {proposal.worker?.full_name?.charAt(0) || "W"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{proposal.worker?.full_name || "Worker"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(proposal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        proposal.status === "accepted"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }
                    >
                      {proposal.status}
                    </Badge>
                  </div>
                  <p className="text-sm">{proposal.content}</p>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
