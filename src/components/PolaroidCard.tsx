import { useState } from 'react';
import type { ResolvedMemory } from '../config/resolveConfig';
import { MediaFallback } from './MediaFallback';

const ROTATIONS = ['-rotate-2', 'rotate-[1.5deg]', '-rotate-1', 'rotate-[2.5deg]', '-rotate-[2.5deg]', 'rotate-1'];

/** Sources that already failed this visit, so revisiting a slide never flashes a broken image. */
const failedSources = new Set<string>();

type PolaroidCardProps = {
  memory: ResolvedMemory;
  index: number;
  total: number;
  onVideoPlay?: () => void;
  onVideoStop?: () => void;
};

export function PolaroidCard({ memory, index, total, onVideoPlay, onVideoStop }: PolaroidCardProps) {
  const src = memory.videoSrc ?? memory.imageSrc;
  const [failed, setFailed] = useState(() => !!src && failedSources.has(src));
  const [loaded, setLoaded] = useState(false);

  const markFailed = () => {
    if (src) failedSources.add(src);
    setFailed(true);
    onVideoStop?.();
  };

  const showFallback = !src || failed;
  const note = failed ? (memory.videoSrc ? 'Video unavailable' : 'Photo unavailable') : 'Sample memory';

  return (
    <figure
      className={`relative mx-auto w-full max-w-[340px] bg-white p-3 pb-4 shadow-card transition-transform duration-300 sm:max-w-[420px] lg:max-w-[480px] ${ROTATIONS[index % ROTATIONS.length]}`}
      aria-roledescription="memory"
      aria-label={`Memory ${index + 1} of ${total}`}
    >
      <span aria-hidden="true" className="absolute -top-3 left-6 h-6 w-20 -rotate-6 bg-yellow/80 shadow-sm" />
      <span aria-hidden="true" className="absolute -top-3 right-6 h-6 w-20 rotate-6 bg-pink/60 shadow-sm" />

      <div className={`relative w-full overflow-hidden rounded-sm bg-blush ${memory.videoSrc || showFallback || !loaded ? 'aspect-[4/3]' : ''}`}>
        {showFallback ? (
          <MediaFallback label={memory.alt} note={note} variant={index} />
        ) : memory.videoSrc ? (
          <video
            className="h-full w-full bg-ink object-cover"
            src={memory.videoSrc}
            poster={memory.posterSrc}
            controls
            playsInline
            preload="metadata"
            aria-label={memory.alt}
            onPlay={onVideoPlay}
            onPause={onVideoStop}
            onEnded={onVideoStop}
            onError={markFailed}
          />
        ) : (
          <>
            {!loaded && <MediaFallback label="" note="Loading…" variant={index} className="absolute inset-0" />}
            <img
              src={memory.imageSrc}
              alt={memory.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={markFailed}
              className={`${loaded ? 'relative mx-auto block h-auto max-h-[60svh] w-auto max-w-full opacity-100' : 'absolute inset-0 h-full w-full object-cover opacity-0'} transition-opacity duration-300`}
            />
          </>
        )}
        {memory.isSample && !showFallback && (
          <span className="absolute top-2 right-2 rounded-full bg-white/90 px-2.5 py-0.5 text-[0.7rem] font-extrabold tracking-wide text-purple-deep uppercase shadow-sm">
            Sample
          </span>
        )}
      </div>

      <figcaption className="px-1 pt-3 text-center">
        {memory.dateLabel && (
          <span className="mb-1 inline-block rounded-full bg-lavender/25 px-3 py-0.5 text-xs font-extrabold tracking-wider text-purple-deep uppercase">
            {memory.dateLabel}
          </span>
        )}
        <span className="block font-hand text-2xl leading-tight font-bold text-ink sm:text-3xl">{memory.caption || memory.alt}</span>
      </figcaption>
    </figure>
  );
}
