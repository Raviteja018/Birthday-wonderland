import { memo } from 'react';

/** A single shiny balloon with a curly string. Decorative; the balloon button carries the label. */
export const BalloonIllustration = memo(function BalloonIllustration({ color, shade }: { color: string; shade: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 160" className="h-full w-full overflow-visible">
      <path d="M50 116 C42 126 58 136 47 146 C40 152 50 156 52 160" fill="none" stroke="#8A6FAE" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M50 6 C79 6 94 31 94 56 C94 87 69 107 50 110 C31 107 6 87 6 56 C6 31 21 6 50 6Z" fill={color} />
      <path d="M50 110 C69 107 94 87 94 56 C94 44 90 32 83 24 C88 50 78 90 50 110Z" fill={shade} opacity="0.45" />
      <ellipse cx="32" cy="36" rx="8" ry="15" fill="#fff" opacity="0.55" transform="rotate(-24 32 36)" />
      <path d="M44 109 L56 109 L50 118Z" fill={shade} />
    </svg>
  );
});
