import { memo } from 'react';
import type { MagicIntensity } from '../hooks/useSettings';
import { SCENES } from '../state/constants';
import { FloatingDecorations } from './FloatingDecorations';

type SceneBackdropProps = {
  sceneIndex: number;
  reducedMotion: boolean;
  magic: MagicIntensity;
};

/** Full-screen gradient + decorations for every chapter, cross-faded so scene changes never flash. */
export const SceneBackdrop = memo(function SceneBackdrop({ sceneIndex, reducedMotion, magic }: SceneBackdropProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      {SCENES.map((scene, i) => (
        <div
          key={scene.id}
          className={`bg-scene-${scene.id} absolute inset-0 transition-opacity duration-700 ease-out ${i === sceneIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          {Math.abs(i - sceneIndex) <= 1 && <FloatingDecorations variant={scene.id} reducedMotion={reducedMotion} magic={magic} />}
        </div>
      ))}
    </div>
  );
});
