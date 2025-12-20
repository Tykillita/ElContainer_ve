import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import '../styles/Beams.css';

const DebugBeam: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [, setCount] = useState(0);

  useFrame((state) => {
    setCount(prev => prev + 1);
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[10, 30]} />
      <meshBasicMaterial 
        color="#ff0000" 
        transparent 
        opacity={0.5}
      />
    </mesh>
  );
};

const DebugBeams: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('DebugBeams component rendering...');

  try {
    return (
      <div>
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 9999,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px'
        }}>
          <button 
            onClick={() => setIsVisible(!isVisible)}
            style={{ marginRight: '10px' }}
          >
            Toggle Beams
          </button>
          <span>Frame count: {isVisible ? 'Rendering' : 'Hidden'}</span>
        </div>
        
        {isVisible && (
          <Canvas className="debug-beams-container">
            <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={75} />
            <ambientLight intensity={0.5} />
            <DebugBeam />
          </Canvas>
        )}
      </div>
    );
  } catch (err) {
    console.error('DebugBeams error:', err);
    setError(err instanceof Error ? err.message : 'Unknown error');
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        zIndex: 9999,
        background: 'red',
        color: 'white',
        padding: '10px',
        borderRadius: '5px'
      }}>
        Error: {error}
      </div>
    );
  }
};

export default DebugBeams;