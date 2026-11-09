import { useCallback, useState } from 'react';

export type MagicIntensity = 'gentle' | 'full';

export type WonderlandSettings = {
  /** The visitor's own animation switch, independent of the OS preference. */
  reduceAnimations: boolean;
  /** Ambient particle density. It never affects required story actions. */
  magicIntensity: MagicIntensity;
};

const STORAGE_KEY = 'birthday-wonderland:settings';
const DEFAULTS: WonderlandSettings = { reduceAnimations: false, magicIntensity: 'full' };

function load(): WonderlandSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULTS;
    const record = parsed as Record<string, unknown>;
    return {
      reduceAnimations: record.reduceAnimations === true,
      magicIntensity: record.magicIntensity === 'gentle' ? 'gentle' : 'full',
    };
  } catch {
    return DEFAULTS;
  }
}

/** Visitor animation preferences, persisted safely to localStorage (never required to work). */
export function useSettings() {
  const [settings, setSettings] = useState<WonderlandSettings>(load);

  const update = useCallback((patch: Partial<WonderlandSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private browsing or blocked storage: the choice still applies this visit.
      }
      return next;
    });
  }, []);

  const setReduceAnimations = useCallback((value: boolean) => update({ reduceAnimations: value }), [update]);
  const setMagicIntensity = useCallback((value: MagicIntensity) => update({ magicIntensity: value }), [update]);

  return { settings, setReduceAnimations, setMagicIntensity };
}
