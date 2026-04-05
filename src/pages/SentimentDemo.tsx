import { useState, useEffect, useRef } from "react";
import { ArrowLeft, BarChart3, Loader2, Sparkles, Copy, Check, History, Smile, Frown, Meh, Zap, Heart, AlertTriangle, Download, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { streamAI } from "@/lib/ai-stream";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/lib/supabase";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from "recharts";

const samples = [
  {
    label: "Product Review",
    text: "I absolutely love this product! The quality is outstanding, though the shipping took forever and customer service was unhelpful when I tried to track my order. Despite that frustration, the product itself exceeded my expectations.",
  },
  {
    label: "Employee Feedback",
    text: "The new management has been incredibly supportive and transparent. However, the recent layoffs have created an atmosphere of anxiety and distrust. Many of us feel overworked but are afraid to speak up.",
  },
  {
    label: "Social Media",
    text: "Just tried the new restaurant downtown 🍕 The pasta was AMAZING but the wait was absolutely ridiculous - 2 hours?! The ambiance was gorgeous though and our waiter was so sweet. Would I go back? Maybe for takeout lol",
  },
];

// ── Parse structured data from AI response ──
interface EmotionData { name: string; score: number; fullMark: 10; color: string }
interface SentimentResult {
  emotions: EmotionData[];
  overall: "positive" | "negative" | "mixed" | "neutral";
  confidence: number | null;
  overallScore: number | null;
  highlights: { text: string; sentiment: "positive" | "negative" | "neutral" }[];
}

const emotionColors: Record<string, string> = {
  joy: "#10b981", happiness: "#10b981", positive: "#10b981",
  anger: "#ef4444", frustration: "#f97316",
  sadness: "#6366f1", fear: "#8b5cf6", anxiety: "#8b5cf6",
  love: "#ec4899", trust: "#14b8a6",
  surprise: "#eab308", anticipation: "#f59e0b",
  disgust: "#78716c", neutral: "#6b7280",
};

const parseSentimentData = (text: string): SentimentResult => {
  const emotions: EmotionData[] = [];

  // Extract emotion scores: "Joy: 8/10" or "**Joy**: 7"
  const patterns = [
    /[-•*]?\s*\**([A-Za-z]+)\**\s*[:：]\s*(\d+)\s*(?:\/\s*10)?/gim,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].toLowerCase().trim();
      let score = parseInt(match[2], 10);
      if (score > 10) score = Math.round(score / 10);
      if (score >= 0 && score <= 10 && emotionColors[name]) {
        emotions.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          score,
          fullMark: 10,
          color: emotionColors[name],
        });
      }
    }
    if (emotions.length > 0) break;
  }

  // Overall sentiment
  let overall: SentimentResult["overall"] = "neutral";
  if (/overall.*positive/i.test(text)) overall = "positive";
  else if (/overall.*negative/i.test(text)) overall = "negative";
  else if (/overall.*mixed/i.test(text)) overall = "mixed";

  // Confidence
  let confidence: number | null = null;
  const confMatch = text.match(/confidence\s*[:：]\s*(\d+)/i);
  if (confMatch) confidence = parseInt(confMatch[1], 10);

  // Overall score
  let overallScore: number | null = null;
  const scoreMatch = text.match(/(?:overall\s+)?(?:sentiment\s+)?score\s*[:：]\s*(\d+)/i);
  if (scoreMatch) overallScore = parseInt(scoreMatch[1], 10);

  // Highlighted key phrases
  const highlights: SentimentResult["highlights"] = [];
  const posMatch = text.match(/positive.*?[:：]\s*[""]?(.+?)[""]?\s*(?:\n|$)/i);
  const negMatch = text.match(/negative.*?[:：]\s*[""]?(.+?)[""]?\s*(?:\n|$)/i);
  if (posMatch) {
    posMatch[1].split(/[,;]/).forEach(p => {
      const clean = p.replace(/[""*]/g, "").trim();
      if (clean.length > 2 && clean.length < 100) highlights.push({ text: clean, sentiment: "positive" });
    });
  }
  if (negMatch) {
    negMatch[1].split(/[,;]/).forEach(p => {
      const clean = p.replace(/[""*]/g, "").trim();
      if (clean.length > 2 && clean.length < 100) highlights.push({ text: clean, sentiment: "negative" });
    });
  }

  return { emotions: emotions.slice(0, 8), overall, confidence, overallScore, highlights };
};

// ── Visual Components ──
const overallConfig = {
  positive: { label: "Positive", color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400", icon: Smile },
  negative: { label: "Negative", color: "#ef4444", bg: "bg-red-500/10", text: "text-red-400", icon: Frown },
  mixed: { label: "Mixed", color: "#f59e0b", bg: "bg-yellow-500/10", text: "text-yellow-400", icon: Meh },
  neutral: { label: "Neutral", color: "#6b7280", bg: "bg-gray-500/10", text: "text-gray-400", icon: Meh },
};

const SentimentGauge = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 10) * circumference;
  const color = score <= 3 ? "#ef4444" : score <= 5 ? "#f97316" : score <= 7 ? "#eab308" : "#10b981";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="5"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-foreground">{score}</span>
          <span className="text-[9px] text-muted-foreground">/10</span>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground mt-1">Sentiment Score</span>
    </div>
  );
};

const EmotionBar = ({ name, score, color }: { name: string; score: number; color: string }) => (
  <div className="flex items-center gap-2.5">
    <span className="text-[11px] text-foreground/70 w-20 shrink-0 text-right">{name}</span>
    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${score * 10}%`, backgroundColor: color }}
      />
    </div>
    <span className="text-[10px] text-muted-foreground w-4">{score}</span>
  </div>
);

// PDF-like export as downloadable HTML
const exportReport = (sourceText: string, data: SentimentResult, fullAnalysis: string) => {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Sentiment Analysis Report</title>
<style>
  body { font-family: -apple-system, sans-serif; max-width: 700px; margin: 2rem auto; padding: 0 1.5rem; color: #1a1a1a; }
  h1 { font-size: 1.25rem; border-bottom: 2px solid #e5e5e5; padding-bottom: 0.75rem; }
  h2 { font-size: 1rem; color: #555; margin-top: 2rem; }
  .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
  .positive { background: #d1fae5; color: #065f46; }
  .negative { background: #fee2e2; color: #991b1b; }
  .mixed { background: #fef3c7; color: #92400e; }
  .neutral { background: #f3f4f6; color: #374151; }
  .source { background: #f9fafb; border: 1px solid #e5e7eb; padding: 1rem; border-radius: 0.5rem; font-style: italic; }
  .bar-container { display: flex; align-items: center; gap: 0.5rem; margin: 0.4rem 0; }
  .bar-label { width: 80px; font-size: 0.75rem; text-align: right; }
  .bar-bg { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; }
  .highlight { padding: 0.15rem 0.35rem; border-radius: 3px; font-size: 0.8rem; }
  .highlight.pos { background: #d1fae5; }
  .highlight.neg { background: #fee2e2; }
  .meta { font-size: 0.7rem; color: #999; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 0.5rem; }
</style></head><body>
<h1>📊 Sentiment Analysis Report</h1>
<p><span class="badge ${data.overall}">${data.overall.toUpperCase()}</span> ${data.confidence ? `Confidence: ${data.confidence}/10` : ""}</p>

<h2>Source Text</h2>
<div class="source">${sourceText}</div>

<h2>Emotion Breakdown</h2>
${data.emotions.map(e => `
<div class="bar-container">
  <span class="bar-label">${e.name}</span>
  <div class="bar-bg"><div class="bar-fill" style="width:${e.score * 10}%;background:${e.color}"></div></div>
  <span style="font-size:0.7rem;color:#888">${e.score}/10</span>
</div>`).join("")}

${data.highlights.length > 0 ? `
<h2>Key Phrases</h2>
<p>${data.highlights.map(h => `<span class="highlight ${h.sentiment === "positive" ? "pos" : "neg"}">${h.text}</span>`).join(" · ")}</p>
` : ""}

<div class="meta">Generated by Abel Erduno Hakenso's Sentiment Engine · ${new Date().toLocaleDateString()}</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sentiment-report-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Report downloaded");
};

// ── Main Component ──
const SentimentDemo = () => {
  const [text, setText] = useState(samples[0].text);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => {
    if (loading && outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [analysis, loading]);

  const fetchHistory = async () => {
    const { data } = await supabase.from("generations").select("*").eq("type", "sentiment").order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setAnalysis("");
    setLoading(true);
    let result = "";

    const prompt = `Analyze the sentiment and emotions in this text with detailed scoring.

REQUIRED FORMAT — follow this exactly:

## Overall Sentiment
Overall: [Positive/Negative/Mixed/Neutral]
Sentiment Score: [1-10]
Confidence: [1-10]

## Emotion Breakdown
- **Joy**: [0-10]/10
- **Sadness**: [0-10]/10
- **Anger**: [0-10]/10
- **Fear**: [0-10]/10
- **Surprise**: [0-10]/10
- **Trust**: [0-10]/10
- **Anticipation**: [0-10]/10
- **Disgust**: [0-10]/10

## Key Phrases
Positive phrases: [quote the positive phrases from the text, comma separated]
Negative phrases: [quote the negative phrases from the text, comma separated]

## Tone Analysis
[2-3 sentences describing the overall tone, voice, and communication style]

## Intent
[1-2 sentences about the intent behind the text]

Text to analyze:
"${text}"`;

    await streamAI({
      mode: "sentiment",
      messages: [{ role: "user", content: prompt }],
      onDelta: (chunk) => { result += chunk; setAnalysis(result); },
      onDone: async () => {
        setLoading(false);
        const { error } = await supabase.from("generations").insert({ type: "sentiment", input_text: text, output_text: result });
        if (!error) fetchHistory();
      },
      onError: (err) => { setLoading(false); toast.error(err); },
    });
  };

  const sentimentData = analysis && !loading ? parseSentimentData(analysis) : null;
  const radarData = sentimentData?.emotions.map(e => ({ emotion: e.name, score: e.score, fullMark: 10 })) || [];

  // Highlight source text with detected phrases
  const getHighlightedText = () => {
    if (!sentimentData || sentimentData.highlights.length === 0) return null;
    let highlighted = text;
    const parts: { text: string; type: "positive" | "negative" | "none" }[] = [];

    // Build a simple highlighted version
    let remaining = text;
    sentimentData.highlights.forEach(h => {
      const idx = remaining.toLowerCase().indexOf(h.text.toLowerCase());
      if (idx !== -1) {
        if (idx > 0) parts.push({ text: remaining.slice(0, idx), type: "none" });
        parts.push({ text: remaining.slice(idx, idx + h.text.length), type: h.sentiment === "positive" ? "positive" : "negative" });
        remaining = remaining.slice(idx + h.text.length);
      }
    });
    if (remaining) parts.push({ text: remaining, type: "none" });
    if (parts.length === 0) return null;

    return (
      <div className="text-sm leading-[1.8] text-foreground/80">
        {parts.map((p, i) => (
          <span
            key={i}
            className={
              p.type === "positive" ? "bg-emerald-500/15 text-emerald-300 px-0.5 rounded" :
              p.type === "negative" ? "bg-red-500/15 text-red-300 px-0.5 rounded" : ""
            }
          >
            {p.text}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/#projects" className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/[0.08] flex items-center justify-center">
                <BarChart3 className="text-primary" size={16} />
              </div>
              <div>
                <h1 className="text-sm font-medium">Sentiment Engine</h1>
                <p className="text-[11px] text-muted-foreground">Emotion · Tone · Intent Detection</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sentimentData && (
              <button
                onClick={() => exportReport(text, sentimentData, analysis)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <Download size={12} />
                Export
              </button>
            )}
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border bg-card/30 flex-col hidden lg:flex">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <History size={13} className="text-primary" />
            <span className="text-xs font-medium">History</span>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {history.length === 0 ? (
              <div className="text-[11px] text-muted-foreground text-center p-4">No analyses yet</div>
            ) : (
              history.map((item) => (
                <button key={item.id} onClick={() => { setText(item.input_text); setAnalysis(item.output_text); }}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-secondary transition-colors group">
                  <div className="text-[11px] text-foreground/80 line-clamp-2 leading-relaxed group-hover:text-foreground">{item.input_text.slice(0, 80)}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(item.created_at).toLocaleDateString()}</div>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          {/* Input Panel */}
          <div className="lg:w-[380px] shrink-0 border-r border-border flex flex-col">
            <div className="px-4 py-2 border-b border-border bg-card/30">
              <span className="text-xs text-muted-foreground">Input Text</span>
            </div>
            <div className="flex gap-1.5 px-4 py-2.5 border-b border-border">
              {samples.map((s) => (
                <button key={s.label} onClick={() => setText(s.text)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${text === s.text ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/20"}`}>
                  {s.label}
                </button>
              ))}
            </div>
            <textarea
              value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Paste text to analyze..."
              className="flex-1 p-4 bg-transparent text-sm resize-none focus:outline-none text-foreground placeholder:text-muted-foreground leading-[1.8]"
              spellCheck={false}
            />
          </div>

          {/* Results Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card/30">
              <span className="text-xs text-muted-foreground">{loading ? "Analyzing..." : analysis ? "Analysis Complete" : "Results"}</span>
              {analysis && (
                <button onClick={() => { navigator.clipboard.writeText(analysis); setCopied(true); toast.success("Copied"); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            <div ref={outputRef} className="flex-1 overflow-auto">
              {analysis ? (
                <div className="p-5 space-y-5">
                  {/* ── Visual Dashboard ── */}
                  {sentimentData && (
                    <>
                      {/* Row 1: Gauge + Overall Card */}
                      <div className="grid sm:grid-cols-3 gap-3">
                        {/* Gauge */}
                        {sentimentData.overallScore !== null && (
                          <div className="flex items-center justify-center p-4 rounded-lg border border-border bg-card">
                            <SentimentGauge score={sentimentData.overallScore} />
                          </div>
                        )}

                        {/* Overall Sentiment */}
                        <div className={`p-4 rounded-lg border border-border ${overallConfig[sentimentData.overall].bg}`}>
                          <div className="text-[11px] text-muted-foreground mb-2">Overall</div>
                          <div className="flex items-center gap-2">
                            {(() => { const I = overallConfig[sentimentData.overall].icon; return <I size={18} className={overallConfig[sentimentData.overall].text} />; })()}
                            <span className={`text-base font-medium ${overallConfig[sentimentData.overall].text}`}>{overallConfig[sentimentData.overall].label}</span>
                          </div>
                          {sentimentData.confidence !== null && <div className="text-[11px] text-muted-foreground mt-2">Confidence: {sentimentData.confidence}/10</div>}
                        </div>

                        {/* Highlighted phrases */}
                        {sentimentData.highlights.length > 0 && (
                          <div className="p-4 rounded-lg border border-border bg-card">
                            <div className="text-[11px] text-muted-foreground mb-2">Key Phrases</div>
                            <div className="flex flex-wrap gap-1.5">
                              {sentimentData.highlights.slice(0, 6).map((h, i) => (
                                <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${h.sentiment === "positive" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                                  {h.text.slice(0, 30)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Row 2: Radar Chart + Emotion Bars */}
                      {sentimentData.emotions.length > 0 && (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {/* Radar Chart */}
                          <div className="p-4 rounded-lg border border-border bg-card">
                            <div className="text-[11px] text-muted-foreground mb-2">Emotion Radar</div>
                            <ResponsiveContainer width="100%" height={200}>
                              <RadarChart data={radarData} margin={{ top: 5, right: 25, bottom: 5, left: 25 }}>
                                <PolarGrid stroke="hsl(var(--border))" />
                                <PolarAngleAxis
                                  dataKey="emotion"
                                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                                />
                                <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                                <Radar
                                  dataKey="score"
                                  stroke="hsl(var(--primary))"
                                  fill="hsl(var(--primary))"
                                  fillOpacity={0.15}
                                  strokeWidth={2}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Emotion Bars */}
                          <div className="p-4 rounded-lg border border-border bg-card">
                            <div className="text-[11px] text-muted-foreground mb-3">Emotion Breakdown</div>
                            <div className="space-y-2.5">
                              {sentimentData.emotions.map((e) => (
                                <EmotionBar key={e.name} name={e.name} score={e.score} color={e.color} />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Row 3: Highlighted source text */}
                      {getHighlightedText() && (
                        <div className="p-4 rounded-lg border border-border bg-card">
                          <div className="text-[11px] text-muted-foreground mb-2">Highlighted Source Text</div>
                          <div className="flex gap-3 mb-2">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500/50" /> Positive
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-500/50" /> Negative
                            </span>
                          </div>
                          {getHighlightedText()}
                        </div>
                      )}
                    </>
                  )}

                  {/* Full AI analysis */}
                  <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                      h2: ({ children }) => <h3 className="text-sm font-medium text-foreground mt-5 mb-2">{children}</h3>,
                      strong: ({ children }) => <strong className="text-foreground font-medium">{children}</strong>,
                      li: ({ children }) => <li className="text-foreground/80 leading-relaxed">{children}</li>,
                      p: ({ children }) => <p className="text-foreground/85 leading-[1.7] mb-3">{children}</p>,
                    }}>{analysis}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="text-xs">Running deep sentiment analysis...</span>
                    </div>
                  ) : (
                    <div className="text-center px-8">
                      <BarChart3 size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">Paste text and click "Analyze"</p>
                      <p className="text-xs text-muted-foreground/60">Get emotions radar, sentiment gauge, and highlighted phrases</p>
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

export default SentimentDemo;
