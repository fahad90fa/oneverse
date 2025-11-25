import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  Star
} from "lucide-react";

export interface Proposal {
  id: string;
  job_id: string;
  worker_id: string;
  worker_name: string;
  worker_avatar?: string;
  worker_rating?: number;
  worker_review_count?: number;
  cover_letter: string;
  proposed_price: number;
  estimated_duration: string;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    due_date: string;
    status?: 'pending' | 'completed' | 'in_progress';
  }>;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at?: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  isClientView?: boolean;
  onAccept?: (proposalId: string) => void;
  onReject?: (proposalId: string) => void;
  onMessage?: (workerId: string) => void;
  className?: string;
}

export const ProposalCard = ({
  proposal,
  isClientView = false,
  onAccept,
  onReject,
  onMessage,
  className = ""
}: ProposalCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'withdrawn':
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      default:
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'withdrawn':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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

  const totalMilestoneAmount = proposal.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
  const completedMilestones = proposal.milestones.filter(m => m.status === 'completed').length;
  const progressPercentage = proposal.milestones.length > 0 ? (completedMilestones / proposal.milestones.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="glass-effect border-border overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                  {proposal.worker_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{proposal.worker_name}</h3>
                  {proposal.worker_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        {proposal.worker_rating.toFixed(1)} ({proposal.worker_review_count || 0})
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Submitted {formatDate(proposal.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(proposal.status)}>
                {getStatusIcon(proposal.status)}
                <span className="ml-1 capitalize">{proposal.status}</span>
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Proposed</p>
              <p className="font-bold text-primary">${proposal.proposed_price.toFixed(2)}</p>
            </div>

            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-bold">{proposal.estimated_duration}</p>
            </div>

            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Milestones</p>
              <p className="font-bold">{proposal.milestones.length}</p>
            </div>

            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Attachments</p>
              <p className="font-bold">{proposal.attachments?.length || 0}</p>
            </div>
          </div>

          {/* Cover Letter Preview */}
          <div className="mb-4">
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {proposal.cover_letter}
            </p>
          </div>

          {/* Progress Bar (for accepted proposals) */}
          {proposal.status === 'accepted' && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Project Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedMilestones}/{proposal.milestones.length} completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {isClientView && proposal.status === 'pending' && (
                <>
                  <Button
                    onClick={() => onAccept?.(proposal.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => onReject?.(proposal.id)}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}

              <Button
                onClick={() => onMessage?.(proposal.worker_id)}
                variant="outline"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>

            {proposal.status === 'accepted' && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active Project
              </Badge>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-border"
            >
              <div className="p-6 space-y-6">
                {/* Full Cover Letter */}
                <div>
                  <h4 className="font-semibold mb-3">Cover Letter</h4>
                  <p className="text-sm leading-relaxed">{proposal.cover_letter}</p>
                </div>

                {/* Milestones */}
                <div>
                  <h4 className="font-semibold mb-3">Project Milestones</h4>
                  <div className="space-y-3">
                    {proposal.milestones.map((milestone, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium">{milestone.title}</h5>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              ${milestone.amount.toFixed(2)}
                            </Badge>
                            {milestone.status && (
                              <Badge
                                className={
                                  milestone.status === 'completed'
                                    ? 'bg-green-500/10 text-green-700'
                                    : milestone.status === 'in_progress'
                                    ? 'bg-blue-500/10 text-blue-700'
                                    : 'bg-gray-500/10 text-gray-700'
                                }
                              >
                                {milestone.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {milestone.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDate(milestone.due_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attachments */}
                {proposal.attachments && proposal.attachments.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Attachments</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {proposal.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">{attachment.type}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(attachment.url, '_blank')}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};