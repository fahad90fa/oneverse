import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Filter
} from "lucide-react";

interface ActivityItem {
  id: string;
  activity_type: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ActivityTimelineProps {
  projectId: string;
}

export const ActivityTimeline = ({ projectId }: ActivityTimelineProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        let query = supabase
          .from("project_activities")
          .select(`
            *,
            user:user_id (full_name, avatar_url)
          `)
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (filter !== "all") {
          query = query.eq("activity_type", filter);
        }

        const { data, error } = await query;

        if (error) throw error;
        setActivities(data || []);
      } catch (error: unknown) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    const subscription = supabase
      .channel(`project_activities_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_activities',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId, filter]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'task_updated':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'file_uploaded':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'time_logged':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_created':
        return 'border-l-green-500';
      case 'task_updated':
        return 'border-l-blue-500';
      case 'file_uploaded':
        return 'border-l-purple-500';
      case 'time_logged':
        return 'border-l-orange-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const exportActivities = () => {
    const csvContent = [
      ['Date', 'User', 'Activity Type', 'Description'],
      ...activities.map(activity => [
        new Date(activity.created_at).toLocaleString(),
        activity.user.full_name,
        activity.activity_type,
        activity.description
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-activities-${projectId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'task_created', label: 'Task Created' },
    { value: 'task_updated', label: 'Task Updated' },
    { value: 'file_uploaded', label: 'File Uploaded' },
    { value: 'time_logged', label: 'Time Logged' }
  ];

  if (loading) {
    return (
      <Card className="glass-effect border-border p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Activity Timeline</h2>
          <p className="text-muted-foreground">Real-time project activity feed</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 glass-effect border-border">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={exportActivities}
            className="glass-effect"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="glass-effect border-border">
        <div className="p-6">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
                <p className="text-muted-foreground">
                  Project activities will appear here as team members work on tasks
                </p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-4 p-4 border-l-4 ${getActivityColor(activity.activity_type)} bg-muted/20 rounded-r-lg`}
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.activity_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{activity.user.full_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {activity.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatTimeAgo(activity.created_at)}</span>
                      {activity.metadata && activity.metadata.file_size && (
                        <span>{Math.round(activity.metadata.file_size / 1024)} KB</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};