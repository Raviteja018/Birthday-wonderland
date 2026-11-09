import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { playSfx, type SfxKind } from '../utils/sfx';

export type MusicError = 'blocked' | 'unavailable';

export type AudioControls = {
  hasMusic: boolean;
  musicError: MusicError | null;
  isMusicPlaying: boolean;
  playSfx: (kind: SfxKind) => void;
  /** Pause background music while a video plays. */
  duck: () => void;
  /** Resume background music (if the visitor enabled it) after a video stops. */
  unduck: () => void;
  /** Allow another playback attempt after the browser blocked autoplay. */
  clearBlocked: () => void;
  /** Fade the music out over ~1.5s and stop it for good (used when the finale video starts). */
  fadeOut: () => void;
  /** Allow the music to play again after fadeOut (used on Replay). */
  resume: () => void;
};

function subscribeVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}
const getHidden = () => document.visibilityState === 'hidden';

const errorName = (err: unknown) =>
  err && typeof err === 'object' && 'name' in err ? String((err as { name: unknown }).name) : '';

/**
 * Background music + sound effects. Nothing plays until the visitor turns
 * sound on (a user gesture). Failures are caught and reported, never thrown.
 */
export function useAudio(src: string | undefined, enabled: boolean): AudioControls {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicError, setMusicError] = useState<MusicError | null>(null);
  const [ducked, setDucked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stopped, setStopped] = useState(false);
  const hidden = useSyncExternalStore(subscribeVisibility, getHidden, () => false);

  const shouldPlay = !!src && enabled && !ducked && !hidden && !stopped && musicError === null;

  useEffect(() => {
    if (!src) return;
    let audio = audioRef.current;
    if (!shouldPlay) {
      audio?.pause();
      return;
    }
    const fail = (err?: unknown) => {
      if (errorName(err) === 'AbortError') return;
      setMusicError(errorName(err) === 'NotAllowedError' ? 'blocked' : 'unavailable');
    };
    try {
      if (!audio) {
        audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0.45;
        audio.addEventListener('error', () => setMusicError('unavailable'));
        audio.addEventListener('playing', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));
        audioRef.current = audio;
      }
      audio.volume = 0.45;
      const result = audio.play() as Promise<void> | undefined;
      result?.catch?.(fail);
    } catch (err) {
      queueMicrotask(() => fail(err));
    }
  }, [src, shouldPlay]);

  useEffect(
    () => () => {
      const audio = audioRef.current;
      audioRef.current = null;
      if (!audio) return;
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch {
        // ignore teardown failures
      }
    },
    [],
  );

  const sfx = useCallback(
    (kind: SfxKind) => {
      if (enabled) playSfx(kind);
    },
    [enabled],
  );
  const duck = useCallback(() => setDucked(true), []);
  const unduck = useCallback(() => setDucked(false), []);
  const fadeOut = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) {
      setStopped(true);
      return;
    }
    const timer = window.setInterval(() => {
      audio.volume = Math.max(0, audio.volume - 0.03);
      if (audio.volume <= 0.001) {
        window.clearInterval(timer);
        setStopped(true);
      }
    }, 100);
  }, []);
  const resume = useCallback(() => setStopped(false), []);
  const clearBlocked = useCallback(() => setMusicError((e) => (e === 'blocked' ? null : e)), []);

  return {
    hasMusic: !!src,
    musicError,
    isMusicPlaying: shouldPlay && isPlaying,
    playSfx: sfx,
    duck,
    unduck,
    clearBlocked,
    fadeOut,
    resume,
  };
}
