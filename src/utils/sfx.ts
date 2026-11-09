export type SfxKind = 'pop' | 'chime' | 'puff' | 'sparkle';

type AudioContextCtor = typeof AudioContext;

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (!context) {
      const legacy = (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
      const Ctor = window.AudioContext ?? legacy;
      if (!Ctor) return null;
      context = new Ctor();
    }
    if (context.state === 'suspended') void context.resume().catch(() => {});
    return context;
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  endFreq?: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Tiny synthesized sound effects — no audio files, always quiet. */
export function playSfx(kind: SfxKind) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    switch (kind) {
      case 'pop':
        tone(ctx, 520, now, 0.12, 0.12, 'triangle', 140);
        break;
      case 'puff':
        tone(ctx, 260, now, 0.25, 0.05, 'sine', 90);
        break;
      case 'sparkle':
        tone(ctx, 1046, now, 0.18, 0.05);
        tone(ctx, 1318, now + 0.07, 0.2, 0.04);
        break;
      case 'chime':
        [523, 659, 784, 1046].forEach((f, i) => tone(ctx, f, now + i * 0.09, 0.45, 0.06));
        break;
    }
  } catch {
    // Sound is purely decorative; ignore any audio failure.
  }
}
