import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { KanbanBoard } from "@/components/Projects/KanbanBoard";
import { TimeTracker } from "@/components/Projects/TimeTracker";
import { FileRepository } from "@/components/Projects/FileRepository";
import { ActivityTimeline } from "@/components/Projects/ActivityTimeline";
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  MessageCircle,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<Record<string, unknown>>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchProject();
      determineUserRole();
    }
  }, [id]);

  const determineUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .limit(1)
        .single();

      setUserRole(roles?.role || "worker");
    } catch (error) {
      console.error("Error determining role:", error);
    }
  };

  const fetchProject = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          worker:worker_id (id, full_name, avatar_url, email),
          client:client_id (id, full_name, avatar_url, email),
          job:job_id (title, description, budget, skills_required)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Check if user has access to this project
      if (data.worker_id !== session.user.id && data.client_id !== session.user.id) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this project",
          variant: "destructive"
        });
        navigate("/projects");
        return;
      }

      setProject(data);
    } catch (error: unknown) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive"
      });
      navigate("/projects");
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
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5" />;
      case "active":
        return <Clock className="h-5 w-5" />;
      case "cancelled":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-effect border-border p-8 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate("/projects")}>
            Back to Projects
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/projects")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>

          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {project.title}
              </h1>
              <p className="text-muted-foreground mb-4">{project.description}</p>

              <div className="flex items-center gap-4 flex-wrap">
                <Badge className={`${getStatusColor(project.status)} border`}>
                  {getStatusIcon(project.status)}
                  <span className="ml-1 capitalize">{project.status}</span>
                </Badge>

                {project.budget && (
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span>${parseFloat(project.budget).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="glass-effect">
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </Button>
              <Button variant="outline" className="glass-effect">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Project Team */}
          <Card className="glass-effect border-border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Project Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{project.client?.full_name || 'Client'}</p>
                  <p className="text-sm text-muted-foreground">Project Owner</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">{project.worker?.full_name || 'Worker'}</p>
                  <p className="text-sm text-muted-foreground">Assigned Worker</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Collaboration Tools Tabs */}
        <Tabs defaultValue="kanban" className="animate-fade-in-up">
          <TabsList className="glass-effect border-border mb-6">
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="time">Time Tracker</TabsTrigger>
            <TabsTrigger value="files">File Repository</TabsTrigger>
            <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="space-y-6">
            <KanbanBoard projectId={id!} userRole={userRole} />
          </TabsContent>

          <TabsContent value="time" className="space-y-6">
            <TimeTracker projectId={id!} userRole={userRole} />
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <FileRepository projectId={id!} userRole={userRole} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityTimeline projectId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetail;