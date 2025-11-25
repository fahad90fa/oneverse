import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  height?: number;
  estimateSize?: number;
  gap?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  className?: string;
  containerClassName?: string;
}

export const VirtualizedList = <T,>({
  items,
  renderItem,
  height = 600,
  estimateSize = 100,
  gap = 0,
  onEndReached,
  onEndReachedThreshold = 0.8,
  className = "",
  containerClassName = "",
}: VirtualizedListProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isNearEnd, setIsNearEnd] = useState(false);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    gap,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  useEffect(() => {
    if (!parentRef.current) return;

    const handleScroll = () => {
      if (!parentRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage >= onEndReachedThreshold && !isNearEnd) {
        setIsNearEnd(true);
        onEndReached?.();
        setTimeout(() => setIsNearEnd(false), 500);
      }
    };

    const element = parentRef.current;
    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  }, [onEndReached, onEndReachedThreshold, isNearEnd]);

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${containerClassName}`}
      style={{ height }}
    >
      <div
        className={className}
        style={{
          height: `${totalSize}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedList;
