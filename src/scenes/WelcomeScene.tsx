import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '../components/Button';
import { Butterfly } from '../components/FairyAmbience';
import { GiftIllustration, type GiftPhase } from '../components/GiftIllustration';
import { SceneLayout } from '../components/SceneLayout';
import { useTimeouts } from '../hooks/useTimeouts';
import { useExperience } from '../state/ExperienceContext';
import { fireConfetti } from '../utils/confetti';

/** The headline fades in word by word; screen readers get the whole line at once. */
function StaggeredHeadline({ text, reduced }: { text: string; reduced: boolean }) {
  if (reduced) return <>{text} 💖</>;
  const words = text.split(' ');
  // The words stay real text (screen readers read them normally); only opacity/position animate.
  return (
    <span>
      <span>
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.14, duration: 0.4, ease: 'easeOut' }}
          >
            {word}
            {' '}
          </motion.span>
        ))}
        <motion.span
          className="inline-block"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + words.length * 0.14, type: 'spring', stiffness: 260, damping: 12 }}
        >
          💖
        </motion.span>
      </span>
    </span>
  );
}

export function WelcomeScene() {
  const { config, dispatch, reducedMotion, audio, state } = useExperience();
  const [phase, setPhase] = useState<GiftPhase>('idle');
  const schedule = useTimeouts();
  const busy = phase !== 'idle' || state.isTransitioning;

  // The gift and the CTA share this handler; the phase guard prevents double-firing.
  const openSurprise = () => {
    if (busy) return;
    if (reducedMotion) {
      setPhase('open');
      dispatch({ type: 'GO_NEXT' });
      return;
    }
    setPhase('wiggle');
    audio.playSfx('sparkle');
    schedule(() => setPhase('open'), 480);
    schedule(() => {
      fireConfetti();
      audio.playSfx('chime');
    }, 640);
    schedule(() => dispatch({ type: 'GO_NEXT' }), 1250);
  };

  return (
    <SceneLayout
      sceneId="welcome"
      eyebrow="A little surprise for you!"
      heading={
        <span className="block text-[length:var(--text-hero)]">
          <StaggeredHeadline text={`Hey, ${config.recipientName}!`} reduced={reducedMotion} />
        </span>
      }
      intro={
        <>
          <p>{config.welcomeSubtitle}</p>
        </>
      }
      actions={
        <Button onClick={openSurprise} disabled={busy} className="px-8 py-3.5 text-xl">
          Open my surprise 🎁
        </Button>
      }
    >
      {!reducedMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: -1 }}>
          {/* Twilight sky gently brightening as the story begins. */}
          <motion.div
            className="absolute inset-0 bg-[#5a3f82]"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          {/* Two butterflies cross the meadow once. */}
          <Butterfly flight="cross" className="w-10" top="30%" color="#B8A2FF" delay={0.8} duration={12} reduced={reducedMotion} />
          <Butterfly flight="cross" className="w-7" top="46%" color="#FF86B5" delay={2.4} duration={15} reduced={reducedMotion} />
        </div>
      )}

      <button
        type="button"
        onClick={openSurprise}
        disabled={busy}
        aria-label="Open the gift"
        className="group w-[min(64vw,300px)] cursor-pointer rounded-[28px] p-2 transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-default sm:w-[340px] lg:w-[400px]"
      >
        <span className={`block ${phase === 'idle' && !reducedMotion ? 'animate-bob' : ''}`}>
          <GiftIllustration phase={phase} />
        </span>
      </button>
    </SceneLayout>
  );
}
