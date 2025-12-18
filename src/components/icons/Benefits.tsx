import React from 'react';

export function SpeedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="2" fill="none" />
      <path d="M12 6v6l4 2" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PaintIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="13" width="18" height="6" rx="2" stroke="#f97316" strokeWidth="2" />
      <path d="M7 13V7a5 5 0 0 1 10 0v6" stroke="#f97316" strokeWidth="2" />
    </svg>
  );
}

export function SecurityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" stroke="#f97316" strokeWidth="2" fill="none" />
      <circle cx="12" cy="13" r="2" fill="#f97316" />
    </svg>
  );
}
