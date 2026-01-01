import React from 'react';

export const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="11" width="7" height="9" rx="2" stroke="#f97316" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="17" rx="2" stroke="#f97316" strokeWidth="2" />
  </svg>
);

export const WashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <ellipse cx="12" cy="17" rx="7" ry="3" stroke="#f97316" strokeWidth="2" />
    <circle cx="8" cy="7" r="2" stroke="#f97316" strokeWidth="2" />
    <circle cx="16" cy="7" r="2" stroke="#f97316" strokeWidth="2" />
  </svg>
);

export const ProgressIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M3 17v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" stroke="#f97316" strokeWidth="2" />
    <circle cx="12" cy="7" r="4" stroke="#f97316" strokeWidth="2" />
  </svg>
);

export const PlansIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="#f97316" strokeWidth="2" />
    <path d="M3 9h18" stroke="#f97316" strokeWidth="2" />
  </svg>
);

export const ClientsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="8" cy="8" r="4" stroke="#f97316" strokeWidth="2" />
    <circle cx="16" cy="8" r="4" stroke="#f97316" strokeWidth="2" />
    <path d="M2 21v-2a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v2" stroke="#f97316" strokeWidth="2" />
    <path d="M14 21v-2a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v2" stroke="#f97316" strokeWidth="2" />
  </svg>
);

export const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="#f97316" strokeWidth="2" />
    <path d="M16 3v4M8 3v4M3 11h18" stroke="#f97316" strokeWidth="2" />
  </svg>
);

export const AccountIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="8" r="4" stroke="#f97316" strokeWidth="2" />
    <path d="M2 21v-2a8 8 0 0 1 16 0v2" stroke="#f97316" strokeWidth="2" />
  </svg>
);

export const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M16 17l5-5-5-5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12H9" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 19v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v2" stroke="#f97316" strokeWidth="2" />
  </svg>
);
