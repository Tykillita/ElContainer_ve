import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

interface LoadingContextType {
  registerComponent: (id: string) => void;
  unregisterComponent: (id: string) => void;
  markComponentReady: (id: string) => void;
  initializePage: () => void;
  isReady: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<Map<string, boolean>>(new Map());
  const [initialized, setInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const registerComponent = (id: string) => {
    setComponents(prev => {
      const newMap = new Map(prev);
      newMap.set(id, false); // Initially not ready
      return newMap;
    });
  };

  const unregisterComponent = (id: string) => {
    setComponents(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const markComponentReady = (id: string) => {
    setComponents(prev => {
      const newMap = new Map(prev);
      newMap.set(id, true);
      return newMap;
    });
  };

  const initializePage = () => {
    setInitialized(true);
  };

  // Check if all registered components are ready
  useEffect(() => {
    if (!initialized) return;
    
    const allReady = Array.from(components.values()).every(ready => ready);
    setIsReady(allReady);
  }, [components, initialized]);

  return (
    <LoadingContext.Provider value={{ 
      registerComponent, 
      unregisterComponent, 
      markComponentReady, 
      initializePage,
      isReady 
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Custom hook to register a component with the loading system
export const useComponentReady = (id: string, deps: React.DependencyList = []) => {
  const { registerComponent, unregisterComponent, markComponentReady } = useLoading();
  
  useEffect(() => {
    // Register the component
    registerComponent(id);
    
    // Mark as ready immediately (for components that don't need to load data)
    markComponentReady(id);
    
    // Cleanup on unmount
    return () => {
      unregisterComponent(id);
    };
  }, [id, ...deps]);
};

// Custom hook to register a component and manually mark it as ready
export const useManualReady = (id: string, deps: React.DependencyList = []) => {
  const { registerComponent, unregisterComponent, markComponentReady } = useLoading();
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    // Register the component
    registerComponent(id);
    
    // Cleanup on unmount
    return () => {
      unregisterComponent(id);
    };
  }, [id, ...deps]);
  
  const markReady = useCallback(() => {
    markComponentReady(id);
    setReady(true);
  }, [id, markComponentReady]);
  
  return { ready, markReady };
};