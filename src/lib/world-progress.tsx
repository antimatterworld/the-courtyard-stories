import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LoaderProgressCtx = {
  loaderDone: boolean;
  setLoaderDone: (v: boolean) => void;
  registerLoaderWeight: (key: string, w: number) => void;
  reportLoaderItem: (key: string, done: boolean) => void;
  loaderRatio: number;
};

const Ctx = createContext<LoaderProgressCtx | null>(null);

type LoaderState = { weights: Record<string, number>; done: Record<string, boolean> };

export function WorldProgressProvider({ children }: { children: ReactNode }) {
  const [loaderDone, setLoaderDone] = useState(false);
  const [loader, setLoader] = useState<LoaderState>({ weights: {}, done: {} });

  const registerLoaderWeight = useCallback((key: string, w: number) => {
    setLoader((s) => ({
      ...s,
      weights: { ...s.weights, [key]: w },
    }));
  }, []);

  const reportLoaderItem = useCallback((key: string, done: boolean) => {
    setLoader((s) => ({
      ...s,
      done: { ...s.done, [key]: done },
    }));
  }, []);

  const loaderRatio = useMemo(() => {
    const keys = Object.keys(loader.weights);
    if (keys.length === 0) return 0;
    let total = 0;
    let loaded = 0;
    for (const k of keys) {
      const w = loader.weights[k] ?? 0;
      total += w;
      if (loader.done[k]) loaded += w;
    }
    return total > 0 ? loaded / total : 0;
  }, [loader]);

  const value = useMemo(
    () => ({
      loaderDone,
      setLoaderDone,
      registerLoaderWeight,
      reportLoaderItem,
      loaderRatio,
    }),
    [loaderDone, registerLoaderWeight, reportLoaderItem, loaderRatio],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorldProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorldProgress outside provider");
  return ctx;
}