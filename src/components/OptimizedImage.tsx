import { useState, useCallback, useMemo } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lowQualitySrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  lowQualitySrc,
  className,
  style,
  loading = "lazy",
  ...props
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isMobile, isLowEndDevice } = useMobileOptimization();

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    if (fallbackSrc && !imageError) {
      // Intentar cargar imagen de respaldo
      setImageError(false);
    }
  }, [fallbackSrc, imageError]);

  // Determinar qué imagen cargar
  const currentSrc = useMemo(() => {
    return imageError && fallbackSrc 
      ? fallbackSrc 
      : isLowEndDevice && lowQualitySrc 
      ? lowQualitySrc 
      : src;
  }, [imageError, fallbackSrc, isLowEndDevice, lowQualitySrc, src]);

  // Optimize placeholder for mobile
  const placeholderStyle = useMemo(() => ({
    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
    backgroundSize: '200% 100%',
    animation: isMobile ? 'shimmer 3s infinite' : 'shimmer 1.5s infinite'
  }), [isMobile]);

  // Optimize image style for mobile
  const imageStyle = useMemo(() => ({
    ...style,
    // En móviles, usar transform para evitar repaints costosos
    transform: isMobile ? 'translateZ(0)' : style?.transform,
    willChange: isMobile ? 'transform' as const : 'auto' as const,
    backfaceVisibility: 'hidden' as const,
    imageRendering: isMobile ? 'optimizeSpeed' as const : 'auto' as const,
  }), [style, isMobile]);

  return (
    <div 
      className={`relative overflow-hidden ${className || ''}`}
      style={{ 
        transform: 'translateZ(0)', // Force hardware acceleration
        willChange: 'transform'
      }}
    >
      {/* Placeholder durante la carga en móviles */}
      {!imageLoaded && isMobile && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse"
          style={placeholderStyle}
        />
      )}
      
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
        style={imageStyle}
        loading={isMobile ? "eager" : loading} // Load eagerly on mobile for better perceived performance
      />
    </div>
  );
}