import { useState, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  objectFit?: "cover" | "contain" | "fill" | "scale-down";
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
  objectFit = "cover",
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supportsWebp, setSupportsWebp] = useState(false);

  useEffect(() => {
    const preloadImage = () => {
      const img = new Image();
      img.onload = () => setImageSrc(src);
      img.onerror = () => setImageSrc(src);
      img.src = src;
    };

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    setSupportsWebp(canvas.toDataURL("image/webp").indexOf("image/webp") === 5);

    if (priority) {
      preloadImage();
    }
  }, [priority, src]);

  const getOptimizedSrc = (originalSrc: string): string => {
    if (!supportsWebp) return originalSrc;

    const isCloudinaryUrl = originalSrc.includes("cloudinary");
    if (isCloudinaryUrl && !originalSrc.includes("/f_webp")) {
      return originalSrc.includes("?")
        ? `${originalSrc}&f=webp`
        : `${originalSrc}?f=webp`;
    }

    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <picture>
      {supportsWebp && src.includes("cloudinary") && (
        <source
          srcSet={`${src.includes("?") ? `${src}&f=webp` : `${src}?f=webp`}`}
          type="image/webp"
        />
      )}
      <img
        src={imageSrc || optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        className={`${className} ${isLoading ? "animate-pulse" : ""}`}
        style={{
          objectFit,
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "auto",
        }}
        onLoad={() => {
          setIsLoading(false);
          setImageSrc(optimizedSrc);
        }}
        onError={() => {
          setIsLoading(false);
          setImageSrc(src);
        }}
      />
    </picture>
  );
};

export default OptimizedImage;
