"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface UsePollingOptions<T> {
  fetchFn: () => Promise<T>;
  interval?: number;
  maxPolls?: number;
  shouldStop: (data: T) => boolean;
  onUpdate?: (data: T) => void;
  onError?: (error: Error) => void;
  onMaxReached?: () => void;
  enabled?: boolean;
}

interface UsePollingReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  start: () => void;
  stop: () => void;
}

export function usePolling<T>({
  fetchFn,
  interval = 5000,
  maxPolls = 30,
  shouldStop,
  onUpdate,
  onError,
  onMaxReached,
  enabled = false,
}: UsePollingOptions<T>): UsePollingReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [active, setActive] = useState(enabled);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const pollCountRef = useRef(0);

  // Store callbacks in refs to avoid re-creating poll on every render
  const fetchFnRef = useRef(fetchFn);
  const shouldStopRef = useRef(shouldStop);
  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);
  const onMaxReachedRef = useRef(onMaxReached);

  fetchFnRef.current = fetchFn;
  shouldStopRef.current = shouldStop;
  onUpdateRef.current = onUpdate;
  onErrorRef.current = onError;
  onMaxReachedRef.current = onMaxReached;

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const poll = useCallback(() => {
    if (!mountedRef.current) return;

    pollCountRef.current += 1;

    if (pollCountRef.current > maxPolls) {
      setActive(false);
      cleanup();
      onMaxReachedRef.current?.();
      return;
    }

    setLoading(true);

    fetchFnRef.current()
      .then((result) => {
        if (!mountedRef.current) return;
        setData(result);
        setError(null);
        onUpdateRef.current?.(result);

        if (shouldStopRef.current(result)) {
          setLoading(false);
          setActive(false);
          cleanup();
          return;
        }

        timerRef.current = setTimeout(poll, interval);
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        const e = err instanceof Error ? err : new Error("Polling error");
        setError(e);
        onErrorRef.current?.(e);
        // Continue polling on error (backend might be temporarily down)
        timerRef.current = setTimeout(poll, interval);
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, [interval, maxPolls, cleanup]);

  const start = useCallback(() => {
    pollCountRef.current = 0;
    setActive(true);
  }, []);

  const stop = useCallback(() => {
    setActive(false);
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    mountedRef.current = true;
    if (active) {
      poll();
    }
    return () => {
      mountedRef.current = false;
      cleanup();
    };
    // Only re-run when active changes — poll is stable now
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return { data, loading, error, start, stop };
}
