import { motion } from 'motion/react';
import { memo } from 'react';

const BRANCHES = [
  'M195 262 C170 238 136 224 106 196',
  'M205 258 C232 236 266 222 296 192',
  'M197 226 C184 190 162 156 140 126',
  'M203 226 C216 190 238 156 262 124',
  'M200 222 C200 178 200 128 200 82',
  'M150 140 C128 136 108 134 92 132',
  'M252 140 C274 136 292 134 306 132',
];

const CANOPY: Array<[number, number, number, string]> = [
  [200, 120, 82, '#FFC4DA'],
  [128, 160, 62, '#FFD0E2'],
  [272, 160, 62, '#FFD0E2'],
  [150, 100, 52, '#F5C9FF'],
  [250, 100, 52, '#F5C9FF'],
  [200, 182, 58, '#FFC4DA'],
  [96, 128, 40, '#F5D3FF'],
  [304, 128, 40, '#F5D3FF'],
];

/**
 * Tree trunk, branches and soft canopy. The heart leaves are separate real
 * buttons layered on top by the scene.
 */
export const HeartTreeIllustration = memo(function HeartTreeIllustration({ grow }: { grow: boolean }) {
  // The sparkling seed drops first (0–0.45s); everything else grows after it lands.
  const t = (delay: number) => ({ duration: grow ? 0.6 : 0, delay: grow ? 0.45 + delay : 0, ease: 'easeOut' as const });
  return (
    <svg aria-hidden="true" viewBox="0 0 400 400" className="absolute inset-0 h-full w-full overflow-visible">
      <defs>
        <linearGradient id="trunk-grad" x1="0" x2="1">
          <stop offset="0" stopColor="#9A5E44" />
          <stop offset="1" stopColor="#B87A5C" />
        </linearGradient>
      </defs>
      {/* Ground */}
      <path d="M8 380 Q40 344 200 340 Q360 344 392 380 Q392 398 200 398 Q8 398 8 380Z" fill="#F7A58D" opacity="0.75" />
      <path d="M40 386 Q90 362 200 360 Q310 362 360 386 Q360 396 200 396 Q40 396 40 386Z" fill="#F08F7A" opacity="0.55" />
      {[96, 136, 256, 296].map((x) => (
        <path key={x} d={`M${x} 352 q4 -12 8 0 q4 -14 8 0`} fill="none" stroke="#E46F86" strokeWidth="3" strokeLinecap="round" />
      ))}

      {/* Tiny mushrooms and daisies at the roots */}
      <g>
        <path d="M74 364 q0 -13 13 -13 q13 0 13 13 z" fill="#E2588F" />
        <rect x="81" y="364" width="12" height="9" rx="4" fill="#FFF6FB" />
        <circle cx="81" cy="357" r="2" fill="#FFF6FB" />
        <circle cx="92" cy="355" r="1.6" fill="#FFF6FB" />
        <path d="M312 368 q0 -10 10 -10 q10 0 10 10 z" fill="#B8A2FF" />
        <rect x="317" y="368" width="10" height="7" rx="3" fill="#FFF6FB" />
        <circle cx="318" cy="362" r="1.6" fill="#FFF6FB" />
      </g>
      {[
        [128, 370],
        [258, 368],
        [292, 374],
      ].map(([x, y]) => (
        <g key={x}>
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse key={angle} cx={x} cy={y - 5} rx="2.2" ry="4.5" fill="#ffffff" transform={`rotate(${angle} ${x} ${y})`} />
          ))}
          <circle cx={x} cy={y} r="2.6" fill="#FFE08A" />
        </g>
      ))}

      {/* Sparkling seed that plants the tree */}
      {grow && (
        <>
          <motion.g initial={{ y: -330, opacity: 1 }} animate={{ y: 0, opacity: 0 }} transition={{ y: { duration: 0.42, ease: 'easeIn' }, opacity: { delay: 0.42, duration: 0.2 } }}>
            <circle cx="200" cy="352" r="6" fill="#FFE08A" />
            <circle cx="200" cy="352" r="11" fill="#FFE08A" opacity="0.4" />
          </motion.g>
          <motion.circle
            cx="200"
            cy="352"
            r="16"
            fill="none"
            stroke="#FFE08A"
            strokeWidth="3"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1.5, opacity: [0, 0.9, 0] }}
            transition={{ delay: 0.4, duration: 0.5 }}
          />
        </>
      )}

      {/* Canopy */}
      <g>
        {CANOPY.map(([cx, cy, r, fill], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={fill}
            opacity={0.75}
            initial={grow ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={t(0.7 + i * 0.05)}
          />
        ))}
      </g>

      {/* Trunk */}
      <motion.path
        d="M182 366 C186 312 178 270 190 214 L210 214 C222 270 214 312 218 366 Z"
        fill="url(#trunk-grad)"
        initial={grow ? { scaleY: 0 } : false}
        animate={{ scaleY: 1 }}
        transition={t(0)}
        style={{ originY: '100%' }}
      />
      <path d="M196 300 q6 -8 2 -18 M206 260 q-5 -6 -1 -14" fill="none" stroke="#7E4936" strokeWidth="3" strokeLinecap="round" opacity="0.6" />

      {/* Branches */}
      {BRANCHES.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="#A86B4F"
          strokeWidth={i < 5 ? 11 : 7}
          strokeLinecap="round"
          initial={grow ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={t(0.35 + i * 0.07)}
        />
      ))}
    </svg>
  );
});
