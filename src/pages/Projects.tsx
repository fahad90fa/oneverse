import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  FolderOpen,
  ArrowLeft,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Plus,
  MessageCircle
} from "lucide-react";

const Projects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("worker");

  useEffect(() => {
    determineRoleAndFetch();
  }, []);

  const determineRoleAndFetch = async () => {
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
        .limit(1)
        .single();

      const userRole = roles?.role || "worker";
      setRole(userRole);

      const fieldName = userRole === "worker" ? "worker_id" : "client_id";
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          worker:worker_id (full_name, avatar_url),
          client:client_id (full_name, avatar_url)
        `)
        .eq(fieldName, session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "active":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "paused":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const activeProjects = projects.filter(p => p.status === "active");
  const completedProjects = projects.filter(p => p.status === "completed");
  const pausedProjects = projects.filter(p => p.status === "paused");

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
            onClick={() => navigate("/dashboard")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in-up">
                Projects
              </h1>
              <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Manage your active and completed projects
              </p>
            </div>
            <Button onClick={() => navigate("/jobs")} className="bg-gradient-to-r from-primary to-blue-500 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <Card className="glass-effect border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Active</p>
            <p className="text-3xl font-bold text-blue-500">{activeProjects.length}</p>
          </Card>
          <Card className="glass-effect border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-500">{completedProjects.length}</p>
          </Card>
          <Card className="glass-effect border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Paused</p>
            <p className="text-3xl font-bold text-yellow-500">{pausedProjects.length}</p>
          </Card>
        </div>

        {/* Projects Tabs */}
        <Tabs defaultValue="active" className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <TabsList className="glass-effect border-border mb-6">
            <TabsTrigger value="active">Active ({activeProjects.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({pausedProjects.length})</TabsTrigger>
          </TabsList>

          {/* Active Projects */}
          <TabsContent value="active" className="space-y-4">
            {activeProjects.length === 0 ? (
              <Card className="glass-effect border-border p-12 text-center">
                <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-2">No Active Projects</h3>
                <p className="text-muted-foreground">
                  {role === "worker" ? "Apply for jobs to start working on projects" : "Post a job to start collaborating"}
                </p>
              </Card>
            ) : (
              activeProjects.map((project, index) => (
                <Card
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="glass-effect border-border hover-scale cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        <p className="text-muted-foreground">{project.description}</p>
                      </div>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        Active
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-semibold">${parseFloat(project.budget || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Deadline</p>
                          <p className="font-semibold">{new Date(project.deadline).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Team</p>
                          <p className="font-semibold">
                            {role === "worker" ? project.client?.full_name : project.worker?.full_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="glass-effect"
                        onClick={() => navigate("/chat")}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-primary to-blue-500"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Completed Projects */}
          <TabsContent value="completed" className="space-y-4">
            {completedProjects.length === 0 ? (
              <Card className="glass-effect border-border p-12 text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-2">No Completed Projects</h3>
                <p className="text-muted-foreground">Projects you complete will appear here</p>
              </Card>
            ) : (
              completedProjects.map((project, index) => (
                <Card
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="glass-effect border-border hover-scale cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        <p className="text-muted-foreground">{project.description}</p>
                      </div>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        Completed
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-500"
                      >
                        Leave Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Paused Projects */}
          <TabsContent value="paused" className="space-y-4">
            {pausedProjects.length === 0 ? (
              <Card className="glass-effect border-border p-12 text-center">
                <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-2">No Paused Projects</h3>
                <p className="text-muted-foreground">Paused projects will appear here</p>
              </Card>
            ) : (
              pausedProjects.map((project, index) => (
                <Card
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="glass-effect border-border hover-scale cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        <p className="text-muted-foreground">{project.description}</p>
                      </div>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        Paused
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="glass-effect"
                      >
                        Resume Project
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Projects;
