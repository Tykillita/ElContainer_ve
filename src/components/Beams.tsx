
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import '../styles/Beams.css';

interface BeamsProps {
  beamWidth?: number;
  beamHeight?: number;
  beamNumber?: number;
  lightColor?: string;
  speed?: number;
  noiseIntensity?: number;
  scale?: number;
  rotation?: number;
}

// Componente para un solo haz de luz
const Beam: React.FC<{
  width: number;
  height: number;
  color: string;
  opacity: number;
  angle: number;
  speed: number;
  index: number;
  noiseIntensity: number;
  scale: number;
}> = ({ width, height, color, opacity, angle, speed, index, noiseIntensity, scale }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      // Animación de posición y opacidad con ruido
      const noise = Math.sin(t * speed * noiseIntensity + index) * noiseIntensity;
      meshRef.current.position.x = Math.sin(t * speed + index) * (6 + noise);
      meshRef.current.position.y = Math.cos(t * speed * 0.7 + index) * (3 + noise * 0.5);
      meshRef.current.material.opacity = 0.25 + 0.25 * Math.sin(t * speed * 0.5 + index + noise);
      meshRef.current.rotation.z = angle + Math.sin(t * 0.2 + index + noise) * 0.1;
      meshRef.current.scale.set(scale, scale, 1);
    }
  });
  return (
    <mesh ref={meshRef} rotation-z={angle}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const Beams: React.FC<BeamsProps> = ({
  beamWidth = 2,
  beamHeight = 15,
  beamNumber = 12,
  lightColor = '#ffffff',
  speed = 2,
  noiseIntensity = 1.75,
  scale = 0.2,
  rotation = 0
}) => {
  // Generar ángulos y opacidades para los beams
  const beams = Array.from({ length: beamNumber }, (_, i) => {
    const angle = (i / beamNumber) * Math.PI + rotation * (Math.PI / 180);
    const opacity = 0.18 + Math.random() * 0.18;
    return { angle, opacity };
  });

  return (
    <div className="fixed inset-0 z-[-1]">
      <Canvas className="beams-container" dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={60} />
        <color attach="background" args={["#000000"]} />
        {beams.map((b, i) => (
          <Beam
            key={i}
            width={beamWidth}
            height={beamHeight}
            color={lightColor}
            opacity={b.opacity}
            angle={b.angle}
            speed={speed + Math.random() * 0.5}
            index={i}
            noiseIntensity={noiseIntensity}
            scale={scale}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default Beams;
