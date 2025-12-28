import { useRef } from 'react';
import AutoStepper from '../components/AutoStepper';
import JeepShowcase from '../components/JeepShowcase';
import { SpeedIcon, PaintIcon, SecurityIcon } from '../components/icons/Benefits';
import LazySection from '../components/LazySection';
import ScrollButton from '../components/ScrollButton';
import logo from '../resources/img/elcontainer_logo.png';
import { useState, useEffect } from 'react';
// Import the MarqueeBenefitsMobile component (adjust the path if needed)
import MarqueeBenefitsMobile from '../components/MarqueeBenefitsMobile';
// Import the CSS for styles (optional, if needed)
import '../styles/MarqueeBenefitsMobile.css';
import { FloatingElement } from '../components/FloatingElement';

const featuredServices = [
  { title: 'Lavado rapido', desc: 'Exterior + secado en 30 min.' },
  { title: 'Detallado', desc: 'Exterior e interior con aspirado profundo.' },
  { title: 'Tapiceria', desc: 'Limpieza profunda y neutralizado de olores.' },
];

const benefits = [
  { title: 'Rapidez y orden', desc: 'Reservas flexibles para evitar esperas largas.' },
  { title: 'Cuidado de pintura', desc: 'Productos y tecnicas suaves para brillo duradero.' },
  { title: 'Seguridad', desc: 'Zona iluminada y aviso al terminar tu vehiculo.' },
];

const steps = [
  { title: 'Elige tu servicio', desc: 'Lavado basico, detallado, tapiceria o motor.' },
  { title: 'Reserva horario', desc: 'Define dia y hora; te confirmamos por WhatsApp o email.' },
  { title: 'Paga en el local', desc: 'Pago movil, transferencia, efectivo o tarjeta.' },
];

const payments = ['Pago movil', 'Transferencia', 'Efectivo', 'Tarjeta'];

export default function Home() {
  const infoRef = useRef<HTMLDivElement>(null);
  // Tamaño dinámico del título según ancho de pantalla
  const [titleSize, setTitleSize] = useState('clamp(2.2rem,8vw,3.2rem)');

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width <= 370) {
        setTitleSize('clamp(1.7rem,7vw,2.2rem)');
      } else if (width <= 400) {
        setTitleSize('clamp(2.0rem,8vw,2.7rem)');
      } else if (width <= 430) {
        setTitleSize('clamp(2.2rem,8vw,3.2rem)');
      } else {
        setTitleSize('clamp(2.5rem,9vw,3.5rem)');
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <section className="container-shell space-y-14">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-2 text-center sm:px-4 mt-2 sm:mt-0">
          <FloatingElement delay={0} duration={8}>
            <img
              src={logo}
              alt="El Container Autolavado"
              className="h-[18rem] max-w-full object-contain drop-shadow-[0_45px_140px_rgba(0,0,0,0.6)] md:h-[14rem] lg:h-[17rem] xl:h-[20rem] card-ripple"
              style={{
                imageRendering: 'auto',
                maxHeight: '70vh',
                maxWidth: '90vw',
              }}
            />
          </FloatingElement>
          <h1
            className="font-hero leading-[0.95] tracking-[0.02em] uppercase text-transparent bg-clip-text inline-block mb-5 md:text-[clamp(2.4rem,7vw,5.2rem)] lg:text-[clamp(3.1rem,6vw,6rem)]"
            style={{
              backgroundImage:
                'linear-gradient(180deg,#f7f7f7 0%,#ededed 22%,#d5d5d5 42%,#9b9b9b 60%,#e4e4e4 78%,#8a8a8a 100%)',
              textShadow: '0 1px 0 #d6d6d6ff, 0 2px 0 #111, 0 4px 10px rgba(0,0,0,0.55), 0 0 24px rgba(151, 149, 148, 0.65)',
              transform: 'skewX(-8deg)',
              WebkitTextStroke: '0.6px #0b0b0b',
              fontSize: titleSize,
            }}
          >
            <span className="md:text-[1.1em] text-[1.5em] whitespace-nowrap">
              EL CONTAINER
            </span>
            <span
              className="block text-white autolavado-title"
              style={{
                fontSize: '0.55em',
                letterSpacing: '0.58em',
                WebkitTextStroke: '0.6px #0b0b0b',
                textShadow: '0 1px 0 #0c0c0c, 0 2px 6px rgba(0,0,0,0.5), 0 0 18px rgba(32, 10, 4, 0.9)',
                transform: 'translateY(-10px)',
              }}
            >
              AUTOLAVADO
            </span>
          </h1>
          <p className="-mt-2 max-w-3xl text-base text-white/75 sm:text-lg">
            Lavado rapido, seguro y sin sorpresas. Reserva en linea, llega a tu hora y paga en el local.
          </p>
          {/* Marquee solo en móvil */}
          <div className="block sm:hidden w-full">
            <MarqueeBenefitsMobile />
          </div>
          {/* Layout estático en desktop */}
          <div className="hidden sm:flex flex-nowrap justify-center gap-3 text-sm text-white/80 w-full">
            <span className="rounded-full border border-white/25 px-3 py-1 whitespace-nowrap">Reservas flexibles</span>
            <span className="rounded-full border border-white/25 px-3 py-1 whitespace-nowrap">Confirmacion por WhatsApp</span>
            <span className="rounded-full border border-white/25 px-3 py-1 whitespace-nowrap">Pago en sitio</span>
          </div>
          <ScrollButton
            targetRef={infoRef}
            delay={300}
            className="lg:block hidden mt-2 mb-6"
          >
            Ver mas
          </ScrollButton>
        </div>
      </section>

      <LazySection threshold={0.1} className="w-full mt-8 md:mt-32 lg:mt-36 pb-28">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-20">
          <div className="hidden sm:block relative mb-3">
            <JeepShowcase variant="clean" />
          </div>