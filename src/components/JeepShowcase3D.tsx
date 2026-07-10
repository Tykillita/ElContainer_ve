import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PresentationControls, Stage, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import jeepImage from '../resources/img/jeep_gladiador.webp'

const MODEL_URL = '/models/jeep.glb'

function JeepModel({ onReady }: { onReady: () => void }) {
  const { scene } = useGLTF(MODEL_URL)
  useEffect(() => {
    onReady()
  }, [onReady])
  return <primitive object={scene} />
}

// Giro lento continuo; el drag de PresentationControls se suma encima
function SlowSpin({ children }: { children: React.ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15
  })
  return <group ref={ref}>{children}</group>
}

export default function JeepShowcase3D() {
  const [ready, setReady] = useState(false)

  return (
    <div className="relative w-[150%] -mx-[25%] h-[28rem] md:h-[38rem] lg:h-[40rem] cursor-grab active:cursor-grabbing">
      {/* Imagen estática de respaldo mientras carga el GLB (2.2MB draco) */}
      <img
        src={jeepImage}
        alt="Jeep Gladiator"
        className={`absolute inset-0 m-auto max-h-full max-w-full object-contain transition-opacity duration-700 ${ready ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      />
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 35, position: [5, 2, 7] }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        className={`transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
      >
        <Suspense fallback={null}>
          <PresentationControls
            global
            cursor={false}
            speed={1.5}
            polar={[-0.2, 0.3]}
            damping={0.25}
          >
            <Stage environment="city" intensity={0.5} shadows="contact" adjustCamera={0.8}>
              <SlowSpin>
                <JeepModel onReady={() => setReady(true)} />
              </SlowSpin>
            </Stage>
          </PresentationControls>
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_URL)
