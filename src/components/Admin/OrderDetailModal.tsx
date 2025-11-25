import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { User, Package, Truck, Calendar, DollarSign } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Record<string, unknown>;
  onMarkFraudulent?: (orderId: string) => void;
  onRefund?: (orderId: string) => void;
}

export const OrderDetailModal = ({
  isOpen,
  onClose,
  order,
  onMarkFraudulent,
  onRefund
}: OrderDetailModalProps) => {
  if (!order) return null;

  const statusColor = {
    pending: 'bg-yellow-500/10 text-yellow-500',
    processing: 'bg-blue-500/10 text-blue-500',
    shipped: 'bg-purple-500/10 text-purple-500',
    delivered: 'bg-green-500/10 text-green-500',
    cancelled: 'bg-red-500/10 text-red-500'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-effect border-border animate-fade-in-up max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Order Details</DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Order ID</p>
              <p className="font-mono text-sm font-medium truncate">{order.id}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge className={statusColor[order.status as keyof typeof statusColor]}>
                {order.status}
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Buyer</p>
                <p className="text-sm font-medium">{order.buyer_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Product</p>
                <p className="text-sm font-medium">{order.product_id}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Quantity</p>
              <p className="text-lg font-bold">{order.quantity}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p className="text-lg font-bold text-green-500">${order.total_price}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-xs font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {order.shipping_address && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Truck className="h-4 w-4" />
                Shipping Address
              </div>
              <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1 glass-effect text-amber-500 hover:text-amber-600"
              onClick={() => onMarkFraudulent?.(order.id)}
            >
              Mark as Fraud
            </Button>
            <Button
              variant="outline"
              className="flex-1 glass-effect text-red-500 hover:text-red-600"
              onClick={() => {
                if (confirm('Issue refund for this order?')) {
                  onRefund?.(order.id);
                }
              }}
            >
              Issue Refund
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
