import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { MotionGlobalConfig } from 'motion/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Animations finish instantly so tests assert outcomes, not timing.
MotionGlobalConfig.skipAnimations = true;

vi.mock('canvas-confetti', () => {
  const confetti = Object.assign(vi.fn(() => Promise.resolve()), { reset: vi.fn() });
  return { default: confetti };
});

// jsdom doesn't implement media playback or scrollIntoView; tests spy on play() where they need it.
Object.assign(HTMLMediaElement.prototype, { pause() {}, load() {} });
Element.prototype.scrollIntoView = () => {};

let reducedMotion = false;

/** Toggle `prefers-reduced-motion` for the next render. */
export function setReducedMotion(value: boolean) {
  reducedMotion = value;
}

beforeEach(() => {
  reducedMotion = false;
  window.localStorage.clear();
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('reduce') ? reducedMotion : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })) as unknown as typeof window.matchMedia;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  cleanup();
});
