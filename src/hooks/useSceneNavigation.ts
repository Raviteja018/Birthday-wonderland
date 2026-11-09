import { useEffect, useReducer } from 'react';
import { experienceReducer, initialExperienceState } from '../state/experienceReducer';

export const TRANSITION_MS = 600;
export const REDUCED_TRANSITION_MS = 350;

/**
 * Owns the experience state. Every scene change locks navigation for the
 * length of the transition so rapid clicks can never skip two chapters.
 */
export function useSceneNavigation(transitionMs: number) {
  const [state, dispatch] = useReducer(experienceReducer, initialExperienceState);

  useEffect(() => {
    if (!state.isTransitioning) return;
    const timer = window.setTimeout(() => dispatch({ type: 'SET_TRANSITIONING', value: false }), transitionMs);
    return () => window.clearTimeout(timer);
  }, [state.isTransitioning, state.sceneIndex, transitionMs]);

  useEffect(() => {
    document.title = "Happy Birthday Durga 🎂";
  }, []);

  return [state, dispatch] as const;
}
