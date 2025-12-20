import jeepImage from '../resources/img/jeep_gladiador.png'
import OptimizedImage from './OptimizedImage'

type JeepShowcaseProps = {
  variant?: 'dark' | 'clean'
}

export default function JeepShowcase({ variant = 'clean' }: JeepShowcaseProps) {
  const isClean = variant === 'clean'

  return (
    <div
      className={
        isClean
          ? 'relative h-full w-full bg-white'
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
            ? 'relative mx-auto flex h-[22rem] w-full max-w-none items-center justify-center sm:h-[28rem] md:h-[38rem] lg:h-[46rem] xl:h-[52rem]'
            : 'relative mx-auto flex h-[22rem] max-w-4xl items-center justify-center sm:h-[26rem] md:h-[32rem] lg:h-[36rem]'
        }
      >
        <OptimizedImage
          src={jeepImage}
          alt="Jeep Gladiador"
          className={
            isClean
              ? 'h-full w-auto max-w-none object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.2)] sm:scale-[1.02] md:scale-[1.08] lg:scale-[1.16]'
              : 'h-full w-auto object-contain drop-shadow-[0_35px_70px_rgba(0,0,0,0.35)]'
          }
        />
      </div>
    </div>
  )
}
