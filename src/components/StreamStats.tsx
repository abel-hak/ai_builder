import { useEffect, useState } from "react";
import type { StreamStats as Stats } from "@/lib/models";

const fmtMs = (ms: number | null) => (ms === null ? "—" : ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`);
const fmtNum = (n: number | null, digits = 0) => (n === null ? "—" : n.toFixed(digits));
const fmtCost = (usd: number | null) => (usd === null ? "—" : usd < 0.0001 ? "<$0.0001" : `$${usd.toFixed(4)}`);

type Props = {
  stats: Stats | null;
  /** When true, shows a live elapsed timer instead of final numbers. */
  loading?: boolean;
  liveChars?: number;
};

/**
 * Compact telemetry strip: TTFT, throughput, tokens, and estimated cost.
 * Text labels carry the meaning; no state is conveyed by colour alone.
 */
const StreamStats = ({ stats, loading = false, liveChars = 0 }: Props) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const start = performance.now();
    setElapsed(0);
    const id = window.setInterval(() => setElapsed(performance.now() - start), 100);
    return () => window.clearInterval(id);
  }, [loading]);

  if (loading) {
    return (
      <dl className="flex items-center gap-4 text-[11px] text-muted-foreground tabular-nums" aria-live="polite">
        <div className="flex gap-1">
          <dt>Elapsed</dt>
          <dd className="text-foreground">{fmtMs(elapsed)}</dd>
        </div>
        <div className="flex gap-1">
          <dt>Received</dt>
          <dd className="text-foreground">{liveChars.toLocaleString()} chars</dd>
        </div>
      </dl>
    );
  }

  if (!stats) return null;

  const modelShort = stats.model.split("/").pop() ?? stats.model;

  return (
    <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground tabular-nums">
      <div className="flex gap-1" title="Time to first token">
        <dt>TTFT</dt>
        <dd className="text-foreground">{fmtMs(stats.ttftMs)}</dd>
      </div>
      <div className="flex gap-1" title="Completion tokens per second">
        <dt>Speed</dt>
        <dd className="text-foreground">
          {stats.tokensPerSec === null ? "—" : `${fmtNum(stats.tokensPerSec)} tok/s`}
        </dd>
      </div>
      <div className="flex gap-1" title="Prompt → completion tokens">
        <dt>Tokens</dt>
        <dd className="text-foreground">
          {fmtNum(stats.promptTokens)} → {fmtNum(stats.completionTokens)}
        </dd>
      </div>
      <div className="flex gap-1" title="Estimated cost from Groq list prices">
        <dt>Est.</dt>
        <dd className="text-foreground">{fmtCost(stats.estCostUsd)}</dd>
      </div>
      <div className="flex gap-1 hidden md:flex" title={stats.model}>
        <dt>Model</dt>
        <dd className="text-foreground">{modelShort}</dd>
      </div>
      <div className="flex gap-1 hidden lg:flex" title="Total wall time">
        <dt>Total</dt>
        <dd className="text-foreground">{fmtMs(stats.totalMs)}</dd>
      </div>
    </dl>
  );
};

export default StreamStats;
