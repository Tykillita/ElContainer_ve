import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      time += 0.01;

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

      // Add floating orbs
      for (let i = 0; i < 5; i++) {
        const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.3 + i) * 0.5 + 0.5) * canvas.height;
        const radius = 50 + Math.sin(time * 2 + i) * 30;

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
  }, [gradientColors, animationSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-[-2] ${className}`}
      style={{ filter: `blur(${blurIntensity}px)` }}
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

  const shapes = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    speed: Math.random() * 0.5 + 0.2,
    rotationSpeed: (Math.random() - 0.5) * 2,
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
            transform: `translate(-50%, -50%)`
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
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: waveCount }).map((_, i) => (
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
            animation: `energyWave-${i} ${15 + i * 5}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`
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
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 30%,
              rgba(227, 92, 39, ${intensity * 0.3}) 50%,
              transparent 70%
            ),
            linear-gradient(
              -45deg,
              transparent 30%,
              rgba(251, 146, 60, ${intensity * 0.2}) 50%,
              transparent 70%
            )
          `,
          backgroundSize: '200% 200%',
          animation: 'auroraShift 20s ease-in-out infinite'
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
  className?: string;
}

const BackgroundCompositor: React.FC<BackgroundCompositorProps> = ({
  showAnimatedBackground = true,
  showGeometricShapes = true,
  showEnergyWaves = true,
  showAurora = true,
  className = ''
}) => {
  return (
    <div className={`fixed inset-0 ${className}`}>
      {showAnimatedBackground && (
        <AnimatedBackground
          gradientColors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f0f0f', '#1a1a1a']}
          animationSpeed={15}
          blurIntensity={80}
        />
      )}
      
      {showGeometricShapes && (
        <GeometricShapes count={6} />
      )}
      
      {showEnergyWaves && (
        <EnergyWaves waveCount={2} />
      )}
      
      {showAurora && (
        <AuroraEffect intensity={0.4} />
      )}
    </div>
  );
};

export default BackgroundCompositor;
export { AnimatedBackground, GeometricShapes, EnergyWaves, AuroraEffect };