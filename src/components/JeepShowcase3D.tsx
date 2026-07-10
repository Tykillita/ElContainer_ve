import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PresentationControls, Stage, useGLTF } from '@react-three/drei'
import { Vector3, type Group } from 'three'

const MODEL_URL = '/models/jeep.glb'

// "Drive-in": al bajar con el scroll, la cámara se acerca desde lejos.
// Stage encuadra la cámara en los primeros frames; guardamos esa posición
// y le sumamos un retroceso radial proporcional al progreso de scroll.
function ScrollDolly({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { camera } = useThree()
  const fitted = useRef<Vector3 | null>(null)
  const frames = useRef(0)
  const current = useRef(0)
  useFrame(() => {
    frames.current++
    if (frames.current < 12) return // espera al encuadre de Stage
    if (!fitted.current) fitted.current = camera.position.clone()
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight
    // 0 = sección entrando por abajo (lejos), 1 = sección centrada (cerca)
    const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.85)))
    const eased = 1 - Math.pow(1 - p, 3)
    // suavizado para que no salte con scrolls bruscos
    current.current += (eased - current.current) * 0.08
    const back = (1 - current.current) * 14
    const dir = fitted.current.clone().normalize()
    camera.position.copy(fitted.current.clone().addScaledVector(dir, back))
  })
  return null
}

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
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative w-[150%] -mx-[25%] h-[16rem] sm:h-[28rem] md:h-[38rem] lg:h-[40rem] cursor-grab active:cursor-grabbing">
      {/* Loader mientras baja el GLB (2.2MB draco) */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-orange-500 animate-spin" />
        </div>
      )}
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 35, position: [5, 2, 7] }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        className={`transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        // pan-y: drag horizontal rota el jeep, scroll vertical sigue funcionando en touch
        style={{ touchAction: 'pan-y' }}
      >
        <Suspense fallback={null}>
          <ScrollDolly containerRef={containerRef} />
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
