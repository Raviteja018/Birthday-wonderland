import { motion } from 'motion/react';
import { memo } from 'react';

export const STAR_PATH = 'M12 2l2.6 6.3 6.8.6-5.2 4.4 1.6 6.7L12 16.5 6.2 20l1.6-6.7L2.6 8.9l6.8-.6z';

/* ------------------------------------------------------------------ */
/* Butterfly                                                           */
/* ------------------------------------------------------------------ */

function Wings({ color }: { color: string }) {
  const wing = (
    <g className="animate-flap" style={{ transformOrigin: '22px 17px' }}>
      <path d="M21 17 C10 2 -2 6 2 15 C4 20 13 22 21 17Z" fill={color} />
      <path d="M21 18 C12 30 2 29 4 22 C5.5 17.5 14 16.5 21 18Z" fill={color} opacity="0.75" />
      <circle cx="9" cy="12" r="2.2" fill="#ffffff" opacity="0.55" />
    </g>
  );
  return (
    <svg viewBox="0 0 44 34" className="h-auto w-full overflow-visible">
      {wing}
      <g transform="translate(44 0) scale(-1 1)">{wing}</g>
      <ellipse cx="22" cy="17" rx="2.2" ry="6.5" fill="#59486B" />
      <path d="M20.5 11 Q18 7 16.5 6.5 M23.5 11 Q26 7 27.5 6.5" stroke="#59486B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

type ButterflyProps = {
  color?: string;
  /** 'cross' flies over the scene once; 'hover' floats gently in place. */
  flight: 'cross' | 'hover';
  /** Vertical position for the 'cross' flight. */
  top?: string;
  delay?: number;
  duration?: number;
  reduced?: boolean;
  className?: string;
};

/** Decorative butterfly. Always aria-hidden via its pointer-events-none container. */
export const Butterfly = memo(function Butterfly({
  color = '#B8A2FF',
  flight,
  top = '20%',
  delay = 0,
  duration = 13,
  reduced = false,
  className = 'w-10',
}: ButterflyProps) {
  if (flight === 'cross') {
    if (reduced) return null;
    return (
      <motion.span
        className={`absolute block ${className}`}
        style={{ top, left: 0 }}
        initial={{ x: '-15vw', rotate: -8 }}
        animate={{ x: '115vw', y: [0, -28, 12, -20, 0], rotate: 8 }}
        transition={{ duration, delay, ease: 'easeInOut' }}
      >
        <Wings color={color} />
      </motion.span>
    );
  }
  return (
    <span
      className={`absolute block ${reduced ? '' : 'animate-float'} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <Wings color={color} />
    </span>
  );
});

/* ------------------------------------------------------------------ */
/* Fireflies, petals, moon, pressed flowers                            */
/* ------------------------------------------------------------------ */

type FireflyFieldProps = { count: number; reduced: boolean; className?: string };

/** Softly glowing fireflies at deterministic positions (no per-render randomness). */
export const FireflyField = memo(function FireflyField({ count, reduced, className = 'absolute inset-0' }: FireflyFieldProps) {
  return (
    <span className={`pointer-events-none block overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`absolute block rounded-full ${reduced ? 'opacity-40' : 'animate-firefly'}`}
          style={{
            left: `${(i * 37 + 11) % 93}%`,
            top: `${(i * 53 + 17) % 88}%`,
            width: 5 + (i % 3),
            height: 5 + (i % 3),
            background: '#FFE8A3',
            boxShadow: '0 0 10px 3px rgb(255 224 138 / 0.75)',
            animationDelay: `${(i * 0.9) % 4}s`,
            animationDuration: `${3.2 + (i % 4) * 0.9}s`,
          }}
        />
      ))}
    </span>
  );
});

type FloatingPetalsProps = { count: number; className?: string };

/** Rose petals drifting down. Callers skip rendering this when motion is reduced. */
export const FloatingPetals = memo(function FloatingPetals({ count, className = 'absolute inset-0' }: FloatingPetalsProps) {
  return (
    <span className={`pointer-events-none block overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="animate-petal absolute"
          style={{
            left: `${(i * 31 + 9) % 92}%`,
            top: '-6%',
            width: 12 + (i % 3) * 3,
            animationDelay: `${(i * 2.3) % 7}s`,
            animationDuration: `${9 + (i % 4) * 2.5}s`,
          }}
        >
          <path d="M10 1 C15 5 16 12 10 19 C4 12 5 5 10 1Z" fill={i % 2 ? '#FF86B5' : '#FFC4DA'} opacity="0.85" />
        </svg>
      ))}
    </span>
  );
});

/** Glowing crescent moon for the moonlit letter finale. */
export const CrescentMoon = memo(function CrescentMoon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className}>
      <circle cx="38" cy="40" r="36" fill="#FFF3B8" opacity="0.28" />
      <mask id="moon-cut">
        <rect width="80" height="80" fill="#fff" />
        <circle cx="52" cy="30" r="24" fill="#000" />
      </mask>
      <circle cx="38" cy="40" r="26" fill="#FFE8A3" mask="url(#moon-cut)" />
      <circle cx="28" cy="36" r="3" fill="#F2CF84" opacity="0.6" />
      <circle cx="34" cy="54" r="2" fill="#F2CF84" opacity="0.6" />
    </svg>
  );
});

type PressedFlowerProps = { className?: string; color?: string };

/** Scrapbook pressed flower used around the memory gallery. */
export const PressedFlower = memo(function PressedFlower({ className = '', color = '#FFC4DA' }: PressedFlowerProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse key={angle} cx="20" cy="11" rx="5" ry="9" fill={color} opacity="0.9" transform={`rotate(${angle} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="5" fill="#FFE08A" />
    </svg>
  );
});
