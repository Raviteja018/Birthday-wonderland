import { motion, useIsPresent } from 'motion/react';
import type { ReactNode } from 'react';

type SceneTransitionProps = {
  sceneId: string;
  children: ReactNode;
};

/** Keyed wrapper animated by AnimatePresence. An exiting scene is inert so it can't be clicked or focused. */
export function SceneTransition({ sceneId, children }: SceneTransitionProps) {
  const isPresent = useIsPresent();
  return (
    <motion.section
      aria-labelledby={`${sceneId}-heading`}
      data-scene={sceneId}
      inert={!isPresent}
      className="flex w-full flex-1 flex-col"
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, y: -16, transition: { duration: 0.22, ease: 'easeIn' } }}
    >
      {children}
    </motion.section>
  );
}
