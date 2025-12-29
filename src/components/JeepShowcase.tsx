import jeepImage from '../resources/img/jeep_gladiador.png'
import OptimizedImage from './OptimizedImage'
import { useMobileOptimization } from '../hooks/useMobileOptimization'

type JeepShowcaseProps = {
  variant?: 'dark' | 'clean'
}

export default function JeepShowcase({ variant = 'clean' }: JeepShowcaseProps) {
  const isClean = variant === 'clean'
  const { isMobile } = useMobileOptimization()

  // Don't render on mobile devices
  if (isMobile) return null;

  return (
    <div
      className={
        isClean
          ? 'relative h-full w-full bg-white rounded-2xl border border-white/10 overflow-visible'
          : 'relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#050505] via-[#0b0d10] to-[#050505] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)]'
      }
    >
      {!isClean && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(235,82,40,0.22),transparent_38%),radial-gradient(circle_at_78%_12%,rgba(255,255,255,0.12),transparent_32%),conic-gradient(from_120deg_at_50%_50%,rgba(255,255,255,0.06)_0deg,transparent_120deg,rgba(235,82,40,0.12)_220deg,transparent_320deg)]" />
          <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-[#eb5228]/18 via-transparent to-transparent blur-3xl" />
          <div className="absolute -right-12 bottom-0 h-52 w-52 rounded-full bg-gradient-to-tl from-white/12 via-transparent to-transparent blur-3xl" />
        </>
      )}

      <div
        className={
          isClean
            ? 'relative mx-auto flex h-[22rem] w-full max-w-none items-center justify-center sm:h-[28rem] md:h-[38rem] lg:h-[40rem] xl:h-[40rem] 2xl:h-[40rem] overflow-visible'
            : 'relative mx-auto flex h-[22rem] max-w-4xl items-center justify-center sm:h-[26rem] md:h-[32rem] lg:h-[30rem] xl:h-[30rem] 2xl:h-[30rem] overflow-visible'
        }
      >
        <div className="relative overflow-visible" style={{ overflow: 'visible !important' }}>
          <OptimizedImage
            src={jeepImage}
            alt="Jeep Gladiador"
            className={
              isClean
                ? 'h-full w-auto max-w-none object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.2)] translate-y-[-3px] sm:translate-y-[-5px] md:translate-y-[-8px] lg:translate-y-[-6px] xl:translate-y-[-6px] 2xl:translate-y-[-6px] z-10 scale-[1.0] lg:scale-[0.60] xl:scale-[0.60] 2xl:scale-[0.60]'
                : 'h-full w-auto object-contain drop-shadow-[0_35px_70px_rgba(0,0,0,0.35)] translate-y-[-3px] sm:translate-y-[-5px] md:translate-y-[-8px] lg:translate-y-[-6px] xl:translate-y-[-6px] 2xl:translate-y-[-6px] z-10 scale-[1.0] lg:scale-[0.60] xl:scale-[0.60] 2xl:scale-[0.60]'
            }
            style={{
              transform: 'perspective(1000px) rotateX(2deg) scale(1.0)',
              transformOrigin: 'bottom center',
              marginTop: '5px'
            }}
          />
          {/* Sombra para realzar el efecto 3D */}
          <div 
            className={
              isClean
                ? 'absolute top-full left-1/2 transform -translate-x-1/2 w-[90%] h-16 bg-black/20 rounded-full blur-xl -z-10'
                : 'absolute top-full left-1/2 transform -translate-x-1/2 w-[90%] h-16 bg-black/30 rounded-full blur-xl -z-10'
            }
            style={{
              transform: 'translateX(-50%) translateY(-10px) scale(1.1)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
