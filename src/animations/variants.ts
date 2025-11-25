import { Variants } from "framer-motion";

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

export const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

// Card animation variants
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.05,
    y: -5,
    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// Stagger animation for lists
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Profile specific animations
export const profileCardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotateY: -15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.02,
    rotateY: 5,
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.3,
    },
  },
};

// Skill chart animations
export const skillBarVariants: Variants = {
  hidden: {
    width: 0,
  },
  visible: (percentage: number) => ({
    width: `${percentage}%`,
    transition: {
      duration: 1.5,
      ease: "easeOut",
      delay: 0.2,
    },
  }),
};

// Counter animation variants
export const counterVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "backOut",
    },
  },
};

// Badge animation variants
export const badgeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    rotate: -180,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: "backOut",
      delay: 0.3,
    },
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.2,
    },
  },
};

// Timeline animation variants
export const timelineVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const timelineConnectorVariants: Variants = {
  hidden: {
    height: 0,
  },
  visible: {
    height: "100%",
    transition: {
      duration: 1,
      ease: "easeOut",
      delay: 0.5,
    },
  },
};

// Button animation variants
export const buttonVariants: Variants = {
  idle: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

// Modal animation variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
    },
  },
};

// Loading animation variants
export const loadingVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const loadingDotVariants: Variants = {
  hidden: {
    y: 0,
    opacity: 0.5,
  },
  visible: {
    y: [-10, 0, -10],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Scroll reveal variants
export const scrollRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Typing indicator variants
export const typingIndicatorVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

export const typingDotVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Ripple effect variants
export const rippleVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 1,
  },
  visible: {
    scale: 4,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Magnetic hover variants
export const magneticVariants: Variants = {
  hover: {
    x: 0,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 15,
    },
  },
};

// Parallax variants
export const parallaxVariants: Variants = {
  hidden: {
    y: 100,
  },
  visible: {
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};