import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { scrollRevealVariants } from "./variants";

// Scroll reveal hook
export const useScrollReveal = (threshold = 0.1) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return { ref, controls };
};

// Scroll reveal component
export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  threshold = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  threshold?: number;
}) => {
  const { ref, controls } = useScrollReveal(threshold);

  const directionVariants = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 },
  };

  const customVariants = {
    hidden: {
      opacity: 0,
      ...directionVariants[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={customVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered scroll reveal for lists
export const StaggeredScrollReveal = ({
  children,
  className = "",
  staggerDelay = 0.1,
  threshold = 0.1,
}: {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  threshold?: number;
}) => {
  const { ref, controls } = useScrollReveal(threshold);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
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

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Parallax scroll component
export const ParallaxScroll = ({
  children,
  speed = 0.5,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useInView(ref, { once: false });
  const y = scrollYProgress * speed * 100;

  return (
    <motion.div
      ref={ref}
      style={{ y: `${y}px` }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Progressive reveal animation
export const ProgressiveReveal = ({
  children,
  className = "",
  threshold = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}) => {
  const { ref, controls } = useScrollReveal(threshold);

  const progressiveVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={progressiveVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Intersection observer hook for custom animations
export const useIntersectionObserver = (
  threshold = 0.1,
  triggerOnce = true
) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: triggerOnce, amount: threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!triggerOnce) {
      controls.start("hidden");
    }
  }, [controls, isInView, triggerOnce]);

  return { ref, controls, isInView };
};

// Animated counter on scroll
export const AnimatedCounter = ({
  value,
  duration = 2,
  className = "",
}: {
  value: number;
  duration?: number;
  className?: string;
}) => {
  const { ref, controls } = useScrollReveal();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (controls.getState().current === "visible") {
      const timer = setTimeout(() => {
        const increment = value / (duration * 60);
        const counter = setInterval(() => {
          setCount((prevCount) => {
            const newCount = prevCount + increment;
            if (newCount >= value) {
              clearInterval(counter);
              return value;
            }
            return newCount;
          });
        }, 1000 / 60);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [controls, value, duration]);

  return (
    <motion.span
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={scrollRevealVariants}
      className={className}
    >
      {Math.floor(count).toLocaleString()}
    </motion.span>
  );
};

// Magnetic hover effect
export const MagneticHover = ({
  children,
  className = "",
  strength = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = (ref.current as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setPosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={isHovered ? { x: position.x, y: position.y } : { x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

// Ripple effect on click
export const RippleButton = ({
  children,
  onClick,
  className = "",
  rippleColor = "rgba(255, 255, 255, 0.3)",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  rippleColor?: string;
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);

    onClick?.();
  };

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: rippleColor,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </button>
  );
};