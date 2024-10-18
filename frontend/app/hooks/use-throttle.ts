import { useCallback, useRef } from "react";

const useThrottle = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      if (!timer.current) {
        fn(...args);
        timer.current = setTimeout(() => {
          timer.current = null;
        }, delay);
      }
    },
    [fn, delay]
  );

  return throttledFn;
};

export { useThrottle };
