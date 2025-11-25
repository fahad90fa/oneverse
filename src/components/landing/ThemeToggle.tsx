import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

const MotionButton = motion.button;

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <MotionButton
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg hover:shadow-xl transition-all duration-300"
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { delay: 0.5 }}
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
    </MotionButton>
  );
};