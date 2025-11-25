import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  MessageSquare,
  FileText
} from "lucide-react";

export interface EscrowTransaction {
  id: string;
  amount: number;
  status: 'held' | 'released' | 'disputed' | 'refunded';
  created_at: string;
  released_at?: string;
  description: string;
  milestone_id?: string;
  dispute_reason?: string;
  dispute_resolved_at?: string;
}

interface EscrowSystemProps {
  transactions: EscrowTransaction[];
  totalEscrowAmount: number;
  releasedAmount: number;
  onReleasePayment?: (transactionId: string) => void;
  onInitiateDispute?: (transactionId: string, reason: string) => void;
  onResolveDispute?: (transactionId: string, resolution: string) => void;
  isClientView?: boolean;
  className?: string;
}

export const EscrowSystem = ({
  transactions,
  totalEscrowAmount,
  releasedAmount,
  onReleasePayment,
  onInitiateDispute,
  onResolveDispute,
  isClientView = false,
  className = ""
}: EscrowSystemProps) => {
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'released':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'held':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'disputed':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'refunded':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'released':
        return <Unlock className="h-4 w-4" />;
      case 'held':
        return <Lock className="h-4 w-4" />;
      case 'disputed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'refunded':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReleasePayment = (transactionId: string) => {
    onReleasePayment?.(transactionId);
  };

  const handleInitiateDispute = (transactionId: string) => {
    if (disputeReason.trim()) {
      onInitiateDispute?.(transactionId, disputeReason);
      setDisputeReason("");
      setShowDisputeForm(false);
      setSelectedTransaction(null);
    }
  };

  const heldAmount = totalEscrowAmount - releasedAmount;
  const releaseProgress = totalEscrowAmount > 0 ? (releasedAmount / totalEscrowAmount) * 100 : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Escrow Overview */}
      <Card className="glass-effect border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Escrow Protection</h3>
            <p className="text-sm text-muted-foreground">
              Secure payment holding and milestone-based releases
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">${totalEscrowAmount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Escrow</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">${releasedAmount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Released</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">${heldAmount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Currently Held</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Release Progress</span>
            <span>{releaseProgress.toFixed(1)}%</span>
          </div>
          <Progress value={releaseProgress} className="h-3" />
        </div>
      </Card>

      {/* Security Notice */}
      <Alert className="border-blue-500/20 bg-blue-500/10">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Escrow Protection:</strong> Funds are held securely by our payment processor until milestones are completed and approved. Both parties are protected throughout the project lifecycle.
        </AlertDescription>
      </Alert>

      {/* Transaction History */}
      <Card className="glass-effect border-border">
        <div className="p-6 border-b border-border">
          <h4 className="font-semibold">Transaction History</h4>
          <p className="text-sm text-muted-foreground">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="divide-y divide-border">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No escrow transactions yet</p>
            </div>
          ) : (
            transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getStatusColor(transaction.status)}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">{transaction.status}</span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </span>
                    </div>

                    <p className="font-medium mb-1">{transaction.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${transaction.amount.toFixed(2)}
                      </span>
                      {transaction.released_at && (
                        <span className="flex items-center gap-1">
                          <Unlock className="h-3 w-3" />
                          Released {formatDate(transaction.released_at)}
                        </span>
                      )}
                    </div>

                    {/* Dispute Information */}
                    {transaction.status === 'disputed' && transaction.dispute_reason && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Dispute Reason</p>
                            <p className="text-sm text-red-700 mt-1">{transaction.dispute_reason}</p>
                            {transaction.dispute_resolved_at && (
                              <p className="text-xs text-red-600 mt-1">
                                Resolved {formatDate(transaction.dispute_resolved_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {isClientView && transaction.status === 'held' && (
                      <Button
                        size="sm"
                        onClick={() => handleReleasePayment(transaction.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Unlock className="h-3 w-3 mr-1" />
                        Release
                      </Button>
                    )}

                    {(transaction.status === 'held' || transaction.status === 'released') && !transaction.dispute_reason && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTransaction(
                            selectedTransaction === transaction.id ? null : transaction.id
                          );
                          setShowDisputeForm(selectedTransaction !== transaction.id);
                        }}
                        className="border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Dispute
                      </Button>
                    )}
                  </div>
                </div>

                {/* Dispute Form */}
                <AnimatePresence>
                  {selectedTransaction === transaction.id && showDisputeForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 border border-red-500/20 rounded-lg bg-red-500/5"
                    >
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-red-800">Dispute Reason</label>
                        <textarea
                          value={disputeReason}
                          onChange={(e) => setDisputeReason(e.target.value)}
                          placeholder="Describe the issue with this transaction..."
                          className="w-full p-3 text-sm border border-red-500/20 rounded-md bg-background resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleInitiateDispute(transaction.id)}
                            disabled={!disputeReason.trim()}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Submit Dispute
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTransaction(null);
                              setShowDisputeForm(false);
                              setDisputeReason("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};