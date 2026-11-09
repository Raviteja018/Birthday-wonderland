import { createContext, useContext, type Dispatch } from 'react';
import type { ExperienceAction, ExperienceState } from './experienceReducer';
import type { ResolvedConfig } from '../config/resolveConfig';
import type { AudioControls } from '../hooks/useAudio';
import type { MagicIntensity, WonderlandSettings } from '../hooks/useSettings';

export type ExperienceContextValue = {
  state: ExperienceState;
  dispatch: Dispatch<ExperienceAction>;
  config: ResolvedConfig;
  /** Effective: OS preference, the ?motion=reduce test override, or the visitor's own toggle. */
  reducedMotion: boolean;
  /** The OS-level preference alone (shown as a hint in the settings panel). */
  systemReducedMotion: boolean;
  /** Effective ambient density ('gentle' whenever motion is reduced). */
  magic: MagicIntensity;
  settings: WonderlandSettings;
  setReduceAnimations: (value: boolean) => void;
  setMagicIntensity: (value: MagicIntensity) => void;
  audio: AudioControls;
};

export const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function useExperience(): ExperienceContextValue {
  const value = useContext(ExperienceContext);
  if (!value) throw new Error('useExperience must be used inside <ExperienceContext.Provider>');
  return value;
}
