import React, { useState, useEffect, useRef } from 'react';

interface LoadingAnimationProps {
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'beams' | 'typewriter';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  text = 'Cargando...',
  variant = 'spinner',
  size = 'md',
  className = ''
}) => {
  const [dots, setDots] = useState('');
  const [typeText, setTypeText] = useState('');
  const isDeletingRef = useRef(false);

  useEffect(() => {
    if (variant === 'dots') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }

    if (variant === 'typewriter') {
      // Reset the state when text changes
      isDeletingRef.current = false;
      setTypeText(''); // Clear the current text
      
      const fullText = text;
      let index = 0;
      
      const interval = setInterval(() => {
        if (!isDeletingRef.current && index <= fullText.length) {
          // Typing forward
          setTypeText(fullText.slice(0, index));
          index++;
        } else if (isDeletingRef.current && index >= 0) {
          // Deleting backward
          setTypeText(fullText.slice(0, index));
          index--;
        } else if (index > fullText.length) {
          // Finished typing, pause then start deleting
          setTimeout(() => {
            isDeletingRef.current = true;
          }, 1000); // Pause for 1 second before deleting
        } else {
          // Finished deleting, reset and start typing again
          isDeletingRef.current = false;
          index = 0;
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [variant, text]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderSpinner = () => (
    <div className={`${sizeClasses[size]} border-2 border-white/20 border-t-orange-500 rounded-full animate-spin`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} bg-orange-500 rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${size === 'sm' ? 'w-1' : size === 'md' ? 'w-2' : 'w-3'} bg-orange-500 rounded-full animate-pulse`}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  const renderBeams = () => (
    <div className="relative">
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`${size === 'sm' ? 'w-0.5' : size === 'md' ? 'w-1' : 'w-1.5'} bg-gradient-to-t from-orange-500 to-transparent rounded-full animate-pulse`}
            style={{ 
              height: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px',
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderTypewriter = () => (
    <div className="font-mono">
      <span className="text-white">{typeText}</span>
      <span className="animate-pulse text-orange-500">|</span>
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'beams': return renderBeams();
      case 'typewriter': return renderTypewriter();
      default: return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {renderContent()}
      {variant !== 'typewriter' && (
        <span className={`${textSizeClasses[size]} text-white/70 animate-pulse`}>
          {variant === 'dots' ? `${text}${dots}` : text}
        </span>
      )}
    </div>
  );
};

// Page transition component
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  delay = 0
}) => {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-4 duration-700 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Staggered entrance animation
interface StaggeredChildrenProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggeredChildren: React.FC<StaggeredChildrenProps> = ({
  children,
  staggerDelay = 100,
  className = ''
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ animationDelay: `${index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Loading screen component
interface LoadingScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
}

interface LoadingScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
  waitForReady?: boolean;
  isReady?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isVisible,
  onComplete,
  waitForReady = false,
  isReady = false
}) => {
  const [progress, setProgress] = useState(0);
  // const [phase, setPhase] = useState(0); // Eliminado porque no se usa
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          
          // If we're not waiting for ready state, call onComplete immediately
          if (!waitForReady) {
            setTimeout(() => {
              setIsExiting(true);
              setTimeout(() => onComplete?.(), 300); // Match CSS transition time
            }, 500);
          }
          // If we are waiting and already ready, call onComplete
          else if (isReady) {
            setTimeout(() => {
              setIsExiting(true);
              setTimeout(() => onComplete?.(), 300); // Match CSS transition time
            }, 500);
          }
          
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, [isVisible, onComplete, waitForReady, isReady]);

  // When progress is 100% and we're waiting for ready state, continue showing the loader
  // until isReady becomes true, then call onComplete
  useEffect(() => {
    if (progress >= 100 && waitForReady && isReady && onComplete) {
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onComplete(), 300); // Match CSS transition time
      }, 500);
    }
  }, [progress, waitForReady, isReady, onComplete]);

  if (!isVisible && !isExiting) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="text-center space-y-8">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-white/20 border-t-orange-500 rounded-full animate-spin" />
            <div className="absolute inset-2 border-2 border-orange-500/50 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-white/70 text-sm">{progress}%</div>
        </div>

        {/* Loading text with simple text */}
        <div className="text-white">
          <LoadingAnimation
            variant="typewriter"
            text="Cargando..."
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};

// Skeleton loader component
interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  lines = 3,
  avatar = false
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded w-24" />
            <div className="h-3 bg-white/10 rounded w-16" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2 mb-3">
          <div className="h-4 bg-white/20 rounded" style={{ width: `${Math.random() * 40 + 60}%` }} />
          {i === lines - 1 && (
            <div className="h-4 bg-white/10 rounded" style={{ width: `${Math.random() * 30 + 40}%` }} />
          )}
        </div>
      ))}
    </div>
  );
};

// Page loading skeleton with more comprehensive layout
interface PageSkeletonLoaderProps {
  className?: string;
  header?: boolean;
  content?: boolean;
  footer?: boolean;
  sidebar?: boolean;
  items?: number;
}

export const PageSkeletonLoader: React.FC<PageSkeletonLoaderProps> = ({
  className = '',
  header = true,
  content = true,
  footer = true,
  sidebar = false,
  items = 5
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {header && (
        <div className="h-16 bg-white/10 mb-4 flex items-center px-4">
          <div className="h-8 w-32 bg-white/20 rounded"></div>
          <div className="ml-auto flex space-x-4">
            <div className="h-6 w-16 bg-white/20 rounded"></div>
            <div className="h-6 w-16 bg-white/20 rounded"></div>
          </div>
        </div>
      )}
      
      <div className="flex gap-4">
        {sidebar && (
          <div className="w-1/4 space-y-3">
            <div className="h-10 bg-white/10 rounded"></div>
            <div className="h-10 bg-white/10 rounded"></div>
            <div className="h-10 bg-white/10 rounded"></div>
          </div>
        )}
        
        <div className="flex-1">
          {content && (
            <div className="space-y-6">
              <div className="h-8 w-1/3 bg-white/10 rounded"></div>
              <div className="h-4 w-full bg-white/10 rounded"></div>
              <div className="h-4 w-5/6 bg-white/10 rounded"></div>
              <div className="h-4 w-2/3 bg-white/10 rounded"></div>
              
              <div className="space-y-4 mt-8">
                {Array.from({ length: items }).map((_, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-lg">
                    <div className="h-6 w-1/4 bg-white/10 rounded mb-3"></div>
                    <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {footer && (
        <div className="h-24 bg-white/10 mt-8 flex items-center justify-between px-4">
          <div className="h-6 w-32 bg-white/20 rounded"></div>
          <div className="h-6 w-48 bg-white/20 rounded"></div>
          <div className="h-6 w-24 bg-white/20 rounded"></div>
        </div>
      )}
    </div>
  );
};

export default LoadingAnimation;