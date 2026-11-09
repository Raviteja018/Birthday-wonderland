import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { EnvelopeIllustration, type EnvelopePhase } from '../components/EnvelopeIllustration';
import { Butterfly, CrescentMoon, FireflyField, FloatingPetals } from '../components/FairyAmbience';
import { SceneLayout } from '../components/SceneLayout';
import { useTimeouts } from '../hooks/useTimeouts';
import { useExperience } from '../state/ExperienceContext';
import { fireConfetti } from '../utils/confetti';

const OPENING_MS = 1450;

/**
 * Chapter 5 — the love letter, and the ending of the story. Once the seal is
 * broken the letter stays on screen inside a moonlit fairytale finale:
 * fireflies, butterflies, drifting petals, a one-time confetti flourish, and
 * Replay / Read-again actions. There is no further scene.
 */
export function LetterScene() {
  const { state, dispatch, config, reducedMotion, magic, audio } = useExperience();
  const [phase, setPhase] = useState<EnvelopePhase>('closed');
  const [openedHere, setOpenedHere] = useState(false);
  const letterRef = useRef<HTMLDivElement | null>(null);
  const pendingFocus = useRef(false);
  const schedule = useTimeouts();
  const opened = state.letterOpened;
  const paragraphs = config.letterParagraphs;

  // The letter mounts only after the envelope finishes exiting (AnimatePresence
  // mode="wait"), so focus must wait for the node itself, not for state.
  const attachLetter = (node: HTMLDivElement | null) => {
    letterRef.current = node;
    if (node && pendingFocus.current) {
      pendingFocus.current = false;
      node.focus({ preventScroll: true });
    }
  };

  // One-time fairytale flourish the moment the letter is first revealed.
  useEffect(() => {
    if (!openedHere) return;
    const timer = window.setTimeout(() => {
      fireConfetti(reducedMotion);
      audio.playSfx('chime');
    }, 450);
    return () => window.clearTimeout(timer);
  }, [openedHere, reducedMotion, audio]);

  const reveal = () => {
    pendingFocus.current = true;
    setOpenedHere(true);
    dispatch({ type: 'OPEN_LETTER' });
  };

  const openEnvelope = () => {
    if (phase !== 'closed' || opened) return;
    if (reducedMotion) {
      reveal();
      return;
    }
    setPhase('opening');
    audio.playSfx('sparkle');
    schedule(reveal, OPENING_MS);
  };

  const [first, ...rest] = paragraphs;
  const signOff = undefined as string | undefined; // no separate sign-off line: the last paragraph is regular text
  const body = signOff ? rest.slice(0, -1) : rest;

  return (
    <SceneLayout
      sceneId="letter"
      heading={config.copy.letterHeading}
      intro={!opened ? <p className="font-semibold">{config.copy.letterTeaser}</p> : undefined}
      actions={
        !opened ? (
          <>
            <Button onClick={openEnvelope} disabled={phase !== 'closed'}>
              Yes, I&apos;m ready! 💌
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button onClick={() => dispatch({ type: 'GO_NEXT' })} disabled={state.isTransitioning}>
              Continue to the last chapter →
            </Button>
          </div>
        )
      }
    >
      {/* Moonlit ambience: behind the letter card (earlier in DOM), never interactive. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <CrescentMoon className="absolute top-[9%] right-[2%] w-14 opacity-90 sm:top-[6%] sm:right-[4%] sm:w-24" />
        <FireflyField count={opened ? (magic === 'full' ? 10 : 5) : magic === 'full' ? 6 : 3} reduced={reducedMotion} />
        {opened && !reducedMotion && (
          <>
            <FloatingPetals count={magic === 'full' ? 5 : 3} />
            <Butterfly flight="hover" className="absolute top-[18%] left-[6%] w-10" color="#B8A2FF" reduced={reducedMotion} />
            <Butterfly flight="hover" className="absolute top-[32%] right-[7%] w-8" color="#FF86B5" delay={1.3} reduced={reducedMotion} />
          </>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!opened ? (
          <motion.div key="envelope" exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }} className="w-full">
            <button
              type="button"
              onClick={openEnvelope}
              disabled={phase !== 'closed'}
              aria-label="Open the envelope"
              className="mx-auto block w-[min(84vw,320px)] cursor-pointer rounded-[28px] p-2 transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-default md:w-[400px] lg:w-[460px]"
            >
              <span className={`block ${phase === 'closed' && !reducedMotion ? 'animate-bob' : ''}`}>
                <EnvelopeIllustration phase={phase} />
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative flex w-full flex-col items-center gap-5"
          >
            <article
              className="relative w-full max-w-[720px] rounded-[24px] border border-[#F3E2C8] bg-cream text-left shadow-card"
              aria-labelledby="letter-heading"
            >
              <span aria-hidden="true" className="absolute -top-4 left-1/2 flex size-9 -translate-x-1/2 items-center justify-center rounded-full bg-pink-deep text-lg text-white shadow-soft">
                ♥
              </span>
              <h3 id="letter-heading" className="sr-only">
                Your letter
              </h3>
              <div
                ref={attachLetter}
                role="region"
                aria-label="Letter text"
                tabIndex={0}
                className="max-h-[min(58svh,560px)] overflow-y-auto px-6 pt-8 pb-6 sm:px-10"
                data-testid="letter-text"
              >
                {first && <p className="font-hand text-3xl leading-tight font-bold text-purple-deep sm:text-4xl">{first}</p>}
                {body.map((text, i) => (
                  <p key={i} className="mt-4 text-[1.0625rem] leading-relaxed text-ink sm:text-lg">
                    {text}
                  </p>
                ))}
                {signOff && <p className="mt-6 text-right font-hand text-3xl leading-tight font-bold text-pink-ink">{signOff}</p>}
              </div>
            </article>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneLayout>
  );
}
