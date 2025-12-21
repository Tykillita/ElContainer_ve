import React, { useEffect, useRef, useState } from 'react';

interface AnimatedButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  entrance?: boolean;
  shimmer?: boolean;
}

export default function AnimatedButton({
  targetRef,
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  pulse = false,
  entrance = true,
  shimmer = false
}: AnimatedButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Intersection Observer para animación de entrada
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }

    return () => {
      if (buttonRef.current) {
        observer.unobserve(buttonRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    const target = targetRef.current;
    if (!target) {
      console.log('AnimatedButton: Target not found');
      return;
    }

    // Añadir efecto de click
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);

    console.log('AnimatedButton: Scrolling to target');
    
    target.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  // Clases base
  const baseClasses = `
    relative overflow-hidden rounded-full font-semibold
    transform transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
    enhanced-button button-ripple button-glow
    ${isVisible && entrance ? 'button-entrance' : ''}
    ${pulse ? 'button-pulse' : ''}
    ${isClicked ? 'scale-95' : ''}
  `;

  // Clases de tamaño
  const sizeClasses = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-12 py-4 text-lg',
    lg: 'px-16 py-5 text-xl'
  };

  // Clases de variante
  const variantClasses = {
    primary: 'bg-white text-black shadow-[0_14px_38px_rgba(0,0,0,0.35)] hover:bg-white/90 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]',
    secondary: 'bg-gray-600 text-white shadow-[0_14px_38px_rgba(0,0,0,0.35)] hover:bg-gray-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]',
    ghost: 'bg-transparent text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10'
  };

  const textClasses = shimmer ? 'button-text-shimmer' : '';

  return (
    <button
      ref={buttonRef}
      onClick={handleScroll}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${textClasses}
        ${className}
      `}
      style={{
        willChange: 'transform, box-shadow',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* Contenido del botón */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      
      {/* Efecto de partículas flotantes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="particle" style={{ left: '10%', animationDelay: '0s' }} />
        <div className="particle" style={{ left: '30%', animationDelay: '0.5s' }} />
        <div className="particle" style={{ left: '50%', animationDelay: '1s' }} />
        <div className="particle" style={{ left: '70%', animationDelay: '1.5s' }} />
        <div className="particle" style={{ left: '90%', animationDelay: '2s' }} />
      </div>
    </button>
  );
}