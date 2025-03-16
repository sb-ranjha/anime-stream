interface ImageSize {
  width: number;
  quality?: number;
}

interface OptimizedImage {
  src: string;
  srcset: string;
  sizes: string;
}

const DEFAULT_SIZES: ImageSize[] = [
  { width: 640, quality: 75 },  // Mobile
  { width: 768, quality: 80 },  // Tablet
  { width: 1024, quality: 85 }, // Desktop
  { width: 1536, quality: 90 }, // Large Desktop
];

const DEFAULT_SIZES_STRING = 
  '(max-width: 640px) 640px, ' +
  '(max-width: 768px) 768px, ' +
  '(max-width: 1024px) 1024px, ' +
  '1536px';

const isExternalUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    return url.startsWith('http://') || 
           url.startsWith('https://') || 
           url.startsWith('//') ||
           url.startsWith('data:');
  } catch (error) {
    console.error('Error checking URL:', error);
    return false;
  }
};

export const optimizeImage = (
  originalSrc: string | undefined,
  sizes: ImageSize[] = DEFAULT_SIZES,
  sizesString: string = DEFAULT_SIZES_STRING
): OptimizedImage => {
  // Handle undefined or empty src
  if (!originalSrc) {
    return {
      src: '/placeholder.jpg', // You should add a placeholder image in your public folder
      srcset: '',
      sizes: ''
    };
  }

  // If the image is from an external source (like a CDN), return as is
  if (isExternalUrl(originalSrc)) {
    return {
      src: originalSrc,
      srcset: '',
      sizes: ''
    };
  }

  try {
    // Generate srcset for different viewport sizes
    const srcset = sizes
      .map(size => {
        const params = new URLSearchParams();
        params.append('w', size.width.toString());
        if (size.quality) {
          params.append('q', size.quality.toString());
        }
        return `${originalSrc}?${params.toString()} ${size.width}w`;
      })
      .join(', ');

    // Use the largest size as default src
    const defaultSize = sizes[sizes.length - 1];
    const params = new URLSearchParams();
    params.append('w', defaultSize.width.toString());
    if (defaultSize.quality) {
      params.append('q', defaultSize.quality.toString());
    }
    
    return {
      src: `${originalSrc}?${params.toString()}`,
      srcset,
      sizes: sizesString
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    return {
      src: originalSrc,
      srcset: '',
      sizes: ''
    };
  }
};

export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('No image source provided'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
};

export const calculateAspectRatio = (width: number, height: number): string => {
  if (!width || !height) return '16/9'; // Default aspect ratio

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };
  
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
};

export const generateBlurDataUrl = async (src: string): Promise<string> => {
  if (!src) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+';
  }

  // This is a placeholder implementation
  // In a real application, you would want to generate this server-side
  // or use a service like Cloudinary that can generate blur placeholders
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+';
}; 