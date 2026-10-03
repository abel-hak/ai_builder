import { useCallback, useSyncExternalStore } from "react";

/**
 * Models the edge function will accept. Keep in sync with ALLOWED_MODELS in
 * supabase/functions/ai-demo/index.ts. Prices are USD per 1M tokens from
 * console.groq.com/docs/models and only drive the on-screen estimate.
 */
export const MODELS = [
  {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B",
    note: "Fastest · default",
    inputPerM: 0.075,
    outputPerM: 0.3,
  },
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    note: "Stronger reasoning",
    inputPerM: 0.15,
    outputPerM: 0.6,
  },
  {
    id: "qwen/qwen3.8-27b",
    label: "Qwen 3.8 27B",
    note: "Multilingual",
    inputPerM: 0.8,
    outputPerM: 4.0,
  },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export const DEFAULT_MODEL: ModelId = "openai/gpt-oss-20b";

const STORAGE_KEY = "forge.model";
const listeners = new Set<() => void>();

const isModelId = (value: string | null): value is ModelId =>
  MODELS.some((m) => m.id === value);

const readModel = (): ModelId => {
  if (typeof window === "undefined") return DEFAULT_MODEL;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return isModelId(saved) ? saved : DEFAULT_MODEL;
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/** Shared, persisted model choice for every tool. */
export function useModel(): [ModelId, (id: ModelId) => void] {
  const model = useSyncExternalStore(subscribe, readModel, () => DEFAULT_MODEL);
  const setModel = useCallback((id: ModelId) => {
    window.localStorage.setItem(STORAGE_KEY, id);
    listeners.forEach((cb) => cb());
  }, []);
  return [model, setModel];
}

export type StreamStats = {
  model: string;
  /** Milliseconds from request start to the first streamed token. */
  ttftMs: number | null;
  /** Milliseconds from request start to stream end. */
  totalMs: number;
  /** Characters received; a cheap live proxy before usage arrives. */
  chars: number;
  promptTokens: number | null;
  completionTokens: number | null;
  tokensPerSec: number | null;
  estCostUsd: number | null;
};

export function estimateCost(
  model: string,
  promptTokens: number | null,
  completionTokens: number | null,
): number | null {
  const entry = MODELS.find((m) => m.id === model);
  if (!entry || promptTokens === null || completionTokens === null) return null;
  return (promptTokens * entry.inputPerM + completionTokens * entry.outputPerM) / 1_000_000;
}

export function finalizeStats(input: {
  model: string;
  startedAt: number;
  firstTokenAt: number | null;
  endedAt: number;
  chars: number;
  promptTokens: number | null;
  completionTokens: number | null;
}): StreamStats {
  const totalMs = Math.max(0, input.endedAt - input.startedAt);
  const ttftMs = input.firstTokenAt === null ? null : Math.max(0, input.firstTokenAt - input.startedAt);
  const generationMs =
    input.firstTokenAt === null ? totalMs : Math.max(1, input.endedAt - input.firstTokenAt);
  const tokensPerSec =
    input.completionTokens === null ? null : (input.completionTokens / generationMs) * 1000;

  return {
    model: input.model,
    ttftMs,
    totalMs,
    chars: input.chars,
    promptTokens: input.promptTokens,
    completionTokens: input.completionTokens,
    tokensPerSec,
    estCostUsd: estimateCost(input.model, input.promptTokens, input.completionTokens),
  };
}
