import { motion } from "framer-motion";
import { typingIndicatorVariants, typingDotVariants } from "@/animations/variants";

interface TypingIndicatorProps {
  className?: string;
  show?: boolean;
}

export const TypingIndicator = ({ className = "", show = true }: TypingIndicatorProps) => {
  if (!show) return null;

  return (
    <motion.div
      variants={typingIndicatorVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex items-center gap-2 px-4 py-2 ${className}`}
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            variants={typingDotVariants}
            animate="animate"
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
            className="w-2 h-2 bg-current rounded-full opacity-60"
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground ml-1">typing</span>
    </motion.div>
  );
};

// Alternative typing indicator with bouncing dots
export const BouncingTypingIndicator = ({ className = "", show = true }: TypingIndicatorProps) => {
  if (!show) return null;

  return (
    <motion.div
      variants={typingIndicatorVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex items-center gap-2 px-4 py-2 ${className}`}
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              y: [0, -8, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "easeInOut",
            }}
            className="w-2 h-2 bg-current rounded-full"
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground ml-1">typing</span>
    </motion.div>
  );
};

// Pulse typing indicator
export const PulseTypingIndicator = ({ className = "", show = true }: TypingIndicatorProps) => {
  if (!show) return null;

  return (
    <motion.div
      variants={typingIndicatorVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex items-center gap-2 px-4 py-2 ${className}`}
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
            className="w-2 h-2 bg-current rounded-full"
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground ml-1">typing</span>
    </motion.div>
  );
};

// Wave typing indicator
export const WaveTypingIndicator = ({ className = "", show = true }: TypingIndicatorProps) => {
  if (!show) return null;

  return (
    <motion.div
      variants={typingIndicatorVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex items-center gap-2 px-4 py-2 ${className}`}
    >
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.1,
              ease: "easeInOut",
            }}
            className="w-1 h-4 bg-current rounded-full"
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground ml-1">typing</span>
    </motion.div>
  );
};

// Default export - use the bouncing dots version
export default TypingIndicator;