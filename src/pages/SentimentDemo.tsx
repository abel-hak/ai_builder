import { useState, useEffect } from "react";
import { ArrowLeft, BarChart3, Loader2, Sparkles, Copy, Check, History } from "lucide-react";
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

const SentimentDemo = () => {
  const [text, setText] = useState(samples[0].text);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

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

    await streamAI({
      mode: "sentiment",
      messages: [{ role: "user", content: `Analyze the sentiment of this text:\n\n"${text}"` }],
      onDelta: (chunk) => {
        result += chunk;
        setAnalysis(result);
      },
      onDone: async () => {
        setLoading(false);
        const { error } = await supabase.from("generations").insert({
          type: "sentiment",
          input_text: text,
          output_text: result,
        });
        if (!error) {
          fetchHistory();
        } else {
          console.error("Failed to save history:", error);
        }
      },
      onError: (err) => toast.error(err),
    });
  };

  const copyAnalysis = () => {
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/#projects" className="p-2 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg">Sentiment Analysis Engine</h1>
              <p className="text-xs text-muted-foreground">Emotion · Tone · Intent Detection</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {/* Sample presets */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {samples.map((s) => (
            <button
              key={s.label}
              onClick={() => setText(s.text)}
              className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                text === s.text
                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)]">
          {/* History Sidebar */}
          <div className="col-span-1 flex flex-col rounded-2xl border border-border bg-card overflow-hidden h-full">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <History size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">History</span>
            </div>
            <div className="flex-1 p-3 overflow-auto flex flex-col gap-2">
              {history.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center p-4">No past analyses yet.</div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setText(item.input_text);
                      setAnalysis(item.output_text);
                    }}
                    className="text-left p-3 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-secondary/20 transition-all text-xs group"
                  >
                    <div className="font-medium text-foreground mb-1 line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
                      {item.input_text}
                    </div>
                    <div className="text-muted-foreground opacity-60">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="col-span-3 grid lg:grid-cols-2 gap-6 h-full">
            {/* Input */}
            <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden h-full">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Input Text</span>
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !text.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {loading ? "Analyzing..." : "Analyze"}
                </button>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste text to analyze..."
                className="flex-1 p-6 bg-transparent text-sm resize-none focus:outline-none text-foreground placeholder:text-muted-foreground leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Output */}
            <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden h-full">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Sentiment Analysis</span>
                {analysis && (
                  <button onClick={copyAnalysis} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                    {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
              <div className="flex-1 p-6 overflow-auto">
                {analysis ? (
                  <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {analysis}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={20} />
                        <span>Running sentiment analysis...</span>
                      </div>
                    ) : (
                      "Click 'Analyze' to detect sentiment and emotions"
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SentimentDemo;
