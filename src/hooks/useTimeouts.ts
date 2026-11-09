import { useCallback, useEffect, useRef } from 'react';

/** setTimeout that is automatically cancelled when the component unmounts. */
export function useTimeouts() {
  const timers = useRef(new Set<number>());

  useEffect(() => {
    const active = timers.current;
    return () => {
      active.forEach((id) => window.clearTimeout(id));
      active.clear();
    };
  }, []);

  return useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);
}
