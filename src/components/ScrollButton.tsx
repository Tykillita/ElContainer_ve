import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface ScrollButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  easing?: 'easeOut' | 'easeInOut' | 'spring' | 'bounce' | 'elastic';
  showProgress?: boolean;
  offset?: number;
  respectReducedMotion?: boolean;
  velocityMultiplier?: number;
  enableHaptic?: boolean;
  enableDirectionDetection?: boolean;
  customEasing?: (t: number) => number;
}

export default function ScrollButton({
  targetRef,
  children,
  className = '',
  delay = 0,
  duration = 1200,
  easing = 'spring',
  showProgress = true,
  offset = 20,
  respectReducedMotion = true,
  velocityMultiplier = 1,
  enableHaptic = true,
  enableDirectionDetection = true,
  customEasing
}: ScrollButtonProps) {
  // isMobile se reserva para futuras funcionalidades (no eliminar)
  const { isMobile, shouldReduceAnimations } = useMobileOptimization();
  // State management
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');
  
  // Refs
  const buttonRef = useRef<HTMLButtonElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const velocityRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const reducedMotionRef = useRef<boolean>(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (!respectReducedMotion) return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };
    
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [respectReducedMotion]);

  // Detect scroll direction and velocity
  useEffect(() => {
    if (!enableDirectionDetection) return;

    let ticking = false;
    
    const updateScrollInfo = () => {
      const currentScrollY = window.pageYOffset;
      const scrollDelta = currentScrollY - lastScrollYRef.current;
      
      if (Math.abs(scrollDelta) > 1) {
        velocityRef.current = scrollDelta;
        setScrollDirection(scrollDelta > 0 ? 'down' : 'up');
      }
      
      lastScrollYRef.current = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollInfo);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableDirectionDetection]);

  // Enhanced easing functions with physics
  const easingFunctions = useMemo(() => ({
    easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    spring: (t: number) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0
        ? 0
        : t === 1
        ? 1
        : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    bounce: (t: number) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    },
    elastic: (t: number) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0
        ? 0
        : t === 1
        ? 1
        : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    }
  }), []);

  // Calculate optimal scroll duration based on distance and velocity
  const calculateDuration = useCallback((distance: number) => {
    const baseDuration = 800;
    const distanceMultiplier = Math.min(distance / 1000, 2);
    const velocityAdjustment = Math.max(0.5, 2 - Math.abs(velocityRef.current) / 100);
    const finalDuration = (baseDuration + (duration * distanceMultiplier)) * velocityAdjustment * velocityMultiplier;
    
    return Math.max(300, finalDuration); // Minimum duration
  }, [duration, velocityMultiplier]);

  // Haptic feedback for mobile devices
  const triggerHaptic = useCallback((intensity: number = 50) => {
    if (!enableHaptic) return;
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(intensity);
      }
    } catch {
      // Silently fail if haptic feedback is not supported
    }
  }, [enableHaptic]);

  // Robust scroll animation with multiple fallbacks
  const smoothScrollTo = useCallback((targetY: number, targetDuration: number) => {
    console.log('ScrollButton: smoothScrollTo called with:', { targetY, targetDuration });
    
    // Check if we should use native smooth scrolling
    const useNativeSmooth = 'scrollBehavior' in document.documentElement.style && !reducedMotionRef.current;
    
    if (useNativeSmooth) {
      console.log('ScrollButton: Using native smooth scroll');
      try {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        // Set a timeout to clear the scrolling state
        setTimeout(() => {
          setIsScrolling(false);
          setScrollProgress(0);
        }, targetDuration);
        return;
      } catch (error) {
        console.warn('ScrollButton: Native smooth scroll failed:', error);
      }
    }
    
    if (reducedMotionRef.current) {
      console.log('ScrollButton: Reduced motion enabled, using instant scroll');
      // Fallback to instant scroll for reduced motion
      try {
        window.scrollTo({ top: targetY, behavior: 'auto' });
        setIsScrolling(false);
        return;
      } catch (error) {
        console.error('ScrollButton: Reduced motion scroll failed:', error);
        setIsScrolling(false);
        return;
      }
    }

    try {
      const startY = window.pageYOffset;
      const distance = targetY - startY;
      const easingFunction = customEasing || easingFunctions[easing];
      
      console.log('ScrollButton: Starting custom animation', { startY, distance, targetY });
      
      // If distance is very small, just scroll directly
      if (Math.abs(distance) < 10) {
        console.log('ScrollButton: Small distance, scrolling directly');
        window.scrollTo({ top: targetY, behavior: 'auto' });
        setIsScrolling(false);
        return;
      }
      
      setIsScrolling(true);
      setScrollProgress(0);
      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) {
          setIsScrolling(false);
          return;
        }
        
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / targetDuration, 1);
        
        try {
          const easedProgress = easingFunction(progress);
          const currentY = startY + (distance * easedProgress);
          
          // Update scroll position
          window.scrollTo(0, currentY);
          
          // Update progress state
          if (showProgress) {
            setScrollProgress(progress * 100);
          }
          
          // Continue animation if not complete
          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            setIsScrolling(false);
            setScrollProgress(0);
            startTimeRef.current = null;
          }
        } catch (error) {
          console.warn('ScrollButton: Animation error, falling back:', error);
          // Fallback to instant scroll
          try {
            window.scrollTo({ top: targetY, behavior: 'auto' });
          } catch {
            // If all else fails, do nothing
            console.error('ScrollButton: All scroll attempts failed');
          }
          setIsScrolling(false);
          setScrollProgress(0);
          startTimeRef.current = null;
        }
      };

      // Cancel any existing animation
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      
      animationRef.current = requestAnimationFrame(animate);
      
    } catch (error) {
      console.error('ScrollButton: Failed to start scroll animation:', error);
      setIsScrolling(false);
      
      // Ultimate fallback to instant scroll
      try {
        window.scrollTo({ top: targetY, behavior: 'auto' });
      } catch {
        // If all else fails, do nothing
        console.error('ScrollButton: Final scroll attempt failed');
      }
    }
  }, [easing, showProgress, easingFunctions, customEasing]);

  // Intersection Observer for visibility with error handling
  useEffect(() => {
    const currentButton = buttonRef.current;
    if (!currentButton) return;

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay);
          }
        },
        { 
          threshold: 0.1,
          rootMargin: '50px' // Start loading slightly before visible
        }
      );

      observer.observe(currentButton);

      return () => {
        try {
          if (currentButton) {
            observer.unobserve(currentButton);
          }
        } catch {
          // Silently handle cleanup errors
        }
      };
    } catch {
      console.warn('Intersection Observer setup failed');
      // Fallback: show immediately
      setTimeout(() => setIsVisible(true), delay);
    }
  }, [delay]);

  // Comprehensive cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        startTimeRef.current = null;
      } catch {
        // Silently handle cleanup errors
      }
    };
  }, []);

  const handleScroll = useCallback(() => {
    console.log('ScrollButton: handleScroll called');
    
    const target = targetRef.current;
    console.log('ScrollButton: target element:', target);
    
    if (!target) {
      console.error('ScrollButton: No target element found');
      return;
    }

    if (isScrolling) {
      console.log('ScrollButton: Already scrolling, ignoring click');
      return;
    }

    try {
      console.log('ScrollButton: Starting scroll process');
      
      // Visual feedback
      setIsClicked(true);
      triggerHaptic(30);
      
      setTimeout(() => {
        setIsClicked(false);
      }, 200);

      // Standard scroll approach
      if (target) {
        const rect = target.getBoundingClientRect();
        const targetY = rect.top + window.pageYOffset - offset;
        const currentY = window.pageYOffset;
        const distance = Math.abs(targetY - currentY);
        
        console.log('ScrollButton: Scroll details:', {
          targetY,
          currentY,
          distance,
          targetElement: target.tagName,
          offset
        });
        
        // Calculate optimal duration
        const optimalDuration = calculateDuration(distance);
        console.log('ScrollButton: Calculated duration:', optimalDuration);
        
        // Start smooth scroll animation
        console.log('ScrollButton: Starting smooth scroll to:', targetY);
        smoothScrollTo(targetY, optimalDuration);
      }
    } catch (error) {
      console.error('ScrollButton: Scroll handler error:', error);
      setIsScrolling(false);
      setIsClicked(false);
      
      // Ultimate fallback to native smooth scroll
      try {
        const target = targetRef.current;
        if (target) {
          // Try smooth scroll first
          if ('scrollBehavior' in document.documentElement.style) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // Fallback to manual scroll for older browsers
            const rect = target.getBoundingClientRect();
            const targetY = rect.top + window.pageYOffset - offset;
            window.scrollTo(0, targetY);
          }
        }
      } catch (fallbackError) {
        console.error('ScrollButton: Fallback scroll failed:', fallbackError);
        // Last resort: jump to element
        try {
          const target = targetRef.current;
          if (target) {
            target.scrollIntoView(true);
          }
        } catch (lastResortError) {
          console.error('ScrollButton: Last resort scroll failed:', lastResortError);
        }
      }
    }
  }, [targetRef, isScrolling, offset, calculateDuration, smoothScrollTo, triggerHaptic]);

  // Memoized computed values with optimized transitions
  const buttonClasses = useMemo(() => [
    'relative overflow-hidden rounded-full bg-white text-black',
    'px-12 py-4 text-lg font-semibold',
    // Use optimized transitions that maintain visual quality
    'transform transition-all duration-300 ease-out',
    'hover:bg-white/90 hover:scale-[1.02] hover:-translate-y-0.5',
    'active:scale-95 active:translate-y-0',
    'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2',
    'shadow-[0_14px_38px_rgba(0,0,0,0.35)]',
    'hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]',
    'scroll-button-animations',
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
    isClicked ? 'scale-95' : '',
    isScrolling ? 'cursor-wait' : 'cursor-pointer',
    // Only disable transitions for users who prefer reduced motion
    reducedMotionRef.current ? 'transition-none' : '',
    className
  ].filter(Boolean).join(' '), [isVisible, isClicked, isScrolling, className]);

  return (
    <button
      ref={buttonRef}
      onClick={handleScroll}
      disabled={isScrolling}
      className={buttonClasses}
      aria-label={isScrolling ? 'Scrolling to target...' : 'Scroll to content'}
      aria-describedby="scroll-progress"
      style={{
        willChange: 'transform, opacity, box-shadow',
        animationDelay: reducedMotionRef.current ? '0ms' : `${delay}ms`
      }}
    >
      {/* Progress indicator during scroll */}
      {showProgress && (
        <div 
          id="scroll-progress"
          className="scroll-progress-bar absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-200 ease-out rounded-full"
          style={{ width: `${scrollProgress}%` }}
          role="progressbar"
          aria-valuenow={scrollProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      )}

      {/* Enhanced shine effect */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {/* Optimize shine effect for performance while maintaining visual quality */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-700 ease-out hover:translate-x-full" />
        
        {/* Additional shimmer effect during scroll */}
        {isScrolling && !reducedMotionRef.current && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        )}
      </div>
      
      {/* Enhanced particle effects with performance optimization */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute w-1 h-1 bg-white rounded-full opacity-50"
          style={{
            left: '20%',
            top: '30%',
            animation: reducedMotionRef.current ? 'none' : 'float 3s ease-in-out infinite',
            animationDelay: '0s',
            willChange: 'transform'
          }}
        />
        <div 
          className="absolute w-1 h-1 bg-white/70 rounded-full opacity-40"
          style={{
            left: '60%',
            top: '70%',
            animation: reducedMotionRef.current ? 'none' : 'float 4s ease-in-out infinite',
            animationDelay: '1s',
            willChange: 'transform'
          }}
        />
        <div 
          className="absolute w-1 h-1 bg-white rounded-full opacity-60"
          style={{
            left: '80%',
            top: '20%',
            animation: reducedMotionRef.current ? 'none' : 'float 3.5s ease-in-out infinite',
            animationDelay: '2s',
            willChange: 'transform'
          }}
        />
        
        {/* Extra particles during scroll */}
        {isScrolling && !reducedMotionRef.current && (
          <>
            <div 
              className="absolute w-0.5 h-0.5 bg-blue-300 rounded-full opacity-80 animate-ping"
              style={{
                left: '10%',
                top: '50%',
                animationDuration: '1s',
                willChange: 'transform'
              }}
            />
            <div 
              className="absolute w-0.5 h-0.5 bg-purple-300 rounded-full opacity-80 animate-ping"
              style={{
                left: '90%',
                top: '60%',
                animationDuration: '1.5s',
                animationDelay: '0.5s',
                willChange: 'transform'
              }}
            />
          </>
        )}
      </div>

      {/* Content with loading state */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isScrolling ? (
          <>
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Scrolling...
          </>
        ) : (
          children
        )}
      </span>
      
      {/* Enhanced pulse effect with performance optimization */}
      <div className="absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-300 hover:opacity-10" style={{ willChange: 'opacity' }} />
      
      {/* Active state enhancement */}
      {isScrolling && !reducedMotionRef.current && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" style={{ willChange: 'opacity' }} />
      )}
      
      {/* Scroll direction indicator */}
      {enableDirectionDetection && (
        <div className="absolute top-2 right-2 text-xs opacity-30" style={{ willChange: 'contents' }}>
          {scrollDirection === 'down' ? '↓' : '↑'}
        </div>
      )}
    </button>
  );
}