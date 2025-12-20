import { useState, useCallback } from 'react';
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
  const currentSrc = imageError && fallbackSrc 
    ? fallbackSrc 
    : isLowEndDevice && lowQualitySrc 
    ? lowQualitySrc 
    : src;

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
          style={{
            backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      )}
      
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
        style={{
          ...style,
          // En móviles, usar transform para evitar repaints costosos
          transform: isMobile ? 'translateZ(0)' : style?.transform,
          willChange: isMobile ? 'transform' : 'auto',
          backfaceVisibility: 'hidden',
          imageRendering: isMobile ? 'auto' : 'auto',
        }}
        loading={loading}
      />
    </div>
  );
}