import { memo } from 'react';
import type { MagicIntensity } from '../hooks/useSettings';
import type { SceneId } from '../state/constants';

type Glyph = 'star' | 'heart' | 'sparkle' | 'dot' | 'sprinkle' | 'cloud';

const PALETTES: Record<SceneId, { glyphs: Glyph[]; colors: string[] }> = {
  welcome: { glyphs: ['star', 'heart', 'sparkle', 'dot'], colors: ['#FF85B3', '#B49AFF', '#FFE08A', '#ffffff'] },
  cake: { glyphs: ['sprinkle', 'star', 'sparkle'], colors: ['#ffffff', '#FFE08A', '#9BE7DD', '#FF85B3'] },
  finale: { glyphs: ['star', 'heart', 'sparkle'], colors: ['#FFE08A', '#FF85B3', '#ffffff'] },
  memories: { glyphs: ['heart', 'star', 'dot'], colors: ['#FF85B3', '#FFB6A3', '#B49AFF'] },
  letter: { glyphs: ['star', 'sparkle', 'dot'], colors: ['#FFE08A', '#ffffff', '#FFF3F8'] },
};

// [left %, top %, size px, delay s] — hand-placed so the centre stays calm.
const SPOTS: Array<[number, number, number, number]> = [
  [6, 14, 22, 0],
  [90, 12, 18, 1.2],
  [12, 72, 16, 0.6],
  [86, 66, 24, 2],
  [48, 6, 12, 1.6],
  [4, 44, 12, 2.4],
  [95, 40, 14, 0.3],
  [24, 90, 18, 1.1],
  [74, 88, 14, 2.8],
  [30, 22, 10, 3.2],
  [68, 20, 12, 0.9],
  [18, 54, 10, 1.9],
  [80, 50, 10, 2.6],
  [58, 94, 12, 0.4],
];

function GlyphShape({ glyph, color }: { glyph: Glyph; color: string }) {
  switch (glyph) {
    case 'star':
      return <path d="M12 2l2.6 6.3 6.8.6-5.2 4.4 1.6 6.7L12 16.5 6.2 20l1.6-6.7L2.6 8.9l6.8-.6z" fill={color} />;
    case 'heart':
      return <path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2.1 4.5 5.8 4.1c2.1-.2 3.9.9 5 2.6 1.1-1.7 2.9-2.8 5-2.6 3.7.4 5.5 4.3 3.8 7.6C19.5 16.4 12 21 12 21z" fill={color} />;
    case 'sparkle':
      return <path d="M12 1c.8 5.6 3.4 8.2 11 11-7.6 2.8-10.2 5.4-11 11-.8-5.6-3.4-8.2-11-11 7.6-2.8 10.2-5.4 11-11z" fill={color} />;
    case 'dot':
      return <circle cx="12" cy="12" r="6" fill={color} />;
    case 'sprinkle':
      return <rect x="9" y="3" width="6" height="18" rx="3" fill={color} transform="rotate(35 12 12)" />;
    case 'cloud':
      return <path d="M6 18a4 4 0 01-.6-8 6 6 0 0111.4-1.4A4.5 4.5 0 1118 18z" fill={color} />;
  }
}

type FloatingDecorationsProps = {
  variant: SceneId;
  reducedMotion: boolean;
  magic: MagicIntensity;
};

/** Purely decorative floating stars/hearts. Fewer on small screens and at gentle intensity; still when motion is reduced. */
export const FloatingDecorations = memo(function FloatingDecorations({ variant, reducedMotion, magic }: FloatingDecorationsProps) {
  const { glyphs, colors } = PALETTES[variant];
  const spots = magic === 'full' ? SPOTS : SPOTS.slice(0, 8);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {spots.map(([left, top, size, delay], i) => {
        const glyph = glyphs[i % glyphs.length];
        const scale = glyph === 'cloud' ? 2.4 : 1;
        const visibility = i >= 10 ? 'hidden lg:block' : i >= 6 ? 'hidden sm:block' : 'block';
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={`absolute ${visibility} ${reducedMotion ? '' : i % 2 ? 'animate-twinkle' : 'animate-float'}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size * scale,
              height: size * scale,
              opacity: glyph === 'cloud' ? 0.75 : 0.85,
              animationDelay: `${delay}s`,
            }}
          >
            <GlyphShape glyph={glyph} color={colors[i % colors.length]} />
          </svg>
        );
      })}
    </div>
  );
});
