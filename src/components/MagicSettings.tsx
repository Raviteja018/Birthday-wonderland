import { useEffect, useRef, useState } from 'react';
import type { MagicIntensity } from '../hooks/useSettings';
import { useExperience } from '../state/ExperienceContext';

const INTENSITIES: Array<{ value: MagicIntensity; label: string; hint: string }> = [
  { value: 'gentle', label: 'Gentle', hint: 'Fewer sparkles and particles' },
  { value: 'full', label: 'Full', hint: 'All the fairy dust' },
];

/**
 * Visible animation settings, independent of the OS preference:
 * a "Reduce animations" switch and a "Magic intensity" choice, both persisted.
 */
export function MagicSettings() {
  const { settings, setReduceAnimations, setMagicIntensity, systemReducedMotion } = useExperience();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-2 border-purple-deep/25 bg-white px-3 text-sm font-bold text-purple-deep shadow-soft transition hover:border-purple-deep/50 active:scale-95"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
          <path d="M12 1c.6 4.2 2.6 6.2 8.3 8.3-5.7 2.1-7.7 4.1-8.3 8.3-.6-4.2-2.6-6.2-8.3-8.3C9.4 7.2 11.4 5.2 12 1z" />
          <path d="M19 14.5c.3 2.1 1.3 3.1 4.1 4.1-2.8 1-3.8 2-4.1 4.1-.3-2.1-1.3-3.1-4.1-4.1 2.8-1 3.8-2 4.1-4.1z" opacity="0.7" />
        </svg>
        <span className="sr-only lg:not-sr-only">Magic</span>
      </button>

      {open && (
        <div
          role="group"
          aria-label="Animation settings"
          className="absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl bg-white p-3 text-left shadow-card"
        >
          <button
            type="button"
            role="switch"
            aria-checked={settings.reduceAnimations}
            onClick={() => setReduceAnimations(!settings.reduceAnimations)}
            className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-2 text-sm font-bold text-ink hover:bg-blush"
          >
            Reduce animations
            <span
              aria-hidden="true"
              className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${settings.reduceAnimations ? 'bg-pink-ink' : 'bg-purple-deep/25'}`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all ${settings.reduceAnimations ? 'left-[1.125rem]' : 'left-0.5'}`}
              />
            </span>
          </button>

          <p id="magic-intensity-label" className="mt-2 px-2 text-xs font-extrabold tracking-wider text-purple-deep uppercase">
            Magic intensity
          </p>
          <div className="mt-1 flex gap-2 px-2 pb-1" role="group" aria-labelledby="magic-intensity-label">
            {INTENSITIES.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={settings.magicIntensity === option.value}
                title={option.hint}
                onClick={() => setMagicIntensity(option.value)}
                className={`min-h-11 flex-1 cursor-pointer rounded-full border-2 px-3 text-sm font-bold transition ${
                  settings.magicIntensity === option.value
                    ? 'border-pink-ink bg-pink-ink text-white'
                    : 'border-purple-deep/25 bg-white text-purple-deep hover:border-purple-deep/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {systemReducedMotion && (
            <p className="mt-1 px-2 pb-1 text-xs font-semibold text-ink/70">
              Your device asks for reduced motion, so animations stay minimal.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
