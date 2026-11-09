import { AnimatePresence, MotionConfig } from 'motion/react';
import { useEffect, useMemo, type ComponentType } from 'react';
import { AudioToggle } from './components/AudioToggle';
import { MagicSettings } from './components/MagicSettings';
import { BackButton } from './components/NavigationControls';
import { ProgressIndicator } from './components/ProgressIndicator';
import { SceneBackdrop } from './components/SceneBackdrop';
import { SceneTransition } from './components/SceneTransition';
import { birthdayConfig, type BirthdayConfig } from './config/birthdayConfig';
import { resolveConfig } from './config/resolveConfig';
import { useAudio } from './hooks/useAudio';
import { useReducedMotion } from './hooks/useReducedMotion';
import { REDUCED_TRANSITION_MS, TRANSITION_MS, useSceneNavigation } from './hooks/useSceneNavigation';
import { useSettings, type MagicIntensity } from './hooks/useSettings';
import { CakeScene } from './scenes/CakeScene';
import { LetterScene } from './scenes/LetterScene';
import { FinaleScene } from './scenes/FinaleScene';
import { MemoriesScene } from './scenes/MemoriesScene';
import { WelcomeScene } from './scenes/WelcomeScene';
import { SCENES } from './state/constants';
import { ExperienceContext, type ExperienceContextValue } from './state/ExperienceContext';

const SCENE_COMPONENTS: ComponentType[] = [
  WelcomeScene,
  CakeScene,
  MemoriesScene,
  LetterScene,
  FinaleScene,
];

type AppProps = {
  config?: Partial<BirthdayConfig>;
  /** Navigation lock length; tests shorten it. Defaults to the scene transition length. */
  transitionMs?: number;
};

export default function App({ config: rawConfig = birthdayConfig, transitionMs }: AppProps) {
  const config = useMemo(() => resolveConfig(rawConfig), [rawConfig]);
  const systemReducedMotion = useReducedMotion();
  const { settings, setReduceAnimations, setMagicIntensity } = useSettings();

  // Deterministic override for tests and screenshots: ?motion=reduce stills every ambient loop.
  const urlReducedMotion = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('motion') === 'reduce';
    } catch {
      return false;
    }
  }, []);

  const reducedMotion = systemReducedMotion || urlReducedMotion || settings.reduceAnimations;
  const magic: MagicIntensity = reducedMotion || settings.magicIntensity === 'gentle' ? 'gentle' : 'full';

  const [state, dispatch] = useSceneNavigation(transitionMs ?? (reducedMotion ? REDUCED_TRANSITION_MS : TRANSITION_MS));
  const audio = useAudio(config.musicSrc, state.isMusicEnabled);

  // Mirrors the in-app toggle into CSS so every keyframe loop stops too.
  useEffect(() => {
    document.documentElement.toggleAttribute('data-reduce-anim', reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    if (import.meta.env.DEV) config.warnings.forEach((w) => console.warn(`[birthdayConfig] ${w}`));
  }, [config]);

  const value = useMemo<ExperienceContextValue>(
    () => ({
      state,
      dispatch,
      config,
      reducedMotion,
      systemReducedMotion,
      magic,
      settings,
      setReduceAnimations,
      setMagicIntensity,
      audio,
    }),
    [state, dispatch, config, reducedMotion, systemReducedMotion, magic, settings, setReduceAnimations, setMagicIntensity, audio],
  );

  const Scene = SCENE_COMPONENTS[state.sceneIndex];
  const scene = SCENES[state.sceneIndex];

  return (
    <ExperienceContext.Provider value={value}>
      <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
        <SceneBackdrop sceneIndex={state.sceneIndex} reducedMotion={reducedMotion} magic={magic} />
        <div className="relative flex min-h-svh flex-col">
          <h1 className="sr-only">Birthday Wonderland for {config.recipientName}</h1>
          <header className="safe-top safe-x sticky top-0 z-40 border-b border-white/60 bg-white/45 pb-2 backdrop-blur-md">
            <nav aria-label="Story navigation" className="mx-auto grid max-w-[1100px] grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="flex justify-start">
                <BackButton />
              </div>
              <ProgressIndicator sceneIndex={state.sceneIndex} completedSceneIds={state.completedSceneIds} />
              <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                <AudioToggle />
                <MagicSettings />
              </div>
            </nav>
          </header>
          <main className="flex flex-1 flex-col">
            <AnimatePresence mode="wait" initial={false}>
              <SceneTransition key={state.sceneIndex} sceneId={scene.id}>
                <Scene />
              </SceneTransition>
            </AnimatePresence>
          </main>
        </div>
      </MotionConfig>
    </ExperienceContext.Provider>
  );
}
