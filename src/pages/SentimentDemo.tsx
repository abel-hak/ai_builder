import { useState, useEffect, useRef } from "react";
import { ArrowLeft, BarChart3, Loader2, Sparkles, Copy, Check, History, Smile, Frown, Meh, Zap, Heart, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { streamAI } from "@/lib/ai-stream";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/lib/supabase";

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

// Parse structured sentiment data from AI response
const parseSentimentData = (text: string) => {
  const emotions: { name: string; score: number; icon: any; color: string }[] = [];
  const emotionMap: Record<string, { icon: any; color: string }> = {
    joy: { icon: Smile, color: "#10b981" },
    happiness: { icon: Smile, color: "#10b981" },
    positive: { icon: Smile, color: "#10b981" },
    anger: { icon: Zap, color: "#ef4444" },
    frustration: { icon: AlertTriangle, color: "#f97316" },
    sadness: { icon: Frown, color: "#6366f1" },
    fear: { icon: AlertTriangle, color: "#8b5cf6" },
    anxiety: { icon: AlertTriangle, color: "#8b5cf6" },
    love: { icon: Heart, color: "#ec4899" },
    surprise: { icon: Zap, color: "#eab308" },
    neutral: { icon: Meh, color: "#6b7280" },
    trust: { icon: Heart, color: "#14b8a6" },
    disgust: { icon: Frown, color: "#78716c" },
    anticipation: { icon: Zap, color: "#f59e0b" },
  };

  // Try to extract emotion scores like "Joy: 8/10" or "Joy: 80%"
  const patterns = [
    /(?:^|\n)\s*[-•*]?\s*\**([a-z]+)\**\s*[:：]\s*(\d+)\s*(?:\/\s*10|%)/gim,
    /(?:^|\n)\s*[-•*]?\s*\**([a-z]+)\**\s*[:：]\s*\**(\d+)\**/gim,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].toLowerCase().trim();
      let score = parseInt(match[2], 10);
      if (score > 10) score = Math.round(score / 10); // Convert percentage to /10
      if (score >= 0 && score <= 10 && emotionMap[name]) {
        emotions.push({ name: name.charAt(0).toUpperCase() + name.slice(1), score, ...emotionMap[name] });
      }
    }
    if (emotions.length > 0) break;
  }

  // Extract overall sentiment
  let overall: "positive" | "negative" | "mixed" | "neutral" = "neutral";
  if (/overall.*positive/i.test(text) || /sentiment.*positive/i.test(text)) overall = "positive";
  else if (/overall.*negative/i.test(text) || /sentiment.*negative/i.test(text)) overall = "negative";
  else if (/overall.*mixed/i.test(text) || /sentiment.*mixed/i.test(text)) overall = "mixed";

  // Extract confidence/score
  let confidence: number | null = null;
  const confMatch = text.match(/(?:confidence|overall.*score|sentiment.*score)\s*[:：]\s*(\d+)/i);
  if (confMatch) confidence = parseInt(confMatch[1], 10);

  return { emotions: emotions.slice(0, 6), overall, confidence };
};

const overallConfig = {
  positive: { label: "Positive", color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400", icon: Smile },
  negative: { label: "Negative", color: "#ef4444", bg: "bg-red-500/10", text: "text-red-400", icon: Frown },
  mixed: { label: "Mixed", color: "#f59e0b", bg: "bg-yellow-500/10", text: "text-yellow-400", icon: Meh },
  neutral: { label: "Neutral", color: "#6b7280", bg: "bg-gray-500/10", text: "text-gray-400", icon: Meh },
};

// Horizontal bar for emotion scores
const EmotionBar = ({ name, score, color, icon: Icon }: { name: string; score: number; color: string; icon: any }) => (
  <div className="flex items-center gap-3">
    <div className="w-20 flex items-center gap-1.5 shrink-0">
      <Icon size={12} style={{ color }} />
      <span className="text-xs text-foreground/80">{name}</span>
    </div>
    <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${score * 10}%`, backgroundColor: color }}
      />
    </div>
    <span className="text-xs text-muted-foreground w-6 text-right">{score}</span>
  </div>
);

const SentimentDemo = () => {
  const [text, setText] = useState(samples[0].text);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    if (loading && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [analysis, loading]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("type", "sentiment")
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setAnalysis("");
    setLoading(true);
    let result = "";

    const prompt = `Analyze the sentiment and emotions in this text. 

IMPORTANT: Include a structured emotion breakdown with scores out of 10 for each detected emotion using this exact format:
- **Joy**: 7/10
- **Frustration**: 4/10
(include 3-6 emotions)

Also include:
- Overall sentiment (Positive, Negative, Mixed, or Neutral)
- Confidence: X/10
- Key phrases analysis
- Tone description

Text to analyze:
"${text}"`;

    await streamAI({
      mode: "sentiment",
      messages: [{ role: "user", content: prompt }],
      onDelta: (chunk) => { result += chunk; setAnalysis(result); },
      onDone: async () => {
        setLoading(false);
        const { error } = await supabase.from("generations").insert({
          type: "sentiment",
          input_text: text,
          output_text: result,
        });
        if (!error) fetchHistory();
      },
      onError: (err) => { setLoading(false); toast.error(err); },
    });
  };

  const copyAnalysis = () => {
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const sentimentData = analysis && !loading ? parseSentimentData(analysis) : null;

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
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar — History */}
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
                <button
                  key={item.id}
                  onClick={() => { setText(item.input_text); setAnalysis(item.output_text); }}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-secondary transition-colors group"
                >
                  <div className="text-[11px] text-foreground/80 line-clamp-2 leading-relaxed group-hover:text-foreground">
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
          {/* Input Panel */}
          <div className="lg:w-[400px] shrink-0 border-r border-border flex flex-col">
            <div className="px-4 py-2 border-b border-border bg-card/30">
              <span className="text-xs text-muted-foreground">Input Text</span>
            </div>
            {/* Sample presets */}
            <div className="flex gap-1.5 px-4 py-3 border-b border-border">
              {samples.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setText(s.text)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                    text === s.text
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/20"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text to analyze..."
              className="flex-1 p-4 bg-transparent text-sm resize-none focus:outline-none text-foreground placeholder:text-muted-foreground leading-[1.8]"
              spellCheck={false}
            />
          </div>

          {/* Results Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card/30">
              <span className="text-xs text-muted-foreground">
                {loading ? "Analyzing..." : analysis ? "Analysis Complete" : "Results"}
              </span>
              {analysis && (
                <button
                  onClick={copyAnalysis}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            <div ref={outputRef} className="flex-1 overflow-auto">
              {analysis ? (
                <div className="p-5 space-y-5">
                  {/* Visual Dashboard — only shows after streaming completes */}
                  {sentimentData && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {/* Overall Sentiment Card */}
                      {sentimentData.overall && (
                        <div className={`p-4 rounded-lg border border-border ${overallConfig[sentimentData.overall].bg}`}>
                          <div className="text-xs text-muted-foreground mb-2">Overall Sentiment</div>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const OIcon = overallConfig[sentimentData.overall].icon;
                              return <OIcon size={20} className={overallConfig[sentimentData.overall].text} />;
                            })()}
                            <span className={`text-lg font-medium ${overallConfig[sentimentData.overall].text}`}>
                              {overallConfig[sentimentData.overall].label}
                            </span>
                          </div>
                          {sentimentData.confidence !== null && (
                            <div className="text-xs text-muted-foreground mt-2">
                              Confidence: {sentimentData.confidence}/10
                            </div>
                          )}
                        </div>
                      )}

                      {/* Emotion Bars */}
                      {sentimentData.emotions.length > 0 && (
                        <div className="p-4 rounded-lg border border-border bg-card">
                          <div className="text-xs text-muted-foreground mb-3">Emotion Breakdown</div>
                          <div className="space-y-2.5">
                            {sentimentData.emotions.map((e) => (
                              <EmotionBar key={e.name} {...e} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Full Markdown Analysis */}
                  <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h2 className="text-base font-medium text-foreground mt-6 mb-2 first:mt-0">{children}</h2>,
                        h2: ({ children }) => <h3 className="text-sm font-medium text-foreground mt-5 mb-2">{children}</h3>,
                        strong: ({ children }) => <strong className="text-foreground font-medium">{children}</strong>,
                        li: ({ children }) => <li className="text-foreground/80 leading-relaxed">{children}</li>,
                        p: ({ children }) => <p className="text-foreground/85 leading-[1.7] mb-3">{children}</p>,
                      }}
                    >
                      {analysis}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="text-xs">Running sentiment analysis...</span>
                    </div>
                  ) : (
                    <div className="text-center px-8">
                      <BarChart3 size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">Paste text and click "Analyze"</p>
                      <p className="text-xs text-muted-foreground/60">Detect emotions, tone, and intent patterns</p>
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
