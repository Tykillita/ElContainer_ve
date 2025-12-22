import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import '../styles/Beams.css';

// Simple test component to verify Three.js works
const TestCube: React.FC = () => {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#ff2222" />
    </mesh>
  );
};

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
  console.log('Beams component rendering with props:', {
    beamWidth, beamHeight, beamNumber, lightColor, speed, noiseIntensity, scale, rotation
  });

  return (
    <div className="fixed inset-0 z-[-1]">
      <Canvas className="beams-container">
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={60} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <TestCube />
        <color attach="background" args={['#000000']} />
      </Canvas>
    </div>
  );
};

export default Beams;
