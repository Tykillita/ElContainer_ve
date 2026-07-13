import { Suspense, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, PresentationControls, useGLTF } from '@react-three/drei'
import { Box3, CanvasTexture, Vector3, type Group, type Sprite } from 'three'

const MODEL_URL = '/models/jeep.glb'
const REDUCED =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Trayectoria de entrada (unidades del modelo) y pose final en diagonal
const START = { x: -16, z: -8 }
const PARK_ANGLE = -0.45

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
// campana suave entre a y b (para el cabeceo de frenada)
const bump = (t: number, a: number, b: number) =>
  t <= a || t >= b ? 0 : Math.sin(((t - a) / (b - a)) * Math.PI)

function makeSmokeTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255,255,255,0.85)')
  grad.addColorStop(0.5, 'rgba(230,230,230,0.35)')
  grad.addColorStop(1, 'rgba(220,220,220,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return new CanvasTexture(canvas)
}

type SmokeHandle = { burst: (points: Vector3[]) => void; rearm: () => void }

type Particle = { life: number; pos: Vector3; vel: Vector3; scale: number }

// Humo de frenada: sprites que crecen, derivan y se desvanecen
const Smoke = forwardRef<SmokeHandle>(function Smoke(_, ref) {
  const sprites = useRef<(Sprite | null)[]>([])
  const armed = useRef(true)
  const tex = useMemo(makeSmokeTexture, [])
  const parts = useRef<Particle[]>(
    Array.from({ length: 14 }, () => ({ life: 2, pos: new Vector3(), vel: new Vector3(), scale: 1 }))
  )

  useImperativeHandle(ref, () => ({
    burst(points: Vector3[]) {
      if (!armed.current || points.length === 0) return
      armed.current = false
      parts.current.forEach((p, i) => {
        const e = points[i % points.length]
        p.life = -(i * 0.04) // escalonado
        // desde la base de la rueda, empujado hacia la cámara para no quedar dentro del mesh
        p.pos.set(e.x + (Math.random() - 0.5) * 0.4, 0.25, e.z + 0.5 + Math.random() * 0.4)
        p.vel.set((Math.random() - 0.5) * 0.7, 0.5 + Math.random() * 0.7, 0.3 + Math.random() * 0.5)
        p.scale = 1.1 + Math.random() * 0.8
      })
    },
    rearm() {
      armed.current = true
    },
  }))

  useFrame((_, delta) => {
    parts.current.forEach((p, i) => {
      const s = sprites.current[i]
      if (!s) return
      p.life += delta * 0.9
      if (p.life < 0 || p.life >= 1) {
        s.visible = false
        return
      }
      s.visible = true
      p.pos.addScaledVector(p.vel, delta)
      s.position.copy(p.pos)
      const grow = p.scale * (0.6 + p.life * 2.2)
      s.scale.set(grow, grow, grow)
      const mat = s.material
      mat.opacity = 0.85 * (1 - p.life) * (1 - p.life)
    })
  })

  return (
    <group>
      {parts.current.map((_, i) => (
        <sprite key={i} ref={(el) => { sprites.current[i] = el }} visible={false}>
          <spriteMaterial map={tex} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  )
})

export type AnimState = { mode: 'wait' | 'play' | 'done'; t: number }
const DRIVE_DURATION = 2.4

function JeepScene({ anim, onReady }: {
  anim: React.MutableRefObject<AnimState>
  onReady: () => void
}) {
  const { scene } = useGLTF(MODEL_URL)
  const { camera } = useThree()
  const group = useRef<Group>(null)
  const smoke = useRef<SmokeHandle>(null)
  const spin = useRef(0)
  const prevP = useRef(0)

  // Normalizacion en runtime (frame >2): con matrices world ya compuestas por el
  // renderer, Box3 mide lo que de verdad se dibuja (los GLB de Sketchfab traen
  // scales anidados que engañan a una medicion en mount)
  const normalized = useRef(false)

  useEffect(() => {
    camera.lookAt(0, 0.7, 0)
    onReady()
  }, [camera, onReady])

  // ponytail: las 4 ruedas del GLB son UN solo mesh (imposible girarlas por nodo);
  // si algun dia se quiere spin real, usar un GLB con ruedas separadas

  const frames = useRef(0)

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return

    frames.current++
    if (!normalized.current) {
      if (frames.current < 3) return
      scene.updateWorldMatrix(true, true)
      const box = new Box3().setFromObject(scene)
      const size = box.getSize(new Vector3())
      const max = Math.max(size.x, size.y, size.z)
      if (!Number.isFinite(max) || max <= 0) return
      const k = 4.6 / max
      scene.scale.multiplyScalar(k)
      scene.updateWorldMatrix(true, true)
      const box2 = new Box3().setFromObject(scene)
      const center = box2.getCenter(new Vector3())
      scene.position.x -= center.x
      scene.position.z -= center.z
      scene.position.y -= box2.min.y
      scene.updateWorldMatrix(true, true)
      normalized.current = true
    }

    // timeline por tiempo, disparada por IntersectionObserver (ver componente padre).
    // Corre aunque haya prefers-reduced-motion: es contenido puntual de 2.4s, no
    // movimiento perpetuo (ese si se desactiva abajo).
    let p: number
    const a = anim.current
    if (a.mode === 'play') {
      a.t += Math.min(delta, 0.05) // clamp: evita saltos si el rAF estuvo pausado
      if (a.t >= DRIVE_DURATION) a.mode = 'done'
      p = clamp01(a.t / DRIVE_DURATION)
    } else {
      p = a.mode === 'done' ? 1 : 0
    }

    // posición sobre la trayectoria
    const drive = easeOutCubic(clamp01(p / 0.85))
    g.position.set(START.x * (1 - drive), 0, START.z * (1 - drive))

    // orientación: de rumbo de marcha a diagonal de parqueo
    const heading = Math.atan2(-START.x, -START.z)
    const turn = easeOutCubic(clamp01((p - 0.55) / 0.45))
    let rotY = heading * (1 - turn) + PARK_ANGLE * turn

    // giro showroom una vez estacionado
    if (p > 0.97 && !REDUCED) spin.current += delta * 0.15
    rotY += spin.current * clamp01((p - 0.97) / 0.03)

    // cabeceo al frenar
    g.rotation.set(-0.07 * bump(p, 0.7, 0.92), rotY, 0)

    // ruedas ruedan según distancia recorrida
    // humo al clavar los frenos: sale de las 4 esquinas reales del bbox (ruedas)
    if (prevP.current < 0.8 && p >= 0.8) {
      const box = new Box3().setFromObject(scene)
      const points = [
        new Vector3(box.min.x + 0.4, 0.25, box.min.z + 0.5),
        new Vector3(box.max.x - 0.4, 0.25, box.min.z + 0.5),
        new Vector3(box.min.x + 0.4, 0.25, box.max.z - 0.5),
        new Vector3(box.max.x - 0.4, 0.25, box.max.z - 0.5),
      ]
      smoke.current?.burst(points)
    }
    if (p < 0.4) smoke.current?.rearm()
    prevP.current = p
  })

  return (
    <>
      <group ref={group}>
        <primitive object={scene} />
      </group>
      <Smoke ref={smoke} />
    </>
  )
}

export default function JeepShowcase3D() {
  const [ready, setReady] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const anim = useRef<AnimState>({ mode: 'wait', t: 0 })

  // Dispara el drive-in cuando la sección entra >=30% al viewport; rearma al salir
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (e.intersectionRatio >= 0.3 && anim.current.mode === 'wait') {
          anim.current.mode = 'play'
          anim.current.t = 0
        } else if (!e.isIntersecting && anim.current.mode !== 'wait') {
          anim.current.mode = 'wait'
          anim.current.t = 0
        }
      },
      { threshold: [0, 0.3] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-[150%] -mx-[25%] h-[16rem] sm:h-[28rem] md:h-[38rem] lg:h-[40rem] cursor-grab active:cursor-grabbing"
    >
      {/* Loader mientras baja el GLB (2.2MB draco) */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-orange-500 animate-spin" />
        </div>
      )}
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 35, position: [5.6, 2, 7.2] }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        className={`transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        // pan-y: drag horizontal rota el jeep, scroll vertical sigue funcionando en touch
        style={{ touchAction: 'pan-y' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[6, 8, 4]} intensity={1.1} />
          <Environment preset="city" />
          <ContactShadows position={[0, 0, 0]} opacity={0.7} scale={12} blur={1.8} far={3.2} />
          <PresentationControls global cursor={false} speed={1.5} polar={[-0.2, 0.3]} damping={0.25}>
            <JeepScene anim={anim} onReady={() => setReady(true)} />
          </PresentationControls>
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_URL)
