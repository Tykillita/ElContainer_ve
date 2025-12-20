import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import '../styles/Beams.css';

interface SimpleBeamsProps {
  beamNumber?: number;
  beamWidth?: number;
  beamHeight?: number;
}

const SimpleBeam: React.FC<{
  position: [number, number, number];
  width: number;
  height: number;
}> = ({ position, width, height }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const SimpleBeams: React.FC<SimpleBeamsProps> = ({
  beamNumber = 10,
  beamWidth = 2,
  beamHeight = 40
}) => {
  const beams = [];
  const spacing = beamWidth * 1.5;
  const totalWidth = beamNumber * spacing;
  const startX = -totalWidth / 2;

  for (let i = 0; i < beamNumber; i++) {
    const x = startX + i * spacing;
    beams.push(
      <SimpleBeam
        key={i}
        position={[x, 0, 0]}
        width={beamWidth}
        height={beamHeight}
      />
    );
  }

  return (
    <Canvas className="simple-beams-container">
      <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={75} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <group rotation={[0, 0, Math.PI / 6]}>
        {beams}
      </group>
    </Canvas>
  );
};

export default SimpleBeams;