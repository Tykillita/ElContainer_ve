import React, { useEffect, useRef } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}

interface ParticleSystemProps {
  particleCount?: number;
  colors?: string[];
  className?: string;
  enabled?: boolean;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particleCount = 50,
  colors = ['#ffffff', '#e35c27', '#fb923c'],
  className = '',
  enabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const { isMobile, isLowEndDevice } = useMobileOptimization();
  
  // Optimize particle count for mobile devices
  const optimizedParticleCount = isMobile || isLowEndDevice ? Math.max(15, Math.floor(particleCount * 0.4)) : particleCount;

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2 - 1,
        life: 0,
        maxLife: Math.random() * 300 + 200,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.8 + 0.2
      };
    };

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < optimizedParticleCount; i++) {
        particlesRef.current.push(createParticle());
      }
    };

    const updateParticles = () => {
      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        // Fade out over time
        const lifeRatio = particle.life / particle.maxLife;
        particle.opacity = (1 - lifeRatio) * 0.8;

        // Remove dead particles and create new ones
        if (particle.life >= particle.maxLife || particle.y < -50) {
          particlesRef.current[index] = createParticle();
        }
      });
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
    };

    // Optimize animation frame rate for mobile
    const animate = () => {
      updateParticles();
      drawParticles();
      
      // On mobile devices, skip frames to reduce CPU usage
      if (isMobile || isLowEndDevice) {
        animationRef.current = requestAnimationFrame(() => {
          // Skip one frame out of every two on mobile
          animationRef.current = requestAnimationFrame(animate);
        });
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    resizeCanvas();
    initParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [optimizedParticleCount, colors, enabled]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ 
        opacity: isMobile || isLowEndDevice ? 0.4 : 0.6,
        willChange: 'opacity'
      }}
    />
  );
};

export default ParticleSystem;

// Floating Elements Component for enhanced UI
interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  delay = 0,
  duration = 6,
  className = ''
}) => {
  const { isMobile, isLowEndDevice } = useMobileOptimization();
  
  // Optimize animation for mobile devices
  const optimizedDuration = isMobile || isLowEndDevice ? duration * 1.5 : duration;
  
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        animation: `float ${optimizedDuration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
};

// Ambient Light Effect
interface AmbientLightProps {
  color?: string;
  intensity?: number;
  className?: string;
}

export const AmbientLight: React.FC<AmbientLightProps> = ({
  color = '#e35c27',
  intensity = 0.1,
  className = ''
}) => {
  const { isMobile, isLowEndDevice } = useMobileOptimization();
  
  // Optimize intensity for mobile devices
  const optimizedIntensity = isMobile || isLowEndDevice ? intensity * 0.7 : intensity;
  
  return (
    <div
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 50%, ${color}22 0%, transparent 70%)`,
        opacity: optimizedIntensity,
        animation: `pulse ${isMobile || isLowEndDevice ? 6 : 4}s ease-in-out infinite`,
        willChange: 'opacity'
      }}
    />
  );
};

// Interactive Glow Effect
interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  className?: string;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  children,
  color = '#e35c27',
  intensity = 0.5,
  className = ''
}) => {
  const { isMobile, isLowEndDevice } = useMobileOptimization();
  
  // Optimize intensity for mobile devices
  const optimizedIntensity = isMobile || isLowEndDevice ? intensity * 0.7 : intensity;
  
  return (
    <div
      className={`relative ${className}`}
      style={{
        filter: `drop-shadow(0 0 ${optimizedIntensity * 20}px ${color})`,
        willChange: 'filter'
      }}
    >
      {children}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
          animation: `pulse ${isMobile || isLowEndDevice ? 3 : 2}s ease-in-out infinite`,
          willChange: 'opacity'
        }}
      />
    </div>
  );
};