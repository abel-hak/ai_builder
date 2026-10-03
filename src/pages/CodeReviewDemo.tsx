import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft,
  Code2,
  Loader2,
  Sparkles,
  Copy,
  Check,
  History,
  ChevronDown,
  RefreshCw,
  Undo2,
  Wrench,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { streamAI } from "@/lib/ai-stream";
import { toast } from "sonner";
import { supabase, type Generation } from "@/lib/supabase";
import MonacoEditor from "@monaco-editor/react";
import {
  applyFix,
  categoryLabel,
  parseReview,
  type Review,
  type ReviewIssue,
} from "@/lib/review";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "sql", label: "SQL" },
];

const sampleCode = `function fetchUserData(userId) {
  const response = fetch('/api/users/' + userId);
  const data = response.json();
  localStorage.setItem('token', data.token);
  eval('console.log(' + data.name + ')');
  return data;
}

app.get('/search', (req, res) => {
  const query = req.query.q;
  db.query("SELECT * FROM users WHERE name = '" + query + "'");
});`;

const severityUi: Record<
  ReviewIssue["severity"],
  { label: string; className: string; Icon: typeof AlertCircle }
> = {
  critical: {
    label: "Critical",
    className: "bg-status-negative text-status-negative",
    Icon: AlertCircle,
  },
  warning: {
    label: "Warn",
    className: "bg-status-caution text-status-caution",
    Icon: AlertTriangle,
  },
  info: {
    label: "Nit",
    className: "bg-status-neutral text-status-neutral",
    Icon: Info,
  },
};

const getScoreTone = (score: number) => {
  if (score <= 3) return { text: "text-status-negative", fill: "hsl(var(--status-negative))", label: "Critical issues" };
  if (score <= 5) return { text: "text-status-caution", fill: "hsl(var(--status-caution))", label: "Needs work" };
  if (score <= 7) return { text: "text-status-caution", fill: "hsl(var(--status-caution))", label: "Acceptable" };
  return { text: "text-status-positive", fill: "hsl(var(--status-positive))", label: "Solid" };
};

const ScoreCard = ({ score, summary }: { score: number; summary: string }) => {
  const tone = getScoreTone(score);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 10) * circumference;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
            <circle
              cx="50"
              cy="50"
              r="36"
              fill="none"
              stroke={tone.fill}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-semibold tabular-nums ${tone.text}`}>{score}</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="label text-muted-foreground mb-1">Quality score</p>
          <p className={`text-sm font-medium ${tone.text}`}>{tone.label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{score}/10 from structured review</p>
        </div>
      </div>
      <p className="text-sm text-foreground/85 leading-relaxed">{summary}</p>
    </div>
  );
};

const SeverityCounts = ({ issues }: { issues: ReviewIssue[] }) => {
  const counts = {
    critical: issues.filter((i) => i.severity === "critical").length,
    warning: issues.filter((i) => i.severity === "warning").length,
    info: issues.filter((i) => i.severity === "info").length,
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(counts) as ReviewIssue["severity"][]).map((key) => (
        <div key={key} className="rounded-md border border-border bg-card px-3 py-2 text-center">
          <div className="text-lg font-medium tabular-nums text-foreground">{counts[key]}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{severityUi[key].label}</div>
        </div>
      ))}
    </div>
  );
};

const CodeReviewDemo = () => {
  const [code, setCode] = useState(sampleCode);
  const [previousCode, setPreviousCode] = useState<string | null>(null);
  const [language, setLanguage] = useState("javascript");
  const [rawOutput, setRawOutput] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [patchingId, setPatchingId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<Generation[]>([]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [focusNote, setFocusNote] = useState("");
  const [filter, setFilter] = useState<"all" | ReviewIssue["severity"]>("all");
  const resultRef = useRef<HTMLDivElement>(null);
  const lineCount = useMemo(() => Math.max(1, code.split("\n").length), [code]);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (loading && resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [rawOutput, loading]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("type", "code-review")
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const copyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied");
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const runReview = async (opts?: { refine?: boolean }) => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setRawOutput("");
    setReview(null);

    const refine = Boolean(opts?.refine && review);
    const userParts = [
      `Review this ${language} code. Return ONLY the JSON object described in your system prompt.`,
      "```" + language,
      code,
      "```",
    ];

    if (refine) {
      userParts.push(
        "",
        "This is a refinement pass. Previous structured review:",
        "```json",
        JSON.stringify(review, null, 2),
        "```",
        focusNote.trim()
          ? `Focus this pass on: ${focusNote.trim()}. Keep unrelated findings only if still valid.`
          : "Re-check the code against the previous findings and tighten the list. Prefer actionable fixes.",
      );
    }

    let result = "";
    await streamAI({
      mode: "code-review-json",
      format: "json",
      messages: [{ role: "user", content: userParts.join("\n") }],
      onDelta: (chunk) => {
        result += chunk;
        setRawOutput(result);
      },
      onDone: async () => {
        setLoading(false);
        if (!result.trim()) return;

        const parsed = parseReview(result, lineCount);
        if (!parsed) {
          toast.error("Could not parse a structured review. Try again.");
          return;
        }

        setReview(parsed);
        setRawOutput(JSON.stringify(parsed, null, 2));
        if (refine) setFocusNote("");

        const { error } = await supabase.from("generations").insert({
          type: "code-review",
          input_text: code,
          output_text: JSON.stringify(parsed),
        });
        if (!error) fetchHistory();
      },
      onError: (err) => {
        setLoading(false);
        toast.error(err);
      },
    });
  };

  const handleApplyFix = (issue: ReviewIssue) => {
    if (!issue.fix) return;
    setPreviousCode(code);
    setCode(applyFix(code, issue.fix));
    toast.success(`Applied fix for “${issue.title}” — re-review to verify.`);
  };

  const handleUndo = () => {
    if (previousCode == null) return;
    setCode(previousCode);
    setPreviousCode(null);
    toast.message("Reverted last applied fix");
  };

  const requestPatchForIssue = async (issue: ReviewIssue, index: number) => {
    if (!review || loading || patchingId) return;
    const issueKey = `${issue.line}-${issue.title}-${index}`;
    setPatchingId(issueKey);

    const prompt = [
      `You are continuing a structured code review.`,
      `Language: ${language}`,
      `Produce ONLY a JSON object: { "startLine": number, "endLine": number, "replacement": string }`,
      `The replacement must fix this finding with a minimal line-range edit:`,
      JSON.stringify({
        line: issue.line,
        endLine: issue.endLine,
        severity: issue.severity,
        category: issue.category,
        title: issue.title,
        message: issue.message,
      }),
      "Current code:",
      "```" + language,
      code,
      "```",
    ].join("\n");

    let result = "";
    await streamAI({
      mode: "code-review-json",
      format: "json",
      messages: [{ role: "user", content: prompt }],
      onDelta: (chunk) => {
        result += chunk;
      },
      onDone: () => {
        setPatchingId(null);
        const extracted = (() => {
          try {
            const start = result.indexOf("{");
            const end = result.lastIndexOf("}");
            if (start === -1 || end === -1) return null;
            return JSON.parse(result.slice(start, end + 1)) as {
              startLine?: number;
              endLine?: number;
              replacement?: string;
            };
          } catch {
            return null;
          }
        })();

        if (
          !extracted ||
          typeof extracted.startLine !== "number" ||
          typeof extracted.endLine !== "number" ||
          typeof extracted.replacement !== "string"
        ) {
          toast.error("Could not get a patch for that finding.");
          return;
        }

        const fix = {
          startLine: Math.max(1, Math.min(extracted.startLine, lineCount)),
          endLine: Math.max(1, Math.min(extracted.endLine, lineCount)),
          replacement: extracted.replacement,
        };
        if (fix.endLine < fix.startLine) fix.endLine = fix.startLine;

        setReview({
          ...review,
          issues: review.issues.map((item, i) => (i === index ? { ...item, fix } : item)),
        });
        toast.success("Patch ready — apply it when you want.");
      },
      onError: (err) => {
        setPatchingId(null);
        toast.error(err);
      },
    });
  };

  const loadHistoryItem = (item: Generation) => {
    setCode(item.input_text);
    setPreviousCode(null);
    setRawOutput(item.output_text);
    const parsed = parseReview(item.output_text, Math.max(1, item.input_text.split("\n").length));
    setReview(parsed);
    if (!parsed) toast.message("Older history entry is prose — run a fresh review for structured findings.");
  };

  const visibleIssues = useMemo(() => {
    if (!review) return [];
    if (filter === "all") return review.issues;
    return review.issues.filter((i) => i.severity === filter);
  }, [review, filter]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              to="/#tools"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to tools"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md border border-border flex items-center justify-center shrink-0">
                <Code2 className="text-primary" size={16} />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-medium font-sans">AI Code Reviewer</h1>
                <p className="text-[11px] text-muted-foreground truncate">
                  Structured findings · Apply fixes · Refine loop
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {previousCode != null && (
              <button
                type="button"
                onClick={handleUndo}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Undo2 size={13} />
                Undo fix
              </button>
            )}
            <button
              type="button"
              onClick={() => runReview()}
              disabled={loading || !code.trim()}
              className="btn-primary !px-4 !py-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading ? "Analyzing..." : "Review Code"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-60 border-r border-border bg-card/30 flex-col hidden lg:flex">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <History size={13} className="text-primary" />
            <span className="text-xs font-medium">History</span>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {history.length === 0 ? (
              <div className="text-[11px] text-muted-foreground text-center p-4">No reviews yet</div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => loadHistoryItem(item)}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-secondary transition-colors group"
                >
                  <div className="text-[11px] font-mono text-foreground/80 line-clamp-2 leading-relaxed group-hover:text-foreground transition-colors">
                    {item.input_text.slice(0, 80)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          <div className="flex-1 flex flex-col min-w-0 border-r border-border">
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card/30">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary"
                >
                  {LANGUAGES.find((l) => l.value === language)?.label || language}
                  <ChevronDown size={12} />
                </button>
                {showLangDropdown && (
                  <div className="absolute top-full left-0 mt-1 py-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[140px]">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.value);
                          setShowLangDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors",
                          language === lang.value ? "text-primary" : "text-foreground/80",
                        )}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground">{lineCount} lines</div>
            </div>

            <div className="flex-1 min-h-0">
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={(val) => setCode(val || "")}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "'Geist Mono', 'Fira Code', Consolas, monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  renderLineHighlight: "line",
                  padding: { top: 16, bottom: 16 },
                  overviewRulerBorder: false,
                  overviewRulerLanes: 0,
                  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card/30 gap-2">
              <span className="text-xs text-muted-foreground">
                {loading ? "Streaming structured review..." : review ? "Findings" : "Results"}
              </span>
              {review && (
                <button
                  type="button"
                  onClick={() => copyText("json", JSON.stringify(review, null, 2))}
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
                  aria-label="Copy review JSON"
                >
                  {copiedKey === "json" ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
                </button>
              )}
            </div>

            <div ref={resultRef} className="flex-1 overflow-auto">
              {review && !loading ? (
                <div className="p-5 space-y-5">
                  <ScoreCard score={review.score} summary={review.summary} />
                  <SeverityCounts issues={review.issues} />

                  <div className="rounded-lg border border-border bg-card p-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="label text-muted-foreground">Refine loop</p>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => runReview({ refine: true })}
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={12} />
                        Re-review with focus
                      </button>
                    </div>
                    <textarea
                      value={focusNote}
                      onChange={(e) => setFocusNote(e.target.value)}
                      rows={2}
                      placeholder="Optional: “only security”, “produce patches for warnings”, “ignore naming nits”…"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                    />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Sends the current code plus the previous JSON review so the model can tighten findings instead of starting from scratch.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(["all", "critical", "warning", "info"] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFilter(key)}
                        className={cn(
                          "px-2.5 py-1 rounded-sm text-[11px] border transition-colors",
                          filter === key
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {key === "all" ? "All" : severityUi[key].label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {visibleIssues.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        No findings in this filter.
                      </div>
                    ) : (
                      visibleIssues.map((issue, index) => {
                        const absoluteIndex = review.issues.indexOf(issue);
                        const ui = severityUi[issue.severity];
                        const issueKey = `${issue.line}-${issue.title}-${absoluteIndex}`;
                        const lineLabel =
                          issue.endLine && issue.endLine !== issue.line
                            ? `L${issue.line}–${issue.endLine}`
                            : `L${issue.line}`;

                        return (
                          <article
                            key={issueKey}
                            className="rounded-lg border border-border bg-card p-4 space-y-3"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="space-y-2 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-medium border border-border",
                                      ui.className,
                                    )}
                                  >
                                    <ui.Icon size={11} />
                                    {ui.label}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-sm border border-border text-muted-foreground">
                                    {categoryLabel[issue.category]}
                                  </span>
                                  <span className="font-mono text-[11px] text-muted-foreground">{lineLabel}</span>
                                </div>
                                <h3 className="text-sm font-medium text-foreground">{issue.title}</h3>
                              </div>
                            </div>

                            <p className="text-sm text-foreground/80 leading-relaxed">{issue.message}</p>

                            {issue.fix ? (
                              <div className="rounded-md border border-border bg-background overflow-hidden">
                                <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2">
                                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                    Suggested fix · L{issue.fix.startLine}
                                    {issue.fix.endLine !== issue.fix.startLine ? `–${issue.fix.endLine}` : ""}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => copyText(issueKey, issue.fix!.replacement)}
                                      className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors"
                                      aria-label="Copy suggested fix"
                                    >
                                      {copiedKey === issueKey ? (
                                        <Check size={12} className="text-primary" />
                                      ) : (
                                        <Copy size={12} />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleApplyFix(issue)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[11px] bg-primary text-primary-foreground hover:brightness-105 transition-[filter]"
                                    >
                                      <Wrench size={11} />
                                      Apply to editor
                                    </button>
                                  </div>
                                </div>
                                <pre className="p-3 text-[11px] font-mono text-foreground/85 overflow-x-auto leading-relaxed whitespace-pre">
                                  {issue.fix.replacement}
                                </pre>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={Boolean(patchingId) || loading}
                                onClick={() => requestPatchForIssue(issue, absoluteIndex)}
                                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                              >
                                {patchingId === issueKey ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Wrench size={12} />
                                )}
                                Rewrite finding into a patch
                              </button>
                            )}
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-6">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground max-w-sm text-center">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="text-xs">Building structured findings…</span>
                      {rawOutput && (
                        <pre className="w-full max-h-40 overflow-auto text-left text-[10px] font-mono text-muted-foreground/70 bg-card border border-border rounded-md p-3 streaming">
                          {rawOutput.slice(-400)}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="text-center px-8">
                      <Code2 size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">Paste code and run a structured review</p>
                      <p className="text-xs text-muted-foreground/60">
                        You’ll get severity-tagged findings, line ranges, and applyable patches
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodeReviewDemo;
