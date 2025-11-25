import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  Upload,
  MessageSquare,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from "lucide-react";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number; // 0-100
  deliverables?: string[];
  feedback?: string;
  completed_at?: string;
  escrow_status: 'held' | 'released' | 'disputed';
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
  isClientView?: boolean;
  onMilestoneUpdate?: (milestoneId: string, updates: Partial<Milestone>) => void;
  onReleasePayment?: (milestoneId: string) => void;
  onRequestRevision?: (milestoneId: string, feedback: string) => void;
  className?: string;
}

export const MilestoneTracker = ({
  milestones,
  isClientView = false,
  onMilestoneUpdate,
  onReleasePayment,
  onRequestRevision,
  className = ""
}: MilestoneTrackerProps) => {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'overdue':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEscrowStatusColor = (status: string) => {
    switch (status) {
      case 'released':
        return 'bg-green-500/10 text-green-700';
      case 'disputed':
        return 'bg-red-500/10 text-red-700';
      default:
        return 'bg-yellow-500/10 text-yellow-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const handleStatusUpdate = (milestoneId: string, newStatus: Milestone['status']) => {
    onMilestoneUpdate?.(milestoneId, {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
    });
  };

  const handleReleasePayment = (milestoneId: string) => {
    onReleasePayment?.(milestoneId);
    onMilestoneUpdate?.(milestoneId, { escrow_status: 'released' });
  };

  const handleRequestRevision = (milestoneId: string) => {
    if (revisionFeedback.trim()) {
      onRequestRevision?.(milestoneId, revisionFeedback);
      onMilestoneUpdate?.(milestoneId, {
        status: 'pending',
        feedback: revisionFeedback
      });
      setRevisionFeedback("");
      setSelectedMilestone(null);
    }
  };

  const totalProgress = milestones.length > 0
    ? milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length
    : 0;

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const releasedAmount = milestones
    .filter(m => m.escrow_status === 'released')
    .reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Project Overview */}
      <Card className="glass-effect border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Project Milestones</h3>
          <div className="flex items-center gap-4 text-sm">
            <span>{completedCount}/{milestones.length} completed</span>
            <Badge variant="secondary">
              {totalProgress.toFixed(0)}% complete
            </Badge>
          </div>
        </div>

        <Progress value={totalProgress} className="h-3 mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Value</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">${releasedAmount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Released</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">${(totalAmount - releasedAmount).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">In Escrow</p>
          </div>
        </div>
      </Card>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="glass-effect border-border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{milestone.title}</h4>
                      <Badge className={getStatusColor(milestone.status)}>
                        {getStatusIcon(milestone.status)}
                        <span className="ml-1 capitalize">{milestone.status}</span>
                      </Badge>
                      <Badge className={getEscrowStatusColor(milestone.escrow_status)}>
                        {milestone.escrow_status}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-3">{milestone.description}</p>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-medium">${milestone.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className={`${
                          isOverdue(milestone.due_date) && milestone.status !== 'completed'
                            ? 'text-red-600 font-medium'
                            : ''
                        }`}>
                          Due {formatDate(milestone.due_date)}
                        </span>
                      </div>
                      {milestone.completed_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">
                            Completed {formatDate(milestone.completed_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Progress */}
                    <div className="w-24">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{milestone.progress}%</span>
                      </div>
                      <Progress value={milestone.progress} className="h-2" />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!isClientView && milestone.status !== 'completed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(milestone.id, 'in_progress')}
                            disabled={milestone.status === 'in_progress'}
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(milestone.id, 'completed')}
                            disabled={milestone.status === 'completed'}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        </>
                      )}

                      {isClientView && milestone.status === 'completed' && milestone.escrow_status === 'held' && (
                        <Button
                          size="sm"
                          onClick={() => handleReleasePayment(milestone.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Release Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feedback/Revision Section */}
                <AnimatePresence>
                  {selectedMilestone === milestone.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-border pt-4 mt-4"
                    >
                      {isClientView ? (
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Request Revision</label>
                          <Textarea
                            placeholder="Describe what needs to be revised..."
                            value={revisionFeedback}
                            onChange={(e) => setRevisionFeedback(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRequestRevision(milestone.id)}
                              disabled={!revisionFeedback.trim()}
                            >
                              Send Revision Request
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedMilestone(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        milestone.feedback && (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">Revision Requested</p>
                                <p className="text-sm text-yellow-700 mt-1">{milestone.feedback}</p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Show Revision Button */}
                {isClientView && milestone.status === 'completed' && (
                  <div className="flex justify-end mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMilestone(
                        selectedMilestone === milestone.id ? null : milestone.id
                      )}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {selectedMilestone === milestone.id ? 'Hide' : 'Request Revision'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};