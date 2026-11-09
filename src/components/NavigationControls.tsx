import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { useExperience } from '../state/ExperienceContext';
import { Button } from './Button';

export function BackButton() {
  const { state, dispatch } = useExperience();
  if (state.sceneIndex === 0) return <span className="block w-11 sm:w-24" aria-hidden="true" />;
  return (
    <Button
      variant="secondary"
      className="!px-3 !py-1.5 text-base sm:!px-4"
      onClick={() => dispatch({ type: 'GO_BACK' })}
      disabled={state.isTransitioning}
      aria-label="Back to the previous chapter"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="hidden min-[360px]:inline">Back</span>
    </Button>
  );
}

type SceneActionsProps = {
  /** Show the Continue button (the scene's required interaction is done). */
  canContinue: boolean;
  continueLabel: string;
  onContinue?: () => void;
  /** Show the Skip link (hidden once the activity is completed). */
  showSkip?: boolean;
  skipLabel?: string;
  onSkip?: () => void;
  /** Move focus to Continue when it appears (use when the control that unlocked it disappears). */
  focusOnReveal?: boolean;
  /** Extra controls rendered between Continue and Skip. */
  children?: ReactNode;
};

/** Continue / Skip activity controls shared by every interactive chapter. */
export function SceneActions({
  canContinue,
  continueLabel,
  onContinue,
  showSkip = false,
  skipLabel = 'Skip activity',
  onSkip,
  focusOnReveal = false,
  children,
}: SceneActionsProps) {
  const { state, dispatch } = useExperience();
  const [initiallyVisible] = useState(canContinue);
  const locked = state.isTransitioning;
  return (
    <>
      <AnimatePresence initial={false}>
        {canContinue && (
          <motion.div
            key="continue"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <Button
              onClick={onContinue ?? (() => dispatch({ type: 'GO_NEXT' }))}
              disabled={locked}
              autoFocus={focusOnReveal && !initiallyVisible}
            >
              {continueLabel}
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
      {showSkip && (
        <Button variant="text" className="text-base font-bold" onClick={onSkip ?? (() => dispatch({ type: 'SKIP_ACTIVITY' }))} disabled={locked}>
          {skipLabel}
        </Button>
      )}
    </>
  );
}
