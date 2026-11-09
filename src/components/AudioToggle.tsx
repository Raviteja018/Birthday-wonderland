import { useExperience } from '../state/ExperienceContext';
import { playSfx } from '../utils/sfx';

/** Global sound switch (off by default). Controls the optional song and the tiny synthesized effects. */
export function AudioToggle() {
  const { state, dispatch, audio, config } = useExperience();
  const enabled = state.isMusicEnabled;

  const description = !audio.hasMusic
    ? 'No song has been added, so this only turns on gentle sound effects.'
    : audio.musicError === 'unavailable'
      ? "The song couldn't be loaded, so only gentle sound effects will play."
      : `Plays ${config.musicTitle ?? 'background music'} and gentle sound effects.`;

  const toggle = () => {
    const next = !enabled;
    audio.clearBlocked();
    dispatch({ type: 'SET_MUSIC_ENABLED', enabled: next });
    if (next) playSfx('sparkle');
  };

  const notice =
    enabled && audio.musicError === 'blocked'
      ? 'Your browser paused the music. Tap the sound button again to retry.'
      : enabled && audio.musicError === 'unavailable'
        ? "The song couldn't play, but sound effects are on."
        : '';

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        aria-describedby="audio-toggle-description"
        className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-2 border-purple-deep/25 bg-white px-3 text-sm font-bold text-purple-deep shadow-soft transition hover:border-purple-deep/50 active:scale-95"
      >
        {enabled ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" fillOpacity="0.2" />
            <path d="M16 9.5a3.5 3.5 0 010 5M18.5 7a7 7 0 010 10" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" fillOpacity="0.2" />
            <path d="M17 10l4 4M21 10l-4 4" />
          </svg>
        )}
        {/* Constant visible label (WCAG label-in-name); the icon and aria-pressed show on/off. */}
        <span className="sr-only sm:not-sr-only">Sound</span>
      </button>
      <span id="audio-toggle-description" className="sr-only">
        {description}
      </span>
      <p
        role="status"
        className={`absolute top-full right-0 mt-2 w-60 rounded-2xl bg-white px-3 py-2 text-left text-sm text-ink shadow-card ${notice ? '' : 'sr-only'}`}
      >
        {notice}
      </p>
    </div>
  );
}
