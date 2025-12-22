import React from 'react';
import './MarqueeBenefitsMobile.css';

const benefits = [
  'Reservas flexibles',
  'Confirmacion por WhatsApp',
  'Pago en sitio'
];

export default function MarqueeBenefitsMobile() {
  return (
    <div className="marquee-benefits-mobile">
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {benefits.map((b, i) => (
            <span
              key={b + i}
              className="rounded-full border border-white/25 px-3 py-1 whitespace-nowrap text-sm text-white/80 mx-1"
            >
              {b}
            </span>
          ))}
          {/* Duplicado para loop infinito */}
          {benefits.map((b, i) => (
            <span
              key={b + i + 'dup'}
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
