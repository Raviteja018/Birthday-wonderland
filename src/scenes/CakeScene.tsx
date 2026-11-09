import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '../components/Button';
import { CakeIllustration, CandleGraphic } from '../components/CakeIllustration';
import { STAR_PATH } from '../components/FairyAmbience';
import { SceneActions } from '../components/NavigationControls';
import { SceneLayout } from '../components/SceneLayout';
import { CANDLE_COUNT, SceneIndex } from '../state/constants';
import { useExperience } from '../state/ExperienceContext';
import { isSceneComplete } from '../state/experienceReducer';
import { fireConfetti } from '../utils/confetti';

/** Candle centres on the top tier, in the cake's 360-unit-wide viewBox. */
const CANDLE_X = [140, 180, 220];

export function CakeScene() {
  const { state, dispatch, reducedMotion, audio } = useExperience();
  const out = state.extinguishedCandleIds;
  const allOut = out.length >= CANDLE_COUNT;
  const complete = isSceneComplete(state, SceneIndex.Cake);
  const [smoking, setSmoking] = useState<number[]>([]);
  const [slicing, setSlicing] = useState(false);

  const blowOut = (id: number) => {
    if (out.includes(id)) return;
    dispatch({ type: 'EXTINGUISH_CANDLE', id });
    setSmoking((s) => [...s, id]);
    audio.playSfx('puff');
  };

  // The knife cuts first (SVG animation), then the slice lifts out and the celebration starts.
  const cutCake = () => {
    if (state.cakeCut || slicing) return;
    setSlicing(true);
    audio.playSfx("puff");
    window.setTimeout(() => {
      dispatch({ type: "CUT_CAKE" });
      fireConfetti(reducedMotion);
      audio.playSfx("chime");
      [500, 1100, 1800, 2600].forEach((ms) => window.setTimeout(() => fireConfetti(reducedMotion), ms));
    }, reducedMotion ? 0 : 1500);
  };

  const prompt = state.cakeCut
    ? 'Hooray! 🎉'
    : allOut
      ? 'Step 2: tap the knife and slice the cake!'
      : 'Step 1: tap each candle to blow it out!';

  return (
    <SceneLayout
      sceneId="cake"
      heading="Time to cut the cake!"
      intro={<p className="font-semibold">{prompt}</p>}
      actions={<SceneActions canContinue={complete} continueLabel="Continue" showSkip={!complete} focusOnReveal />}
    >
      {/* Party bunting across the top */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden" style={{ zIndex: -1 }}>
        <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="h-14 w-full sm:h-20">
          <path d="M0 6 Q200 44 400 6" fill="none" stroke="#B07AA6" strokeWidth="1.5" />
          {Array.from({ length: 12 }, (_, i) => {
            const x = 18 + i * 33;
            const y = 6 + 19 * (1 - Math.pow((x - 200) / 200, 2));
            return <path key={i} d={`M${x - 11} ${y} L${x + 11} ${y} L${x} ${y + 24}Z`} fill={['#FF85B3', '#FFE08A', '#9BE7DD', '#B49AFF'][i % 4]} />;
          })}
        </svg>
      </div>
      <motion.div
        className="relative aspect-[360/330] w-[min(86vw,320px)] md:w-[400px] lg:w-[480px]"
        initial={{ y: 56, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 110, damping: 16 }}
      >
        <CakeIllustration cut={state.cakeCut} slicing={slicing && !state.cakeCut} />
        {/* Wish-stars gather above the cake once every candle is out. */}
        {allOut && !state.cakeCut && (
          <div aria-hidden="true" className="pointer-events-none absolute -top-[4%] left-1/2 flex -translate-x-1/2 gap-3">
            {[0, 1, 2].map((i) => (
              <svg key={i} viewBox="0 0 24 24" className={`size-5 ${reducedMotion ? '' : 'animate-twinkle'}`} style={{ animationDelay: `${i * 0.35}s` }}>
                <path d={STAR_PATH} fill="#FFE08A" />
              </svg>
            ))}
          </div>
        )}
        {/* Visual instruction: a pulsing arrow points at the lit candles, then a knife slices down onto the cake. */}
        {!allOut && !reducedMotion && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -top-[9%] left-1/2 -translate-x-1/2 text-3xl"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            👇
          </motion.div>
        )}
        {allOut && !slicing && !state.cakeCut && (
          <motion.button
            type="button"
            onClick={cutCake}
            disabled={state.cakeCut}
            aria-label="Cut the cake with the knife"
            className="absolute top-[30%] left-1/2 z-10 -translate-x-1/2 cursor-pointer text-6xl drop-shadow-lg disabled:cursor-default"
            initial={{ opacity: 0, y: -40, rotate: -20 }}
            animate={
              state.cakeCut
                ? { y: 70, rotate: 0, opacity: 0, transition: { duration: 0.6 } }
                : reducedMotion
                  ? { opacity: 1, y: 0, rotate: 0 }
                  : { opacity: 1, y: [0, 22, 0], rotate: [-20, 0, -20], transition: { repeat: Infinity, duration: 1.2 } }
            }
          >
            🔪
          </motion.button>
        )}
        {state.cakeCut && !reducedMotion && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {['🎉', '🎊', '✨', '🎈', '🎂', '💖', '🥳', '🎁'].map((e, i) => (
              <motion.span
                key={i}
                className="absolute bottom-[20%] text-3xl"
                style={{ left: `${8 + i * 12}%` }}
                initial={{ y: 0, opacity: 1, scale: 0.5 }}
                animate={{ y: -260 - (i % 3) * 50, opacity: [1, 1, 0], scale: 1.4, rotate: (i % 2 ? 1 : -1) * 40 }}
                transition={{ duration: 2.4, delay: i * 0.12, ease: 'easeOut' }}
              >
                {e}
              </motion.span>
            ))}
          </div>
        )}
        {CANDLE_X.map((x, id) => {
          const lit = !out.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => blowOut(id)}
              aria-disabled={!lit}
              aria-label={lit ? `Blow out candle ${id + 1}` : `Candle ${id + 1} blown out`}
              className={`absolute top-[1.8%] flex h-[33.3%] w-[max(44px,11.1%)] -translate-x-1/2 justify-center rounded-2xl ${lit ? 'cursor-pointer hover:bg-white/25' : 'cursor-default'}`}
              style={{ left: `${(x / 360) * 100}%` }}
            >
              <CandleGraphic lit={lit} showSmoke={smoking.includes(id) && !reducedMotion} />
              {/* A tiny wish-star floats up from the blown-out candle. */}
              {!lit && smoking.includes(id) && !reducedMotion && (
                <motion.svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="absolute top-1 left-1/2 size-4 -translate-x-1/2"
                  initial={{ y: 2, opacity: 1, scale: 0.5, rotate: 0 }}
                  animate={{ y: -58, opacity: 0, scale: 1.3, rotate: 60 }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                >
                  <path d={STAR_PATH} fill="#FFE08A" />
                </motion.svg>
              )}
            </button>
          );
        })}
      </motion.div>

      <p className="sr-only" aria-live="polite">
        {out.length} of {CANDLE_COUNT} candles blown out
      </p>

      <div className="mt-4 flex min-h-[4.5rem] w-full flex-col items-center justify-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {state.cakeCut ? (
            <motion.p
              key="wish"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white px-6 py-4 font-display text-xl font-semibold text-pink-ink shadow-card sm:text-2xl"
            >
              Many more happy returns of the day, Durga! 🎂🎉
            </motion.p>
          ) : allOut ? (
            <motion.div key="cut" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Button onClick={cutCake} disabled={slicing}>{slicing ? "Slicing… 🍰" : "Slice it! 🔪"}</Button>
            </motion.div>
          ) : (
            <motion.p key="count" exit={{ opacity: 0 }} className="rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-purple-deep" aria-hidden="true">
              {out.length}/{CANDLE_COUNT} candles out
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </SceneLayout>
  );
}
