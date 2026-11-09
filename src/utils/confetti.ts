import confetti from 'canvas-confetti';

const COLORS = ['#FF85B3', '#B49AFF', '#FFE08A', '#9BE7DD', '#FFB6A3', '#D94383'];

/**
 * A short, lightweight celebration burst (the welcome gift, the cut cake, the
 * last balloon, and the letter's one-time flourish). Skipped when the tab is
 * hidden or motion is reduced.
 */
export function fireConfetti(reducedMotion = false) {
  if (reducedMotion || document.visibilityState === 'hidden') return;
  try {
    const small = window.innerWidth < 768;
    void confetti({
      colors: COLORS,
      disableForReducedMotion: true,
      zIndex: 60,
      ticks: 180,
      scalar: small ? 0.8 : 1,
      particleCount: small ? 60 : 110,
      spread: 75,
      startVelocity: 38,
      origin: { y: 0.55 },
    });
  } catch {
    // Confetti is decorative; never let it break the experience.
  }
}

export function resetConfetti() {
  try {
    confetti.reset();
  } catch {
    // ignore
  }
}
