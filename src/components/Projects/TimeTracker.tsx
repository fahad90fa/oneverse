import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Pause,
  Square,
  Clock,
  Plus,
  Calendar,
  DollarSign
} from "lucide-react";

interface TimeEntry {
  id: string;
  task_id?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  description?: string;
  is_billable: boolean;
  task?: {
    title: string;
  };
}

interface TimeTrackerProps {
  projectId: string;
  userRole: string;
}

export const TimeTracker = ({ projectId, userRole }: TimeTrackerProps) => {
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [loading, setLoading] = useState(true);

  // Manual entry form
  const [manualTaskId, setManualTaskId] = useState("");
  const [manualHours, setManualHours] = useState("");
  const [manualMinutes, setManualMinutes] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualBillable, setManualBillable] = useState(true);

  useEffect(() => {
    fetchTimeEntries();

    // Check for active timer on mount
    checkActiveTimer();

    // Set up timer interval
    const interval = setInterval(() => {
      if (activeTimer) {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const checkActiveTimer = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("time_entries")
        .select(`
          *,
          task:task_id (title)
        `)
        .eq("user_id", session.user.id)
        .eq("project_id", projectId)
        .is("end_time", null)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      if (data) {
        setActiveTimer(data);
        const startTime = new Date(data.start_time);
        const now = new Date();
        setElapsedTime(Math.floor((now.getTime() - startTime.getTime()) / 1000));
      }
    } catch (error: any) {
      console.error("Error checking active timer:", error);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("time_entries")
        .select(`
          *,
          task:task_id (title)
        `)
        .eq("user_id", session.user.id)
        .eq("project_id", projectId)
        .order("start_time", { ascending: false })
        .limit(20);

      if (error) throw error;
      setTimeEntries(data || []);
    } catch (error: any) {
      console.error("Error fetching time entries:", error);
      toast({
        title: "Error",
        description: "Failed to load time entries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async (taskId?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          project_id: projectId,
          task_id: taskId || null,
          user_id: session.user.id,
          start_time: new Date().toISOString(),
          is_billable: true
        })
        .select(`
          *,
          task:task_id (title)
        `)
        .single();

      if (error) throw error;

      setActiveTimer(data);
      setElapsedTime(0);

      toast({
        title: "Timer started",
        description: taskId ? "Time tracking started for task" : "Time tracking started"
      });
    } catch (error: any) {
      console.error("Error starting timer:", error);
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive"
      });
    }
  };

  const pauseTimer = async () => {
    if (!activeTimer) return;

    try {
      const endTime = new Date().toISOString();
      const { error } = await supabase
        .from("time_entries")
        .update({ end_time: endTime })
        .eq("id", activeTimer.id);

      if (error) throw error;

      setActiveTimer(null);
      setElapsedTime(0);
      fetchTimeEntries();

      toast({
        title: "Timer stopped",
        description: "Time entry saved"
      });
    } catch (error: any) {
      console.error("Error stopping timer:", error);
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive"
      });
    }
  };

  const addManualEntry = async () => {
    const hours = parseInt(manualHours) || 0;
    const minutes = parseInt(manualMinutes) || 0;
    const totalMinutes = (hours * 60) + minutes;

    if (totalMinutes <= 0) {
      toast({
        title: "Invalid duration",
        description: "Please enter a valid duration",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const entryDate = new Date(manualDate);
      const startTime = new Date(entryDate);
      const endTime = new Date(startTime.getTime() + (totalMinutes * 60 * 1000));

      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          project_id: projectId,
          task_id: manualTaskId || null,
          user_id: session.user.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          description: manualDescription,
          is_billable: manualBillable
        })
        .select(`
          *,
          task:task_id (title)
        `)
        .single();

      if (error) throw error;

      setTimeEntries(prev => [data, ...prev]);
      setShowManualEntry(false);
      resetManualForm();

      toast({
        title: "Time entry added",
        description: "Manual time entry has been saved"
      });
    } catch (error: any) {
      console.error("Error adding manual entry:", error);
      toast({
        title: "Error",
        description: "Failed to add time entry",
        variant: "destructive"
      });
    }
  };

  const resetManualForm = () => {
    setManualTaskId("");
    setManualHours("");
    setManualMinutes("");
    setManualDescription("");
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualBillable(true);
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTotalTime = () => {
    return timeEntries.reduce((total, entry) => total + (entry.duration_minutes || 0), 0);
  };

  const getBillableTime = () => {
    return timeEntries
      .filter(entry => entry.is_billable)
      .reduce((total, entry) => total + (entry.duration_minutes || 0), 0);
  };

  if (loading) {
    return (
      <Card className="glass-effect border-border p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
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
          <h2 className="text-2xl font-bold mb-2">Time Tracker</h2>
          <p className="text-muted-foreground">Track time spent on project tasks</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="glass-effect"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manual Entry
          </Button>
          {!activeTimer ? (
            <Button
              onClick={() => startTimer()}
              className="bg-gradient-to-r from-primary to-blue-500"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
          ) : (
            <Button
              onClick={pauseTimer}
              variant="destructive"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Timer
            </Button>
          )}
        </div>
      </div>

      {/* Active Timer Display */}
      {activeTimer && (
        <Card className="glass-effect border-border p-6 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Timer Running</h3>
              <p className="text-muted-foreground">
                {activeTimer.task ? `Working on: ${activeTimer.task.title}` : 'General project work'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-primary">
                {formatElapsedTime(elapsedTime)}
              </div>
              <p className="text-sm text-muted-foreground">Elapsed time</p>
            </div>
          </div>
        </Card>
      )}

      {/* Manual Entry Form */}
      {showManualEntry && (
        <Card className="glass-effect border-border p-6">
          <h3 className="font-semibold mb-4">Add Manual Time Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="glass-effect border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hours</label>
              <Input
                type="number"
                placeholder="0"
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                className="glass-effect border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Minutes</label>
              <Input
                type="number"
                placeholder="0"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                className="glass-effect border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Billable</label>
              <Select value={manualBillable.toString()} onValueChange={(value) => setManualBillable(value === 'true')}>
                <SelectTrigger className="glass-effect border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="What did you work on?"
              className="glass-effect border-border"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowManualEntry(false);
                resetManualForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={addManualEntry}
              className="bg-gradient-to-r from-primary to-blue-500"
            >
              Add Entry
            </Button>
          </div>
        </Card>
      )}

      {/* Time Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-effect border-border p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Time</p>
              <p className="text-2xl font-bold">{formatDuration(getTotalTime())}</p>
            </div>
          </div>
        </Card>
        <Card className="glass-effect border-border p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Billable Time</p>
              <p className="text-2xl font-bold">{formatDuration(getBillableTime())}</p>
            </div>
          </div>
        </Card>
        <Card className="glass-effect border-border p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">
                {formatDuration(
                  timeEntries
                    .filter(entry => {
                      const entryDate = new Date(entry.start_time);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return entryDate >= weekAgo;
                    })
                    .reduce((total, entry) => total + (entry.duration_minutes || 0), 0)
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Time Entries List */}
      <Card className="glass-effect border-border">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Time Entries</h3>
          <div className="space-y-3">
            {timeEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No time entries yet</p>
            ) : (
              timeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {entry.task ? entry.task.title : 'General project work'}
                      </p>
                      {entry.is_billable && (
                        <Badge variant="outline" className="text-xs">
                          Billable
                        </Badge>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.start_time).toLocaleDateString()} • {formatDuration(entry.duration_minutes)}
                    </p>
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