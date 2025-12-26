import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@mui/material';

interface LazyImageProps {
  /**
   * Image source URL
   */
  src: string;

  /**
   * Alt text for accessibility
   */
  alt: string;

  /**
   * Image width
   */
  width?: number | string;

  /**
   * Image height
   */
  height?: number | string;

  /**
   * Border radius for rounded images
   */
  borderRadius?: number | string;

  /**
   * Object fit property
   * @default 'cover'
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Lazy loading image component with Intersection Observer
 * Shows skeleton while image is loading or not in viewport
 *
 * Features:
 * - Only loads when image enters viewport (saves bandwidth)
 * - Shows skeleton placeholder during load
 * - Smooth fade-in transition
 * - Supports all standard image props
 *
 * @example
 * <LazyImage
 *   src={company.logo}
 *   alt={company.companyName}
 *   width={48}
 *   height={48}
 *   borderRadius="50%"
 * />
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  borderRadius = 0,
  objectFit = 'cover',
  className,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    // Create intersection observer to detect when image enters viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of image is visible
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      style={{
        width,
        height,
        borderRadius,
        overflow: 'hidden',
        position: 'relative',
      }}
      className={className}
    >
      {/* Show skeleton while loading */}
      {!isLoaded && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius,
          }}
        />
      )}

      {/* Only load image when in viewport */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)} // Show broken image instead of skeleton
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
    </div>
  );
};

export default LazyImage;
