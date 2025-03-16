import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  loadingClassName?: string;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  loadingClassName = '',
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setCurrentSrc(null);
  }, [src]);

  useEffect(() => {
    const currentImage = imageRef.current;

    if (!currentImage || !src) return;

    const cleanup = () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSrc(src);
            cleanup();
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    observerRef.current.observe(currentImage);
    return cleanup;
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    onError?.();
  };

  return (
    <div className="relative overflow-hidden w-full h-full">
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Main Image */}
      <img
        ref={imageRef}
        src={currentSrc || undefined}
        alt={alt}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${error ? 'hidden' : ''}
          ${className}
          ${isLoading ? loadingClassName : ''}
        `}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* Loading Spinner */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <svg
            className="w-12 h-12 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-gray-500">Failed to load image</p>
        </div>
      )}
    </div>
  );
};

export default LazyImage; 