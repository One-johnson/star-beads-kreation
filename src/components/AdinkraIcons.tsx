import React from "react";

export const GyeNyame = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" fill="none" {...props}>
    <circle cx="32" cy="32" r="30" fill="#FBBF24" opacity="0.15" />
    <path d="M32 12c-8 0-14 6-14 14 0 6 4 10 10 10s10 4 10 10-4 10-10 10" stroke="#F59E42" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 52c8 0 14-6 14-14 0-6-4-10-10-10s-10-4-10-10 4-10 10-10" stroke="#F59E42" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Sankofa = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" fill="none" {...props}>
    <circle cx="32" cy="32" r="30" fill="#10B981" opacity="0.15" />
    <path d="M32 52c-8-8-8-20 0-28s20-8 28 0" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="52" cy="32" r="4" fill="#10B981" />
  </svg>
);

export const Duafe = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" fill="none" {...props}>
    <circle cx="32" cy="32" r="30" fill="#F472B6" opacity="0.15" />
    <rect x="24" y="16" width="16" height="32" rx="8" fill="#F472B6" />
    <rect x="28" y="20" width="8" height="24" rx="4" fill="#fff" opacity="0.5" />
  </svg>
);

export const Fawohodie = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" fill="none" {...props}>
    <circle cx="32" cy="32" r="30" fill="#6366F1" opacity="0.15" />
    <path d="M32 12v40M12 32h40" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="32" r="8" fill="#6366F1" />
  </svg>
);

export const Akoma = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" fill="none" {...props}>
    <circle cx="32" cy="32" r="30" fill="#EF4444" opacity="0.15" />
    <path d="M32 48s-12-8-12-18a8 8 0 0 1 16 0 8 8 0 0 1 16 0c0 10-12 18-12 18z" stroke="#EF4444" strokeWidth="3" fill="#fff" />
  </svg>
);

export const adinkraMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  "gye-nyame": GyeNyame,
  "sankofa": Sankofa,
  "duafe": Duafe,
  "fawohodie": Fawohodie,
  "akoma": Akoma,
}; 