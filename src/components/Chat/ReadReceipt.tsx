import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";

interface ReadReceiptProps {
  status: 'sent' | 'delivered' | 'read';
  className?: string;
}

export const ReadReceipt = ({ status, className = "" }: ReadReceiptProps) => {
  const getIcon = () => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            <CheckCheck className="h-3 w-3 text-blue-500" />
          </motion.div>
        );
      default:
        return null;
    }
  };

  const getAnimation = () => {
    if (status === 'read') {
      return {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.3, ease: "easeOut" }
      };
    }
    return {};
  };

  return (
    <motion.div
      className={`flex items-center justify-end mt-1 ${className}`}
      {...getAnimation()}
    >
      {getIcon()}
    </motion.div>
  );
};

// Animated read receipt with status transition
export const AnimatedReadReceipt = ({
  status,
  className = ""
}: ReadReceiptProps) => {
  return (
    <motion.div
      className={`flex items-center justify-end mt-1 space-x-1 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Single checkmark for sent */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: status === 'sent' || status === 'delivered' || status === 'read' ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Check className="h-3 w-3 text-muted-foreground" />
      </motion.div>

      {/* Second checkmark for delivered/read */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: status === 'delivered' || status === 'read' ? 1 : 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Check className={`h-3 w-3 ${status === 'read' ? 'text-blue-500' : 'text-muted-foreground'}`} />
      </motion.div>
    </motion.div>
  );
};

// Status text indicator
export const MessageStatus = ({
  status,
  timestamp,
  className = ""
}: {
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  className?: string;
}) => {
  const getStatusText = () => {
    switch (status) {
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      default:
        return '';
    }
  };

  return (
    <motion.div
      className={`text-xs text-muted-foreground mt-1 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {getStatusText()} • {new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}
    </motion.div>
  );
};