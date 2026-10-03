"use client";

import { useCallback, useEffect, useState } from "react";

type Result<T> = { loader: () => Promise<T>; attempt: number; data?: T; error?: Error };

/**
 * Runs `loader` on mount and whenever its identity changes (wrap it in useCallback).
 * `loading` is derived, so there is no synchronous setState inside the effect.
 */
export function useAsync<T>(loader: () => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loader().then(
      (data) => { if (!cancelled) setResult({ loader, attempt, data }); },
      (err: unknown) => {
        if (!cancelled) setResult({ loader, attempt, error: err instanceof Error ? err : new Error(String(err)) });
      },
    );
    return () => { cancelled = true; };
  }, [loader, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const current = result && result.loader === loader && result.attempt === attempt ? result : null;

  return {
    data: current?.data,
    error: current?.error,
    loading: current === null,
    retry,
  };
}
