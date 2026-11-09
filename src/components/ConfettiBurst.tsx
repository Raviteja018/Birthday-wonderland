import { motion } from 'motion/react';
import { memo } from 'react';

const DEFAULT_COLORS = ['#FF85B3', '#B49AFF', '#FFE08A', '#9BE7DD', '#FFB6A3'];

type ConfettiBurstProps = {
  /** Change this value to play the burst again. */
  burstKey: string | number;
  count?: number;
  radius?: number;
  colors?: string[];
  className?: string;
  delay?: number;
};

/**
 * Lightweight CSS/motion particle burst (sparkles on hearts and balloons,
 * petal-bursts on hearts). Callers skip rendering it when motion is reduced.
 */
export const ConfettiBurst = memo(function ConfettiBurst({
  burstKey,
  count = 10,
  radius = 70,
  colors = DEFAULT_COLORS,
  className = '',
  delay = 0,
}: ConfettiBurstProps) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute size-0 ${className}`} key={burstKey}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
        const distance = radius * (i % 3 === 0 ? 1 : 0.72);
        const isStar = i % 3 === 1;
        return (
          <motion.span
            key={`${burstKey}-${i}`}
            className="absolute block"
            style={{
              width: isStar ? 10 : 8,
              height: isStar ? 10 : 8,
              marginLeft: -4,
              marginTop: -4,
              background: colors[i % colors.length],
              borderRadius: isStar ? 2 : 999,
              rotate: isStar ? 45 : 0,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
            animate={{ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay }}
          />
        );
      })}
    </span>
  );
});
