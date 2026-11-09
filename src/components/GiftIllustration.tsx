import { motion } from 'motion/react';
import { memo } from 'react';

export type GiftPhase = 'idle' | 'wiggle' | 'open';

const THEMES = {
  pink: { box: '#FF85B3', boxShade: '#F26FA2', lid: '#FF9CC2', ribbon: '#FFE08A', ribbonShade: '#F2BE4E', bow: '#FFE08A' },
  rainbow: { box: '#B49AFF', boxShade: '#9F83F2', lid: '#C6B2FF', ribbon: '#9BE7DD', ribbonShade: '#6FCFC2', bow: '#FF85B3' },
} as const;

type GiftIllustrationProps = {
  phase: GiftPhase;
  theme?: keyof typeof THEMES;
  className?: string;
};

/** Smiling present with a liftable lid. Decorative: the surrounding button carries the accessible name. */
export const GiftIllustration = memo(function GiftIllustration({ phase, theme = 'pink', className = '' }: GiftIllustrationProps) {
  const c = THEMES[theme];
  const open = phase === 'open';
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 240 250"
      className={`h-auto w-full overflow-visible ${className}`}
      animate={phase === 'wiggle' ? { rotate: [0, -6, 6, -4, 4, 0] } : { rotate: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ellipse cx="120" cy="236" rx="84" ry="10" fill="#69428F" opacity="0.14" />

      {/* Magic glow that spills out when the lid lifts */}
      <motion.g
        initial={false}
        animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.4 }}
        transition={{ duration: 0.5, delay: open ? 0.15 : 0 }}
        style={{ originX: '50%', originY: '100%' }}
      >
        {[-50, -25, 0, 25, 50].map((angle) => (
          <rect key={angle} x="114" y="30" width="12" height="78" rx="6" fill="#FFE08A" opacity="0.75" transform={`rotate(${angle} 120 112)`} />
        ))}
        <circle cx="120" cy="104" r="26" fill="#FFF3B8" opacity="0.9" />
      </motion.g>

      {/* Box body */}
      <rect x="40" y="112" width="160" height="114" rx="16" fill={c.box} />
      <rect x="40" y="112" width="160" height="18" fill={c.boxShade} opacity="0.6" />
      <rect x="112" y="112" width="16" height="114" fill={c.ribbon} />
      <rect x="112" y="112" width="16" height="114" fill={c.ribbonShade} opacity="0.25" />
      {/* Face */}
      <g>
        <ellipse cx="84" cy="164" rx="7" ry="8.5" fill="#3D2851" />
        <ellipse cx="156" cy="164" rx="7" ry="8.5" fill="#3D2851" />
        <circle cx="86.5" cy="160.5" r="2.4" fill="#fff" />
        <circle cx="158.5" cy="160.5" r="2.4" fill="#fff" />
        <ellipse cx="70" cy="184" rx="10" ry="6" fill="#D94383" opacity="0.35" />
        <ellipse cx="170" cy="184" rx="10" ry="6" fill="#D94383" opacity="0.35" />
        <path d="M104 182 Q120 198 136 182" fill="none" stroke="#3D2851" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Lid + bow */}
      <motion.g
        initial={false}
        animate={open ? { y: -78, x: -18, rotate: -16 } : { y: 0, x: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 14 }}
      >
        <rect x="30" y="88" width="180" height="32" rx="12" fill={c.lid} />
        <rect x="30" y="110" width="180" height="10" rx="5" fill={c.boxShade} opacity="0.35" />
        <rect x="111" y="88" width="18" height="32" fill={c.ribbon} />
        <g className={phase === 'idle' ? 'animate-sway' : undefined} style={{ transformOrigin: '120px 88px' }}>
          <path d="M120 86 C96 56 70 62 76 80 C80 92 104 92 120 86Z" fill={c.bow} stroke={c.ribbonShade} strokeWidth="3" />
          <path d="M120 86 C144 56 170 62 164 80 C160 92 136 92 120 86Z" fill={c.bow} stroke={c.ribbonShade} strokeWidth="3" />
          <circle cx="120" cy="86" r="10" fill={c.ribbonShade} />
          <circle cx="117" cy="83" r="3" fill="#fff" opacity="0.6" />
        </g>
      </motion.g>
    </motion.svg>
  );
});
