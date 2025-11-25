import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "./variants";

// Page transition wrapper component
export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

// Slide transition for navigation
export const SlideTransition = ({
  children,
  direction = "right"
}: {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
}) => {
  const slideVariants = {
    initial: {
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
      y: direction === "up" ? "-100%" : direction === "down" ? "100%" : 0,
      opacity: 0,
    },
    in: {
      x: 0,
      y: 0,
      opacity: 1,
    },
    out: {
      x: direction === "left" ? "100%" : direction === "right" ? "-100%" : 0,
      y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0,
      opacity: 0,
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={slideVariants}
      transition={pageTransition}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

// Fade transition
export const FadeTransition = ({ children }: { children: React.ReactNode }) => {
  const fadeVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={fadeVariants}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

// Scale transition
export const ScaleTransition = ({ children }: { children: React.ReactNode }) => {
  const scaleVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.05 },
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={scaleVariants}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

// Staggered children transition
export const StaggeredTransition = ({
  children,
  staggerDelay = 0.1
}: {
  children: React.ReactNode;
  staggerDelay?: number;
}) => {
  const containerVariants = {
    initial: { opacity: 0 },
    in: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      },
    },
    out: { opacity: 0 },
  };

  const childVariants = {
    initial: { opacity: 0, y: 20 },
    in: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    out: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={containerVariants}
      className="w-full"
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={childVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
};

// Loading transition with skeleton
export const LoadingTransition = ({
  children,
  isLoading
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) => {
  const loadingVariants = {
    loading: { opacity: 0.5 },
    loaded: { opacity: 1 },
  };

  return (
    <motion.div
      variants={loadingVariants}
      animate={isLoading ? "loading" : "loaded"}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

// Route-based transitions
export const getRouteTransition = (pathname: string) => {
  // Different transitions for different route types
  if (pathname.startsWith("/dashboard")) {
    return SlideTransition;
  } else if (pathname.startsWith("/profile")) {
    return ScaleTransition;
  } else if (pathname.startsWith("/chat")) {
    return FadeTransition;
  } else {
    return PageTransition;
  }
};