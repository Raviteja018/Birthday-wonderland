import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { SceneActions } from '../components/NavigationControls';
import { SceneLayout } from '../components/SceneLayout';
import { SceneIndex } from '../state/constants';
import { useExperience } from '../state/ExperienceContext';
import { isSceneComplete } from '../state/experienceReducer';

const AUTO_MS = 2800;
const UNLOCK_AT = 0.5;
const SWIPE_MIN_PX = 40;

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'} />
    </svg>
  );
}

/**
 * Chapter 3 — an auto-advancing photo carousel. Photos keep their own proportions
 * (never cropped). Hover/touch pauses; arrows, dots and swipes work too. Continue
 * unlocks once 50% of the photos have been shown.
 */
export function MemoriesScene() {
  const { state, dispatch, config, reducedMotion } = useExperience();
  const memories = config.memories;
  const count = memories.length;
  const complete = isSceneComplete(state, SceneIndex.Memories);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [furthest, setFurthest] = useState(0);
  const swipeX = useRef<number | null>(null);

  const go = (next: number, dir = next > index ? 1 : -1) => {
    setDirection(dir);
    setIndex(((next % count) + count) % count);
  };

  // Auto-advance (loops); off with reduced motion or while paused.
  useEffect(() => {
    if (reducedMotion || paused || count < 2) return;
    const t = window.setTimeout(() => go(index + 1, 1), AUTO_MS);
    return () => window.clearTimeout(t);
  });

  useEffect(() => {
    setFurthest((f) => Math.max(f, index));
  }, [index]);

  useEffect(() => {
    if (!complete && (furthest + 1) / count >= UNLOCK_AT) dispatch({ type: 'MARK_COMPLETE', sceneIndex: SceneIndex.Memories });
  }, [furthest, count, complete, dispatch]);

  const onPointerDown = (e: PointerEvent) => {
    swipeX.current = e.clientX;
    setPaused(true);
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = swipeX.current;
    swipeX.current = null;
    setPaused(false);
    if (start === null) return;
    const dx = e.clientX - start;
    if (Math.abs(dx) >= SWIPE_MIN_PX) go(index + (dx < 0 ? 1 : -1));
  };

  const memory = memories[index];
  const slide = reducedMotion ? 0 : 80;

  return (
    <SceneLayout
      sceneId="memories"
      heading="A walk down memory lane"
      actions={<SceneActions canContinue={complete} continueLabel="Continue to my letter" />}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Photo gallery"
        className="flex w-full max-w-[640px] flex-col items-center gap-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex w-full items-center gap-2 sm:gap-4">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-purple-deep shadow-soft">
            <Arrow dir="left" />
          </button>
          <div
            className="relative flex h-[min(44svh,360px)] min-w-0 flex-1 touch-pan-y items-center justify-center select-none"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              swipeX.current = null;
              setPaused(false);
            }}
          >
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.figure
                key={memory.id}
                initial={{ opacity: 0, x: direction * slide, rotate: direction * 2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -direction * slide }}
                transition={{ duration: 0.3 }}
                className="relative m-0 flex max-h-full max-w-full rounded-[10px] bg-[#fffaf3] p-[7px] shadow-[0_10px_28px_rgb(80_40_90/0.28)] ring-[3px] ring-[#d9a441]/90"
              >
                {/* Cute frame: gradient border, white mat, and corner charms. The frame hugs the photo's own size. */}
                <img
                  src={memory.imageSrc}
                  alt={memory.alt}
                  draggable={false}
                  className="block max-h-[calc(min(44svh,360px)-14px)] max-w-full rounded-[4px] object-contain"
                />
              </motion.figure>
            </AnimatePresence>
          </div>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-purple-deep shadow-soft">
            <Arrow dir="right" />
          </button>
        </div>
        <p className="rounded-full bg-white/80 px-4 py-1 font-bold text-purple-deep" aria-live="off">
          {index + 1} of {count}
        </p>
      </div>
    </SceneLayout>
  );
}
