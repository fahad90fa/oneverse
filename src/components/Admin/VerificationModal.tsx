import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: Record<string, unknown>;
  onApprove?: (verificationId: string, notes?: string) => void;
  onReject?: (verificationId: string, notes?: string) => void;
}

export const VerificationModal = ({
  isOpen,
  onClose,
  verification,
  onApprove,
  onReject
}: VerificationModalProps) => {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!verification) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    await onApprove?.(verification.id, notes);
    setIsLoading(false);
    setNotes('');
    onClose();
  };

  const handleReject = async () => {
    setIsLoading(true);
    await onReject?.(verification.id, notes);
    setIsLoading(false);
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-effect border-border animate-fade-in-up">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Verification Review</DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-4 rounded-lg bg-muted/30 border border-border flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={verification.profiles?.avatar_url} />
              <AvatarFallback>{verification.profiles?.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-semibold">{verification.profiles?.full_name}</h3>
              <p className="text-sm text-muted-foreground">{verification.profiles?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Verification Type</p>
            <Badge className="bg-blue-500/10 text-blue-500 w-fit">
              {verification.verification_type}
            </Badge>
          </div>

          {verification.status === 'pending' && (
            <div className="space-y-2">
              <label className="text-sm font-medium block">Admin Notes</label>
              <Textarea
                placeholder="Add notes for this verification request..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="glass-effect min-h-24"
              />
            </div>
          )}

          {verification.admin_notes && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Previous Notes
              </div>
              <p className="text-sm text-muted-foreground">{verification.admin_notes}</p>
            </div>
          )}

          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground mb-2">Submitted</p>
            <p className="text-sm">
              {new Date(verification.created_at).toLocaleString()}
            </p>
          </div>

          {verification.status === 'pending' && (
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 glass-effect text-red-500 hover:text-red-600"
                onClick={handleReject}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={handleApprove}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          )}

          {verification.status !== 'pending' && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm">
                <span className="font-medium">Status: </span>
                <Badge className={
                  verification.status === 'approved'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                }>
                  {verification.status}
                </Badge>
              </p>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
