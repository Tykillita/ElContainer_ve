import React, { useRef, useEffect } from 'react';
import '../styles/MarqueeBenefitsMobile.css';

const benefits = [
  'Reservas flexibles',
  'Confirmacion por WhatsApp',
  'Pago en sitio'
];

export default function MarqueeBenefitsMobile() {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Duplicar solo una vez para loop perfecto
  const items = [...benefits, ...benefits];

  useEffect(() => {
    const track = trackRef.current;
    const wrapper = wrapperRef.current;
    if (!track || !wrapper) return;

    let pos = 0;
    let frameId: number;
    const speed = 0.1; // px por frame (aún más lento)

    function animate() {
      if (!track) return;
      pos -= speed;
      // Cuando el primer set de items sale completamente, resetea
      const firstHalfWidth = track.scrollWidth / 2;
      if (Math.abs(pos) >= firstHalfWidth) {
        pos = 0;
      }
      track.style.transform = `translateX(${pos}px)`;
      frameId = requestAnimationFrame(animate);
    }
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="marquee-benefits-mobile">
      <div className="marquee-wrapper" ref={wrapperRef}>
        <div className="marquee-track" ref={trackRef}>
          {items.map((b, i) => (
            <span
              key={b + i}
              className="rounded-full border border-white/25 px-3 py-1 whitespace-nowrap text-sm text-white/80 mx-1"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
