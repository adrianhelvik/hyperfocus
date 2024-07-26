import { useCallback, useRef } from "react";

export default function useStableCallback<T extends (...args: any[]) => unknown>(fn: T): T {
  const ref = useRef<T>(fn);
  ref.current = fn;

  return useCallback((...args: any[]) => {
    return ref.current(...args);
  }, []) as any;
}
