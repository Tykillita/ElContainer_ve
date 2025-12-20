import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import '../styles/Beams.css';

interface WorkingBeamsProps {
  beamNumber?: number;
  beamWidth?: number;
  beamHeight?: number;
  speed?: number;
  rotation?: number;
}

interface BeamProps {
  position: [number, number, number];
  width: number;
  height: number;
  speed: number;
}

const AnimatedBeam: React.FC<BeamProps> = ({ position, width, height, speed }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Animación de rotación suave
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * speed) * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * speed * 0.5) * 2;
    }
    
    if (materialRef.current) {
      // Animación de opacidad
      const opacity = 0.1 + Math.sin(state.clock.elapsedTime * speed) * 0.05;
      materialRef.current.opacity = Math.max(0.05, Math.min(0.3, opacity));
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial 
        ref={materialRef}
        color="#ffffff" 
        transparent 
        opacity={0.15}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const WorkingBeams: React.FC<WorkingBeamsProps> = ({
  beamNumber = 12,
  beamWidth = 3,
  beamHeight = 50,
  speed = 1.5,
  rotation = 30
}) => {
  const beams = useMemo(() => {
    const beamsArray = [];
    const spacing = beamWidth * 1.8;
    const totalWidth = beamNumber * spacing;
    const startX = -totalWidth / 2;

    for (let i = 0; i < beamNumber; i++) {
      const x = startX + i * spacing;
      const y = (Math.random() - 0.5) * 10; // Posición Y aleatoria
      const z = (Math.random() - 0.5) * 5; // Posición Z aleatoria
      
      beamsArray.push(
        <AnimatedBeam
          key={i}
          position={[x, y, z]}
          width={beamWidth}
          height={beamHeight}
          speed={speed + Math.random() * 0.5}
        />
      );
    }

    return beamsArray;
  }, [beamNumber, beamWidth, beamHeight, speed]);

  return (
    <Canvas className="working-beams-container">
      <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={90} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      
      <group rotation={[0, 0, (rotation * Math.PI) / 180]}>
        {beams}
      </group>
      
      {/* Luces adicionales para mejor visibilidad */}
      <directionalLight position={[5, 5, 5]} intensity={0.2} />
      <directionalLight position={[-5, -5, 5]} intensity={0.1} />
    </Canvas>
  );
};

export default WorkingBeams;