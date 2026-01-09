import React, { useEffect, useRef, useState } from 'react';

/**
 * MobileScaleWrapper
 * Escala el contenido en móviles para mantener el layout y proporciones,
 * evitando que el diseño se deforme en pantallas pequeñas.
 *
 * Props:
 * - baseWidth: ancho base del diseño móvil (ej: 430px)
 * - children: contenido a escalar
 */
const BASE_WIDTH = 430; // Ajusta este valor según el diseño de tu mockup

export const MobileScaleWrapper: React.FC<{ baseWidth?: number; children: React.ReactNode }> = ({ baseWidth = BASE_WIDTH, children }) => {
  const [scale, setScale] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleResize() {
      const isMobile = window.innerWidth <= 900; // Puedes ajustar el breakpoint
      if (isMobile && window.innerWidth < baseWidth) {
        setScale(window.innerWidth / baseWidth);
      } else {
        setScale(1);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [baseWidth]);

  return (
    <div
      ref={ref}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: scale === 1 ? '100%' : baseWidth,
        minHeight: scale === 1 ? '100%' : `calc(100vh / ${scale})`,
        margin: '0 auto',
        overflow: 'visible',
      }}
    >
      {children}
    </div>
  );
};

export default MobileScaleWrapper;
