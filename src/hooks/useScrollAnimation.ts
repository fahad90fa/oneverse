import { useEffect, useState } from "react";

export const useScrollAnimation = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? "down" : "up";

      setScrollY(currentScrollY);
      setScrollDirection(direction);
      setIsAtTop(currentScrollY < 50);
      setIsAtBottom(
        currentScrollY + window.innerHeight >= document.documentElement.scrollHeight - 50
      );

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return {
    scrollY,
    scrollDirection,
    isAtTop,
    isAtBottom,
    scrollProgress: scrollY / (document.documentElement.scrollHeight - window.innerHeight),
  };
};

// Hook for element visibility in viewport
export const useElementVisibility = (
  elementRef: React.RefObject<Element>,
  threshold = 0.1
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, threshold]);

  return { isVisible, hasBeenVisible };
};

// Hook for parallax effect
export const useParallax = (speed = 0.5) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return offset;
};

// Hook for staggered animations
export const useStaggeredAnimation = (itemCount: number, delay = 0.1) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  const showItem = (index: number) => {
    setTimeout(() => {
      setVisibleItems((prev) => new Set([...prev, index]));
    }, index * delay * 1000);
  };

  const hideItem = (index: number) => {
    setVisibleItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const showAll = () => {
    for (let i = 0; i < itemCount; i++) {
      showItem(i);
    }
  };

  const hideAll = () => {
    setVisibleItems(new Set());
  };

  return {
    visibleItems,
    showItem,
    hideItem,
    showAll,
    hideAll,
    isVisible: (index: number) => visibleItems.has(index),
  };
};

// Hook for magnetic hover effect
export const useMagneticHover = (strength = 0.3) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!isHovered) return;

    const rect = e.currentTarget.getBoundingClientRect();
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

  return {
    position,
    isHovered,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
};

// Hook for animated counter
export const useAnimatedCounter = (
  endValue: number,
  duration = 2000,
  startValue = 0
) => {
  const [count, setCount] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const startTime = Date.now();
    const difference = endValue - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (easeOut)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setCount(startValue + difference * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  const reset = () => {
    setCount(startValue);
    setIsAnimating(false);
  };

  return {
    count: Math.round(count),
    isAnimating,
    startAnimation,
    reset,
  };
};

// Hook for typewriter effect
export const useTypewriter = (
  text: string,
  speed = 50,
  delay = 0
) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const startTyping = () => {
    if (isTyping) return;

    setIsTyping(true);
    setDisplayText("");

    setTimeout(() => {
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayText((prev) => prev + text[index]);
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, speed);
    }, delay);
  };

  const reset = () => {
    setDisplayText("");
    setIsTyping(false);
  };

  return {
    displayText,
    isTyping,
    startTyping,
    reset,
  };
};