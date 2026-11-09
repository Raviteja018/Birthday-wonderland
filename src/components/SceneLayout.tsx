import { useEffect, useRef, type ReactNode } from 'react';

type SceneLayoutProps = {
  sceneId: string;
  heading: ReactNode;
  eyebrow?: ReactNode;
  intro?: ReactNode;
  headingClassName?: string;
  children: ReactNode;
  /** Scene actions (Continue / Skip …), kept at the bottom with safe-area padding. */
  actions?: ReactNode;
};

/** Shared full-viewport chapter layout. Moves focus to the heading when the chapter mounts. */
export function SceneLayout({ sceneId, heading, eyebrow, intro, headingClassName, children, actions }: SceneLayoutProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="safe-x safe-bottom relative mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center pt-3 text-center sm:pt-6">
      <header className="flex w-full max-w-3xl flex-col items-center gap-2">
        {eyebrow && (
          <p className="rounded-full bg-white/70 px-4 py-1 text-sm font-bold tracking-wide text-purple-deep shadow-sm">
            {eyebrow}
          </p>
        )}
        <h2
          id={`${sceneId}-heading`}
          ref={headingRef}
          tabIndex={-1}
          data-scene-heading
          className={`text-shadow-soft max-w-full text-[length:var(--text-scene)] leading-[1.1] font-bold text-purple-deep ${headingClassName ?? ''}`}
        >
          {heading}
        </h2>
        {intro && <div className="max-w-xl text-base text-ink sm:text-lg">{intro}</div>}
      </header>
      <div className="flex w-full flex-1 flex-col items-center justify-center py-4">{children}</div>
      {actions && <div className="flex w-full flex-col items-center gap-2 pt-2">{actions}</div>}
    </div>
  );
}
