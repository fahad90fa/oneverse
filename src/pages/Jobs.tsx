import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  Search,
  Filter,
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Plus
} from "lucide-react";

const Jobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          client:client_id (full_name, avatar_url)
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-electric-blue-500 to-cyan-500 bg-clip-text text-transparent animate-fade-in-up">
                Available Jobs
              </h1>
              <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Browse and apply for exciting freelance opportunities
              </p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-blue-500 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Plus className="h-4 w-4 mr-2" />
              Post a Job
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-effect border-border"
              />
            </div>
            <Button className="glass-effect">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass-effect border-border">
                <div className="animate-pulse">
                  <div className="h-32 bg-muted" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="glass-effect border-border p-12 text-center animate-fade-in-up">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-2">No Jobs Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search" : "No jobs available at the moment"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <Card
                key={job.id}
                className="glass-effect border-border hover-scale cursor-pointer overflow-hidden animate-fade-in-up transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/job/${job.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">{job.description?.substring(0, 150)}...</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex-shrink-0 ml-2">
                      {job.budget_type || "Hourly"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.required_skills?.slice(0, 3).map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                    {job.required_skills?.length > 3 && (
                      <Badge variant="outline">+{job.required_skills.length - 3} more</Badge>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-semibold">
                          {job.budget_min && job.budget_max
                            ? `$${job.budget_min} - $${job.budget_max}`
                            : job.budget_type === "Fixed"
                            ? `$${job.budget || 0}`
                            : "Negotiate"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {job.timeline || "Immediate"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Remote</span>
                      </div>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-primary to-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/job/${job.id}`);
                      }}
                    >
                      View & Apply
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
