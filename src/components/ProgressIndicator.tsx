import { STAR_PATH } from './FairyAmbience';
import { SCENE_COUNT } from '../state/constants';

type ProgressIndicatorProps = {
  sceneIndex: number;
  completedSceneIds: number[];
};

/**
 * "Chapter X of 6" plus six tiny illuminated stars. Shape and fill (not just
 * color) separate current, completed and upcoming; screen readers get text.
 */
export function ProgressIndicator({ sceneIndex, completedSceneIds }: ProgressIndicatorProps) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5" data-testid="progress">
      <p className="text-xs font-extrabold tracking-wide whitespace-nowrap text-purple-deep sm:text-sm" aria-live="polite">
        Chapter {sceneIndex + 1} of {SCENE_COUNT}
      </p>
      <ol className="flex items-center gap-1" aria-label="Chapters">
        {Array.from({ length: SCENE_COUNT }, (_, i) => {
          const isCurrent = i === sceneIndex;
          const isDone = completedSceneIds.includes(i);
          const status = isCurrent ? 'current' : isDone ? 'completed' : 'not visited yet';
          return (
            <li key={i} aria-current={isCurrent ? 'step' : undefined} className="flex items-center">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                data-status={isCurrent ? 'current' : isDone ? 'completed' : 'upcoming'}
                className={`transition-all duration-300 ${isCurrent ? 'size-[18px]' : 'size-3.5'}`}
                style={isCurrent ? { filter: 'drop-shadow(0 0 4px rgb(255 133 179 / 0.9))' } : undefined}
              >
                <path
                  d={STAR_PATH}
                  fill={isCurrent ? '#D94383' : isDone ? '#B49AFF' : 'rgb(255 255 255 / 0.85)'}
                  stroke={isCurrent || isDone ? 'none' : '#69428F'}
                  strokeWidth={isCurrent || isDone ? 0 : 1.8}
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">
                Chapter {i + 1}: {status}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
