import React, { useState, useEffect } from 'react';
import { LoadingScreen, PageSkeletonLoader } from './LoadingAnimation';

interface PageLoaderProps {
  children: React.ReactNode;
  loading?: boolean;
  type?: 'full-screen' | 'skeleton';
  delay?: number;
  duration?: number;
  onComplete?: () => void;
  waitForReady?: boolean;
  isReady?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  children,
  loading = true,
  type = 'full-screen',
  delay = 0,
  duration = 2000,
  onComplete,
  waitForReady = false,
  isReady = false
}) => {
  const [showLoader, setShowLoader] = useState(loading);
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    // Show loader initially with delay
    const delayTimer = setTimeout(() => {
      setIsLoading(loading);
      setShowLoader(loading);
    }, delay);

    // Only auto-hide loader after duration if no explicit loading prop is provided
    let durationTimer: ReturnType<typeof setTimeout>;
    if (loading && type === 'full-screen' && typeof onComplete === 'undefined') {
      durationTimer = setTimeout(() => {
        setIsLoading(false);
        setShowLoader(false);
      }, duration);
    }

    return () => {
      clearTimeout(delayTimer);
      if (durationTimer) clearTimeout(durationTimer);
    };
  }, [loading, type, delay, duration, onComplete]);

  const handleComplete = () => {
    setIsLoading(false);
    setShowLoader(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (showLoader && type === 'full-screen') {
    return <LoadingScreen isVisible={isLoading} onComplete={handleComplete} waitForReady={waitForReady} isReady={isReady} />;
  }

  if (showLoader && type === 'skeleton') {
    return (
      <div className="min-h-screen bg-black p-4">
        <PageSkeletonLoader />
      </div>
    );
  }

  return <>{children}</>;
};

export default PageLoader;