import { useState, useEffect } from 'react';

interface PreloadStatus {
  loaded: boolean;
  error: boolean;
}

const useImagePreloader = (imageUrls: string[]): PreloadStatus => {
  const [status, setStatus] = useState<PreloadStatus>({
    loaded: false,
    error: false,
  });

  useEffect(() => {
    if (!imageUrls.length) {
      setStatus({ loaded: true, error: false });
      return;
    }

    let mounted = true;
    let loadedCount = 0;
    let hasError = false;

    const handleLoad = () => {
      if (!mounted) return;
      loadedCount++;
      if (loadedCount === imageUrls.length) {
        setStatus({ loaded: true, error: hasError });
      }
    };

    const handleError = () => {
      if (!mounted) return;
      hasError = true;
      loadedCount++;
      if (loadedCount === imageUrls.length) {
        setStatus({ loaded: true, error: true });
      }
    };

    // Reset status when URLs change
    setStatus({ loaded: false, error: false });

    // Preload images
    imageUrls.forEach(url => {
      const img = new Image();
      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = url;
    });

    return () => {
      mounted = false;
    };
  }, [imageUrls]);

  return status;
};

export default useImagePreloader; 