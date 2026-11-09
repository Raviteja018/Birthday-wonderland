import { motion } from 'motion/react';
import { memo } from 'react';

export type EnvelopePhase = 'closed' | 'opening';

const HEART = 'M12 21s-7.5-4.6-10-9.3C.3 8.4 2.1 4.5 5.8 4.1c2.1-.2 3.9.9 5 2.6 1.1-1.7 2.9-2.8 5-2.6 3.7.4 5.5 4.3 3.8 7.6C19.5 16.4 12 21 12 21z';

/**
 * Golden envelope with a heart seal. "opening" breaks the seal, flips the
 * flap and slides the letter up; the scene then shows the readable letter.
 */
export const EnvelopeIllustration = memo(function EnvelopeIllustration({ phase }: { phase: EnvelopePhase }) {
  const opening = phase === 'opening';
  return (
    <svg aria-hidden="true" viewBox="0 -70 320 300" className="h-auto w-full overflow-visible">
      <ellipse cx="160" cy="222" rx="130" ry="9" fill="#69428F" opacity="0.18" />

      {/* Open flap (behind the letter) */}
      <motion.path
        d="M24 64 L160 -24 L296 64Z"
        fill="#F5C45E"
        initial={false}
        animate={{ scaleY: opening ? 1 : 0 }}
        transition={{ duration: 0.3, delay: opening ? 0.55 : 0 }}
        style={{ originY: '100%' }}
      />
      {/* Back of the envelope */}
      <rect x="20" y="60" width="280" height="158" rx="14" fill="#F2B84B" />

      {/* Letter paper */}
      <motion.g initial={false} animate={{ y: opening ? -76 : 0 }} transition={{ duration: 0.55, delay: opening ? 0.8 : 0, ease: 'easeOut' }}>
        <rect x="44" y="72" width="232" height="136" rx="8" fill="#FFF9EF" />
        {[100, 118, 136, 154].map((y, i) => (
          <rect key={y} x="68" y={y} width={i === 3 ? 110 : 184} height="6" rx="3" fill="#E8D5F0" />
        ))}
        <path transform="translate(148 168) scale(1)" d={HEART} fill="#FF85B3" />
      </motion.g>

      {/* Front pocket */}
      <path d="M20 86 L160 160 L300 86 L300 204 Q300 218 286 218 L34 218 Q20 218 20 204Z" fill="#FFE08A" />
      <path d="M20 218 L132 140 M300 218 L188 140" stroke="#F2C45A" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Closed flap with heart seal */}
      <motion.g
        initial={false}
        animate={{ scaleY: opening ? 0 : 1 }}
        transition={{ duration: 0.3, delay: opening ? 0.25 : 0, ease: 'easeIn' }}
        style={{ originY: '0%' }}
      >
        <path d="M24 64 Q20 60 30 60 L290 60 Q300 60 296 64 L160 156Z" fill="#FFD36B" stroke="#F2C45A" strokeWidth="3" strokeLinejoin="round" />
      </motion.g>
      <motion.g
        initial={false}
        animate={opening ? { scale: [1, 1.25, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <circle cx="160" cy="146" r="22" fill="#D94383" />
        <path transform="translate(148 134)" d={HEART} fill="#FF85B3" />
        <circle cx="153" cy="140" r="3" fill="#fff" opacity="0.7" />
      </motion.g>
    </svg>
  );
});
