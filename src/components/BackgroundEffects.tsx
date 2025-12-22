
import React, { useEffect, useRef } from 'react';
import Beams from './Beams';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface AnimatedBackgroundProps {
  className?: string;
  gradientColors?: string[];
  animationSpeed?: number;
  blurIntensity?: number;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className = '',
  gradientColors = ['#0a0a0a', '#1a1a2e', '#16213e', '#0f0f0f'],
  animationSpeed = 20,
  blurIntensity = 60
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isMobile, isLowEndDevice } = useMobileOptimization();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Optimize for mobile performance
    const optimizedAnimationSpeed = isMobile || isLowEndDevice ? animationSpeed * 0.7 : animationSpeed;
    const orbCount = isMobile || isLowEndDevice ? 3 : 5;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      time += 0.01 * (isMobile || isLowEndDevice ? 0.8 : 1); // Slow down animation on mobile

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create animated gradient
      const gradient = ctx.createRadialGradient(
        centerX + Math.sin(time) * 100,
        centerY + Math.cos(time * 0.8) * 100,
        0,
        centerX,
        centerY,
        Math.max(canvas.width, canvas.height) * 0.8
      );

      gradientColors.forEach((color, index) => {
        const offset = (index / gradientColors.length + time * 0.1) % 1;
        gradient.addColorStop(offset, color + '40'); // Add transparency
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add floating orbs with optimized count for mobile
      for (let i = 0; i < orbCount; i++) {
        const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.3 + i) * 0.5 + 0.5) * canvas.height;
        const radius = isMobile || isLowEndDevice ? 30 + Math.sin(time * 2 + i) * 20 : 50 + Math.sin(time * 2 + i) * 30;

        const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        orbGradient.addColorStop(0, gradientColors[i % gradientColors.length] + '20');
        orbGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    resize();
    animate();

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [gradientColors, animationSpeed, isMobile, isLowEndDevice]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-[-2] ${className}`}
      style={{ 
        filter: `blur(${blurIntensity}px)`,
        willChange: 'filter'
      }}
    />
  );
};

// Floating geometric shapes
interface GeometricShapesProps {
  count?: number;
  className?: string;
}

const GeometricShapes: React.FC<GeometricShapesProps> = ({
  count = 8,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, isLowEndDevice } = useMobileOptimization();

  // Optimize shape count and complexity for mobile
  const optimizedCount = isMobile || isLowEndDevice ? Math.max(3, Math.floor(count * 0.6)) : count;
  
  const shapes = Array.from({ length: optimizedCount }, (_, i) => ({
    id: i,
    size: isMobile || isLowEndDevice ? Math.random() * 60 + 30 : Math.random() * 100 + 50,
    speed: isMobile || isLowEndDevice ? Math.random() * 0.3 + 0.1 : Math.random() * 0.5 + 0.2,
    rotationSpeed: isMobile || isLowEndDevice ? (Math.random() - 0.5) * 1 : (Math.random() - 0.5) * 2,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    color: ['#e35c27', '#fb923c', '#ffffff', '#ff6b35'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div ref={containerRef} className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute opacity-10"
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            left: `${shape.initialX}%`,
            top: `${shape.initialY}%`,
            background: `linear-gradient(45deg, ${shape.color}40, ${shape.color}20)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            animation: `
              float-${shape.id} ${20 / shape.speed}s ease-in-out infinite,
              rotate-${shape.id} ${10 / Math.abs(shape.rotationSpeed)}s linear infinite
            `,
            transform: `translate(-50%, -50%)`,
            willChange: 'transform'
          }}
        />
      ))}
      

    </div>
  );
};

// Energy waves effect
interface EnergyWavesProps {
  className?: string;
  waveCount?: number;
}

const EnergyWaves: React.FC<EnergyWavesProps> = ({
  className = '',
  waveCount = 3
}) => {
  const { isMobile, isLowEndDevice } = useMobileOptimization();
  
  // Optimize wave count for mobile
  const optimizedWaveCount = isMobile || isLowEndDevice ? Math.max(1, Math.floor(waveCount * 0.5)) : waveCount;
  
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: optimizedWaveCount }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(
                ellipse at center,
                transparent 30%,
                rgba(227, 92, 39, 0.1) 50%,
                transparent 70%
              )
            `,
            animation: `energyWave-${i} ${isMobile || isLowEndDevice ? (15 + i * 5) * 1.5 : 15 + i * 5}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
            willChange: 'opacity'
          }}
        />
      ))}
      

    </div>
  );
};

// Aurora effect
interface AuroraEffectProps {
  className?: string;
  intensity?: number;
}

const AuroraEffect: React.FC<AuroraEffectProps> = ({
  className = '',
  intensity = 0.3
}) => {
  const { isMobile, isLowEndDevice } = useMobileOptimization();
  
  // Optimize intensity for mobile
  const optimizedIntensity = isMobile || isLowEndDevice ? intensity * 0.7 : intensity;
  
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 30%,
              rgba(227, 92, 39, ${optimizedIntensity * 0.3}) 50%,
              transparent 70%
            ),
            linear-gradient(
              -45deg,
              transparent 30%,
              rgba(251, 146, 60, ${optimizedIntensity * 0.2}) 50%,
              transparent 70%
            )
          `,
          backgroundSize: '200% 200%',
          animation: `auroraShift ${isMobile || isLowEndDevice ? 30 : 20}s ease-in-out infinite`,
          willChange: 'background-position'
        }}
      />
      

    </div>
  );
};

// Main background compositor

interface BackgroundCompositorProps {
  showAnimatedBackground?: boolean;
  showGeometricShapes?: boolean;
  showEnergyWaves?: boolean;
  showAurora?: boolean;
  showBeams?: boolean;
  className?: string;
}

const BackgroundCompositor: React.FC<BackgroundCompositorProps> = ({
  showAnimatedBackground = false,
  showGeometricShapes = false,
  showEnergyWaves = false,
  showAurora = false,
  showBeams = true, // Beams activado por defecto
  className = ''
}) => {
  const { isMobile, isLowEndDevice } = useMobileOptimization();
  
  // Optimize visual effects for performance while maintaining quality
  const optimizedEffects = isMobile || isLowEndDevice;
  
  // Adjust effect parameters for mobile optimization
  const animatedBackgroundOpacity = optimizedEffects ? 'opacity-50' : 'opacity-70';
  const geometricShapesOpacity = optimizedEffects ? 'opacity-40' : 'opacity-60';
  const energyWavesOpacity = optimizedEffects ? 'opacity-25' : 'opacity-40';
  const auroraOpacity = optimizedEffects ? 'opacity-30' : 'opacity-50';
  
  return (
    <div className={`fixed inset-0 ${className}`}>
      {/* Beams al fondo absoluto, z-[-3] para que no tape los demás */}
      {showBeams && (
        <div className="fixed inset-0 z-0">
          <Beams />
        </div>
      )}

      {showAnimatedBackground && (
        <div className={`fixed inset-0 z-10 pointer-events-none ${animatedBackgroundOpacity}`}>
          <AnimatedBackground
            gradientColors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f0f0f', '#1a1a1a']}
            animationSpeed={optimizedEffects ? 25 : 15}
            blurIntensity={optimizedEffects ? 60 : 80}
          />
        </div>
      )}

      {showGeometricShapes && (
        <div className={`fixed inset-0 z-10 pointer-events-none ${geometricShapesOpacity}`}>
          <GeometricShapes count={optimizedEffects ? 4 : 6} />
        </div>
      )}

      {showEnergyWaves && (
        <div className={`fixed inset-0 z-10 pointer-events-none ${energyWavesOpacity}`}>
          <EnergyWaves waveCount={optimizedEffects ? 1 : 2} />
        </div>
      )}

      {showAurora && (
        <div className={`fixed inset-0 z-10 pointer-events-none ${auroraOpacity}`}>
          <AuroraEffect intensity={optimizedEffects ? 0.25 : 0.4} />
        </div>
      )}
    </div>
  );
};

/**
 * BackgroundCompositor: Componente principal para efectos de fondo.
 * Props:
 * - showAnimatedBackground: Muestra fondo animado canvas.
 * - showGeometricShapes: Muestra figuras geométricas flotantes.
 * - showEnergyWaves: Muestra ondas de energía.
 * - showAurora: Muestra efecto aurora.
 * - showBeams: Muestra fondo 3D tipo Beams (requiere @react-three/fiber).
 *
 * Ejemplo de uso:
 * <BackgroundCompositor showBeams={true} showAnimatedBackground={false} />
 */
export default BackgroundCompositor;
export { AnimatedBackground, GeometricShapes, EnergyWaves, AuroraEffect, Beams };