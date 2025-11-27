import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

const MotionButton = motion.button;

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
  variant?: 'fixed' | 'inline';
}

export const ThemeToggle = ({ showLabel = false, className = '', variant = 'fixed' }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const defaultClassName = variant === 'fixed' 
    ? "fixed top-6 right-6 z-50 p-3 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg hover:shadow-xl transition-all duration-300"
    : "p-2.5 rounded-lg border border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/40 transition-all duration-200 bg-white/50 dark:bg-white/5 w-full flex items-center justify-center gap-2";

  return (
    <MotionButton
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={className || defaultClassName}
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      initial={variant === 'fixed' && (prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -20 })}
      animate={variant === 'fixed' && (prefersReducedMotion ? {} : { opacity: 1, y: 0 })}
      transition={variant === 'fixed' && (prefersReducedMotion ? {} : { delay: 0.5 })}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <motion.div
        initial={false}
        animate={prefersReducedMotion ? {} : {
          rotate: theme === "dark" ? 0 : 180,
          scale: theme === "dark" ? 1 : 0.8
        }}
        transition={prefersReducedMotion ? {} : { duration: 0.3, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-yellow-500" aria-hidden="true" />
        ) : (
          <Moon className="h-5 w-5 text-blue-500" aria-hidden="true" />
        )}
      </motion.div>
      {showLabel && (
        <span className="text-sm font-medium">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      )}
    </MotionButton>
  );
};