import { useState, useEffect, useRef, useCallback, ReactNode, forwardRef } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface LazySectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  placeholder?: ReactNode;
  style?: React.CSSProperties;
}

const LazySection = forwardRef<HTMLDivElement, LazySectionProps>(({ 
  children, 
  className = '',
  threshold = 0.1,
  rootMargin = '100px',
  placeholder,
  style,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const internalRef = useRef<HTMLDivElement>(null);
  const { isMobile, isLowEndDevice } = useMobileOptimization();

  // Combinar refs externos e internos
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    // Asignar ref interno para el IntersectionObserver
    internalRef.current = node;
    // Reenviar ref externo
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && !hasLoaded) {
      setIsVisible(true);
      setHasLoaded(true);
    }
  }, [hasLoaded]);

  // Expose a method to force load the section
  useEffect(() => {
    if (internalRef.current) {
      // @ts-expect-error - attaching method to DOM element
      internalRef.current.forceLoad = () => {
        if (!hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      };
    }
    
    return () => {
      if (internalRef.current) {
        // @ts-expect-error - cleaning up
        delete internalRef.current.forceLoad;
      }
    };
  }, [hasLoaded]);

  useEffect(() => {
    if (!internalRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: isMobile ? 0.05 : threshold,
      rootMargin: isMobile ? '50px' : rootMargin
    });

    const element = internalRef.current;
    observer.observe(element);

    return () => {
      // Verificar que el elemento aún existe antes de unobserve
      if (element && document.contains(element)) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [handleIntersection, threshold, rootMargin, isMobile]);

  // En dispositivos de gama baja, cargar inmediatamente
  if (isLowEndDevice && !hasLoaded) {
    setIsVisible(true);
    setHasLoaded(true);
  }

  // Optimize transition duration for mobile
  const transitionDuration = isMobile ? 300 : 500;
  
  return (
    <div 
      ref={combinedRef}
      className={`transition-all duration-${transitionDuration} ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{
        ...style,
        // Optimizaciones para móviles
        transform: isMobile ? 'translateZ(0)' : (style?.transform || undefined),
        willChange: isMobile ? 'transform, opacity' : (style?.willChange || 'auto')
      }}
      {...props}
    >
      {isVisible ? children : (placeholder || (
        <div className="min-h-[200px] bg-white/5 rounded-lg animate-pulse" style={{ willChange: 'opacity' }} />
      ))}
    </div>
  );
});

LazySection.displayName = 'LazySection';

export default LazySection;