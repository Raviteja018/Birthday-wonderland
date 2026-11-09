import { memo } from 'react';

const TINTS = [
  ['#FFD6E7', '#E8DDFF'],
  ['#FFE9C2', '#FFD3DF'],
  ['#D6F5F0', '#E5DCFF'],
];

type MediaFallbackProps = {
  /** Describes what would have been shown; used as the accessible name. */
  label: string;
  /** Short visible note, e.g. "Sample memory" or "Photo unavailable". */
  note: string;
  variant?: number;
  className?: string;
};

/** Friendly illustrated placeholder used whenever a photo or video is missing or fails to load. */
export const MediaFallback = memo(function MediaFallback({ label, note, variant = 0, className = '' }: MediaFallbackProps) {
  const [from, to] = TINTS[variant % TINTS.length];
  const id = `fallback-grad-${variant % TINTS.length}`;
  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#${id})`} />
        <path d="M0 230 Q100 190 200 225 T400 215 V300 H0z" fill="#ffffff" opacity="0.55" />
        <circle cx="320" cy="70" r="28" fill="#FFE08A" opacity="0.9" />
        <g fill="#FF85B3" opacity="0.8">
          <path d="M70 70s-14-8.6-18.8-17.4c-3.2-6.2.2-13.5 7.1-14.3 4-.4 7.3 1.7 9.4 4.9 2.1-3.2 5.4-5.3 9.4-4.9 6.9.8 10.3 8.1 7.1 14.3C79.4 61.4 70 70 70 70z" />
          <path d="M120 110s-8-4.9-10.7-9.9c-1.8-3.5.1-7.7 4-8.1 2.3-.2 4.2 1 5.4 2.8 1.2-1.8 3.1-3 5.4-2.8 3.9.4 5.8 4.6 4 8.1-2.6 5-8.1 9.9-8.1 9.9z" />
        </g>
        <g transform="translate(160 105)" fill="none" stroke="#69428F" strokeWidth="6" strokeLinejoin="round">
          <rect x="0" y="12" width="80" height="58" rx="12" fill="#ffffff" fillOpacity="0.8" />
          <path d="M24 12l7-12h18l7 12" />
          <circle cx="40" cy="41" r="15" />
        </g>
      </svg>
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold tracking-wide whitespace-nowrap text-purple-deep uppercase shadow-sm">
        {note}
      </span>
    </div>
  );
});
