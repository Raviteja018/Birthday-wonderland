import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { SceneLayout } from '../components/SceneLayout';
import { useExperience } from '../state/ExperienceContext';
import { fireConfetti, resetConfetti } from '../utils/confetti';

type Step = { q: string; yes: string; no: string; yesReply: string; noReply: string };

/** Each question gets a playful reaction whichever button is pressed; the surprise comes regardless. */
const STEPS: Step[] = [
  { q: 'Psst… Durga… are you ready for a surprise? 🤫', yes: 'Yes! 😍', no: 'No… 🙈', yesReply: 'Ooh, so brave… 👀', noReply: 'Too late, it is already coming! 😈' },
  { q: 'Are you REALLY sure? It is a big one… 😏', yes: 'Yes, really!', no: 'Not sure 😬', yesReply: 'Hmm… we will see about that 🤨', noReply: 'Nice try! There is no turning back now 😈' },
  { q: 'Can you handle a LOT of cuteness?', yes: 'Bring it on! 💪', no: 'Maybe not… 🙈', yesReply: 'We will see about that… 😏', noReply: 'Too bad, the cuteness is unstoppable! 🥰' },
  { q: 'Last chance to turn back… 😱 Shall I open it?', yes: 'Open it! 🎁', no: 'Wait, no! 😨', yesReply: 'Here we go… 💥', noReply: 'Opening it anyway… 💥' },
];

/** Chapter 5 of the story — a thriller-style Yes/No suspense, then the surprise video. */
export function FinaleScene() {
  const { state, dispatch, reducedMotion, audio } = useExperience();
  const [step, setStep] = useState(0);
  const [reply, setReply] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);


  const answer = (yes: boolean) => {
    if (reply) return;
    const current = STEPS[step];
    setReply(yes ? current.yesReply : current.noReply);
    audio.playSfx('sparkle');
    window.setTimeout(
      () => {
        setReply(null);
        if (step === STEPS.length - 1) {
          setCount(3);
        } else {
          setStep((s) => s + 1);
        }
      },
      reducedMotion ? 600 : 1500,
    );
  };

  // 3 … 2 … 1 countdown before the video opens.
  useEffect(() => {
    if (count === null) return;
    const t = window.setTimeout(() => {
      if (count > 1) {
        setCount(count - 1);
        audio.playSfx("sparkle");
      } else {
        setCount(null);
        setRevealed(true);
        audio.fadeOut(); // the song fades away so the video's own sound is heard
        fireConfetti(reducedMotion);
        audio.playSfx("chime");
      }
    }, 1000);
    return () => window.clearTimeout(t);
  }, [count, audio, reducedMotion]);

  // The click that revealed the video is a user gesture, so playback with sound is normally allowed.
  // If the browser still refuses, retry muted so the video always starts.
  useEffect(() => {
    if (!revealed) return;
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => undefined);
    });
  }, [revealed]);

  const current = STEPS[step];

  return (
    <SceneLayout
      sceneId="finale"
      heading={revealed ? 'Happy Birthday, Durga! 🎂' : 'One last surprise…'}
      actions={
        revealed ? (
          <Button
            variant="secondary"
            disabled={state.isTransitioning}
            onClick={() => {
              resetConfetti();
              audio.resume();
              dispatch({ type: 'REPLAY' });
            }}
          >
            Replay from beginning ↺
          </Button>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {!revealed ? (
          <motion.div key="suspense" exit={{ opacity: 0 }} className="flex w-full max-w-[520px] flex-col items-center gap-6">
            <p className="text-sm font-bold tracking-widest text-white/80 uppercase" aria-hidden="true">
              Question {step + 1} of {STEPS.length}
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${step}-${count ?? (reply ? "r" : "q")}`}
                initial={{ opacity: 0, y: 14, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.3 }}
                className="flex min-h-[10rem] w-full flex-col items-center justify-center gap-6 rounded-[28px] bg-[#2a1450]/70 px-5 py-6 text-center shadow-card backdrop-blur-sm"
                aria-live="polite"
              >
                {count !== null ? (
                  <motion.p initial={{ scale: 2.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45 }} className="font-display text-[7rem] leading-none font-extrabold text-[#FFE08A]">
                    {count}
                  </motion.p>
                  ) : reply ? (
                  <p className="font-display text-3xl font-bold text-[#FFE08A]">{reply}</p>
                ) : (
                  <>
                    <p className="font-display text-2xl font-bold text-white sm:text-3xl">{current.q}</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button onClick={() => answer(true)}>{current.yes}</Button>
                      <Button variant="secondary" onClick={() => answer(false)}>
                        {current.no}
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="video" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[720px]">
            <video
              ref={videoRef}
              src="/video/finale.mp4"
              controls
              autoPlay
              playsInline
              preload="auto"
              className="max-h-[70svh] w-full rounded-[24px] bg-black shadow-card"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </SceneLayout>
  );
}
