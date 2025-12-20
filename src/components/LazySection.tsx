import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  placeholder?: ReactNode;
  style?: React.CSSProperties;
}

export default function LazySection({ 
  children, 
  className = '',
  threshold = 0.1,
  rootMargin = '100px',
  placeholder,
  style
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { isMobile, isLowEndDevice } = useMobileOptimization();

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && !hasLoaded) {
      setIsVisible(true);
      setHasLoaded(true);
    }
  }, [hasLoaded]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: isMobile ? 0.05 : threshold,
      rootMargin: isMobile ? '50px' : rootMargin
    });

    const currentElement = sectionRef.current;
    observer.observe(currentElement);

    return () => {
      // Use the stored reference to avoid the stale closure warning
      observer.unobserve(currentElement);
    };
  }, [handleIntersection, threshold, rootMargin, isMobile]);

  // En dispositivos de gama baja, cargar inmediatamente
  if (isLowEndDevice && !hasLoaded) {
    setIsVisible(true);
    setHasLoaded(true);
  }

  return (
    <div 
      ref={sectionRef}
      className={`transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{
        ...style,
        // Optimizaciones para móviles
        transform: isMobile ? 'translateZ(0)' : (style?.transform || undefined),
        willChange: isMobile ? 'transform, opacity' : (style?.willChange || 'auto')
      }}
    >
      {isVisible ? children : (placeholder || (
        <div className="min-h-[200px] bg-white/5 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}