import { useState, useEffect } from 'react';

interface UseMobileOptimizationReturn {
  isMobile: boolean;
  isLowEndDevice: boolean;
  shouldReduceAnimations: boolean;
  isOnline: boolean;
}

interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  deviceMemory?: number;
  getBattery?: () => Promise<BatteryManager>;
}

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

export function useMobileOptimization(): UseMobileOptimizationReturn {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [shouldReduceAnimations, setShouldReduceAnimations] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Detectar dispositivo móvil
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword));
      
      // También verificar por tamaño de pantalla
      const isSmallScreen = window.innerWidth < 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    // Detectar dispositivo de gama baja
    const checkLowEndDevice = () => {
      const navigatorWithConnection = navigator as NavigatorWithConnection;
      const connection = navigatorWithConnection.connection || 
                        navigatorWithConnection.mozConnection || 
                        navigatorWithConnection.webkitConnection;
      const isSlowConnection = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
      
      // Verificar memoria del dispositivo si está disponible
      const isLowMemory = !!(navigatorWithConnection.deviceMemory && navigatorWithConnection.deviceMemory < 4);
      
      // Verificar número de núcleos de CPU
      const isLowCpuCores = !!(navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
      
      setIsLowEndDevice(isSlowConnection || isLowMemory || isLowCpuCores);
    };

    // Verificar si se deben reducir animaciones
    const checkAnimations = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      setShouldReduceAnimations(prefersReducedMotion || isLowEndDevice);
    };

    // Verificar estado de conexión
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Ejecutar verificaciones
    checkMobile();
    checkLowEndDevice();
    checkAnimations();
    checkOnlineStatus();

    // Escuchar cambios
    const handleResize = () => {
      checkMobile();
      checkLowEndDevice();
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Escuchar cambios en la conexión
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const connection = navigatorWithConnection.connection;
    if (connection) {
      connection.addEventListener('change', () => {
        checkLowEndDevice();
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', () => {
          checkLowEndDevice();
        });
      }
    };
  }, [isLowEndDevice]);

  return {
    isMobile,
    isLowEndDevice,
    shouldReduceAnimations,
    isOnline
  };
}