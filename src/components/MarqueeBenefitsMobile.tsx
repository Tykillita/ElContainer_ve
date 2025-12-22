import React from 'react';
import './MarqueeBenefitsMobile.css';

const benefits = [
  'Reservas flexibles',
  'Confirmacion por WhatsApp',
  'Pago en sitio'
];

export default function MarqueeBenefitsMobile() {
  // Repetimos más veces para asegurar un loop visible
  const repeatCount = 8;
  return (
    <div className="marquee-benefits-mobile">
      <div className="marquee-track">
        {Array(repeatCount).fill(null).map((_, idx) => (
          <React.Fragment key={idx}>
            {benefits.map((b, i) => (
              <span
                key={b + i + idx}
                className="rounded-full border border-white/25 px-3 py-1 whitespace-nowrap text-sm text-white/80 mx-1"
              >
                {b}
              </span>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
