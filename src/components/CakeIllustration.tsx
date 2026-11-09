import { AnimatePresence, motion } from 'motion/react';
import { memo } from 'react';

const SPRINKLES: Array<[number, number, number, string]> = [
  [72, 250, 20, '#9BE7DD'],
  [96, 272, -30, '#FFE08A'],
  [128, 252, 50, '#B49AFF'],
  [158, 276, -10, '#9BE7DD'],
  [186, 256, 35, '#FFE08A'],
  [278, 270, -40, '#B49AFF'],
  [290, 248, 15, '#FFE08A'],
  [122, 168, -25, '#FFE08A'],
  [150, 180, 40, '#FF85B3'],
  [212, 172, -15, '#9BE7DD'],
  [238, 182, 30, '#FF85B3'],
];

const FROSTING_BOTTOM = 'M50 204 Q50 190 66 190 L294 190 Q310 190 310 204 L310 214 q-10 14 -20 0 q-10 18 -22 0 q-10 12 -20 0 q-12 20 -24 0 q-10 12 -20 0 q-12 16 -24 0 q-10 14 -22 0 q-10 18 -22 0 q-10 12 -20 0 q-12 16 -24 0 q-10 12 -20 0 q-12 18 -22 0Z';
const FROSTING_TOP = 'M95 124 Q95 110 111 110 L249 110 Q265 110 265 124 L265 132 q-10 14 -20 0 q-10 16 -22 0 q-10 12 -20 0 q-12 18 -24 0 q-10 12 -20 0 q-12 16 -24 0 q-10 14 -22 0 q-10 12 -18 0Z';

const HEART = 'M12 21s-7.5-4.6-10-9.3C.3 8.4 2.1 4.5 5.8 4.1c2.1-.2 3.9.9 5 2.6 1.1-1.7 2.9-2.8 5-2.6 3.7.4 5.5 4.3 3.8 7.6C19.5 16.4 12 21 12 21z';
const STRAWBERRIES = [58, 98, 138, 178, 298];

/**
 * Two-tier birthday cake with shaded tiers, sponge layers, drip icing, strawberries and pearls.
 * `slicing` plays a knife cut down the slice edges; `cut` then lifts the slice out onto its own plate.
 * Candles are separate buttons.
 */
export const CakeIllustration = memo(function CakeIllustration({ cut, slicing = false }: { cut: boolean; slicing?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 360 330" className="absolute inset-0 h-full w-full overflow-visible">
      <defs>
        <linearGradient id="cake-pink" x1="0" x2="1">
          <stop offset="0" stopColor="#F58FB8" />
          <stop offset="0.35" stopColor="#FFC4DB" />
          <stop offset="0.7" stopColor="#FFB0CF" />
          <stop offset="1" stopColor="#E87AA6" />
        </linearGradient>
        <linearGradient id="cake-lilac" x1="0" x2="1">
          <stop offset="0" stopColor="#A98BF0" />
          <stop offset="0.35" stopColor="#D5C5FF" />
          <stop offset="0.7" stopColor="#C4B0FA" />
          <stop offset="1" stopColor="#9C7FE6" />
        </linearGradient>
        <linearGradient id="cake-cream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE9F3" />
        </linearGradient>
        <linearGradient id="cake-plate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E9DDF7" />
        </linearGradient>
        <radialGradient id="cake-shadow">
          <stop offset="0" stopColor="#5B2C6F" stopOpacity="0.35" />
          <stop offset="1" stopColor="#5B2C6F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="knife-blade" x1="0" x2="1">
          <stop offset="0" stopColor="#9aa3b2" />
          <stop offset="0.5" stopColor="#f4f6fa" />
          <stop offset="1" stopColor="#aab2c0" />
        </linearGradient>
        <clipPath id="cake-left-clip">
          <rect x="40" y="180" width="176" height="60" />
          <rect x="274" y="180" width="50" height="60" />
        </clipPath>
      </defs>

      {/* Table shadow + cake stand */}
      <ellipse cx="180" cy="312" rx="176" ry="16" fill="url(#cake-shadow)" />
      <ellipse cx="180" cy="304" rx="168" ry="20" fill="url(#cake-plate)" />
      <ellipse cx="180" cy="298" rx="152" ry="13" fill="#F6EEFF" />
      <ellipse cx="180" cy="296" rx="146" ry="10" fill="none" stroke="#D9C8F0" strokeWidth="1.5" strokeDasharray="2 5" />

      {/* Bottom tier */}
      <rect x="50" y="190" width="260" height="108" rx="18" fill="url(#cake-pink)" />
      <rect x="50" y="268" width="260" height="30" rx="14" fill="#E87AA6" opacity="0.35" />
      <path d="M62 204 L62 290" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.28" />
      <rect x="50" y="236" width="260" height="6" fill="#FFF6FB" opacity="0.85" />
      <rect x="50" y="262" width="260" height="6" fill="#FFF6FB" opacity="0.85" />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={64 + i * 18.5} cy="291" r="5" fill="#FFFFFF" stroke="#F3C4D8" strokeWidth="1" />
      ))}

      {/* Inside of the cake, revealed when the slice is lifted */}
      <g>
        <rect x="216" y="192" width="58" height="104" fill="#FFE2A8" />
        <rect x="216" y="222" width="58" height="9" fill="#E0457F" opacity="0.85" />
        <rect x="216" y="231" width="58" height="7" fill="#FFF6FB" />
        <rect x="216" y="258" width="58" height="9" fill="#E0457F" opacity="0.85" />
        <rect x="216" y="267" width="58" height="7" fill="#FFF6FB" />
        <path d="M216 192 L216 296" stroke="#D99AAE" strokeWidth="2" />
        <path d="M274 192 L274 296" stroke="#D99AAE" strokeWidth="2" />
      </g>

      {/* The slice piece (front of the cake until cut) */}
      <motion.g
        initial={false}
        animate={cut ? { x: 92, y: 4, rotate: 7 } : { x: 0, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 13 }}
      >
        <rect x="216" y="190" width="58" height="108" fill="url(#cake-pink)" />
        <rect x="216" y="236" width="58" height="6" fill="#FFF6FB" opacity="0.85" />
        <rect x="216" y="262" width="58" height="6" fill="#FFF6FB" opacity="0.85" />
        <path d="M216 190 L274 190 L274 214 q-9 14 -18 0 q-10 16 -20 0 q-10 12 -20 0Z" fill="url(#cake-cream)" />
        <motion.g initial={false} animate={{ opacity: cut ? 1 : 0 }}>
          <rect x="216" y="222" width="58" height="9" fill="#E0457F" opacity="0.5" />
          <rect x="216" y="258" width="58" height="9" fill="#E0457F" opacity="0.5" />
        </motion.g>
        <circle cx="245" cy="182" r="10" fill="#FF3E78" />
        <path d="M239 178 l4 -2 M247 186 l2 -3" stroke="#FFC2D6" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M245 172 q4 -8 10 -6" stroke="#3FA070" strokeWidth="3" fill="none" strokeLinecap="round" />
      </motion.g>

      <AnimatePresence>
        {cut && (
          <motion.ellipse
            cx="337"
            cy="298"
            rx="38"
            ry="8"
            fill="url(#cake-plate)"
            stroke="#E2D2F2"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          />
        )}
      </AnimatePresence>

      <path d={FROSTING_BOTTOM} fill="url(#cake-cream)" clipPath="url(#cake-left-clip)" />
      {STRAWBERRIES.map((x) => (
        <g key={x}>
          <path d={`M${x - 8} 186 q8 -2 16 0 q-2 14 -8 18 q-6 -4 -8 -18Z`} fill="#FF3E78" />
          <path d={`M${x - 5} 185 q5 -5 10 0`} stroke="#3FA070" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      ))}

      {/* Top tier */}
      <rect x="95" y="110" width="170" height="84" rx="16" fill="url(#cake-lilac)" />
      <rect x="95" y="172" width="170" height="22" rx="11" fill="#9C7FE6" opacity="0.35" />
      <path d="M106 126 L106 184" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.3" />
      <path d={FROSTING_TOP} fill="url(#cake-cream)" />
      {[118, 242].map((x) => (
        <path key={x} transform={`translate(${x - 9} 150) scale(0.75)`} d={HEART} fill="#FF6FA3" />
      ))}
      {/* The age, big and bold on the top tier */}
      <text x="180" y="170" textAnchor="middle" fontSize="50" fontWeight="900" fontFamily="Fredoka, Baloo 2, system-ui, sans-serif" fill="#FF4F8B" stroke="#FFFFFF" strokeWidth="5" paintOrder="stroke" letterSpacing="2">25</text>
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={113 + i * 17.5} cy="188" r="4" fill="#FFFFFF" stroke="#D7C8FA" strokeWidth="1" />
      ))}

      {SPRINKLES.map(([x, y, r, color], i) => (
        <rect key={i} x={x} y={y} width="4" height="12" rx="2" fill={color} transform={`rotate(${r} ${x} ${y})`} />
      ))}

      {/* Knife cut: two cut lines draw down the slice edges while the knife travels down between them */}
      {slicing && (
        <>
          <motion.path d="M216 186 L216 298" stroke="#7A3B5A" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: 'easeInOut' }} />
          <motion.path d="M274 186 L274 298" stroke="#7A3B5A" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: 'easeInOut', delay: 0.6 }} />
          <motion.g
            initial={{ x: 216, y: 40, opacity: 0 }}
            animate={{ x: [216, 216, 274, 274], y: [40, 190, 190, 40], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.5, times: [0, 0.4, 0.75, 1], ease: 'easeInOut' }}
          >
            <rect x="-5" y="-62" width="10" height="46" rx="4" fill="#5A3A2A" />
            <path d="M-6 -18 L6 -18 L6 110 L-6 100Z" fill="url(#knife-blade)" />
          </motion.g>
        </>
      )}
    </svg>
  );
});

/** One candle + flame + smoke puff, drawn inside its button. */
export const CandleGraphic = memo(function CandleGraphic({ lit, showSmoke }: { lit: boolean; showSmoke: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 110" className="h-full w-full overflow-visible">
      <rect x="13" y="48" width="14" height="60" rx="4" fill="#ffffff" />
      {[56, 72, 88].map((y) => (
        <path key={y} d={`M13 ${y} L27 ${y - 8} L27 ${y - 2} L13 ${y + 6}Z`} fill="#FF85B3" />
      ))}
      <path d="M20 48 L20 40" stroke="#3D2851" strokeWidth="2.5" strokeLinecap="round" />
      <AnimatePresence>
        {lit && (
          <motion.g key="flame" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.2, y: -6 }} transition={{ duration: 0.25 }}>
            <circle cx="20" cy="26" r="16" fill="#FFE08A" opacity="0.35" />
            <g className="animate-flicker">
              <path d="M20 6 C28 18 30 26 25 34 C23 38 17 38 15 34 C10 26 12 18 20 6Z" fill="#FFB547" />
              <path d="M20 16 C25 24 25 29 22.5 33 C21.5 35 18.5 35 17.5 33 C15 29 15 24 20 16Z" fill="#FFF3B8" />
            </g>
          </motion.g>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!lit && showSmoke && (
          <motion.g key="smoke" initial={{ opacity: 0.8, y: 0 }} animate={{ opacity: 0, y: -28 }} transition={{ duration: 1.1, ease: 'easeOut' }}>
            <circle cx="20" cy="32" r="5" fill="#CFC4DD" />
            <circle cx="15" cy="24" r="4" fill="#DCD3E8" />
            <circle cx="23" cy="16" r="3.5" fill="#E8E1F1" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
});
