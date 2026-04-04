import { useState, useEffect } from "react";
import { ArrowLeft, PenTool, Loader2, Sparkles, Copy, Check, History } from "lucide-react";
import { Link } from "react-router-dom";
import { streamAI } from "@/lib/ai-stream";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/lib/supabase";

const presets = [
  { label: "Blog Post", prompt: "Write a compelling blog post about" },
  { label: "Landing Page", prompt: "Write persuasive landing page copy for" },
  { label: "Email Campaign", prompt: "Write a high-converting email campaign for" },
  { label: "Social Media", prompt: "Write engaging social media posts about" },
];

const tones = ["Professional", "Casual", "Bold", "Empathetic", "Witty"];

const ContentStudioDemo = () => {
  const [topic, setTopic] = useState("the future of AI in healthcare");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [selectedTone, setSelectedTone] = useState(0);
  const [output, setOutput] = useState("");
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
      .eq("type", "content-studio")
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setOutput("");
    setLoading(true);
    let result = "";

    const fullPrompt = `${presets[selectedPreset].prompt} "${topic}". Use a ${tones[selectedTone].toLowerCase()} tone. Make it publication-ready.`;

    await streamAI({
      mode: "content-studio",
      messages: [{ role: "user", content: fullPrompt }],
      onDelta: (chunk) => {
        result += chunk;
        setOutput(result);
      },
      onDone: async () => {
        setLoading(false);
        const { error } = await supabase.from("generations").insert({
          type: "content-studio",
          input_text: fullPrompt,
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

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
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
              <PenTool className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg">AI Content Studio</h1>
              <p className="text-xs text-muted-foreground">Blog · Email · Landing Page · Social Media</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        <div className="grid lg:grid-cols-6 gap-6 h-[calc(100vh-10rem)]">
          
          {/* History Sidebar */}
          <div className="lg:col-span-1 flex flex-col rounded-2xl border border-border bg-card overflow-hidden h-full">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <History size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">History</span>
            </div>
            <div className="flex-1 p-3 overflow-auto flex flex-col gap-2">
              {history.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center p-4">No past content yet.</div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTopic("Loaded from history");
                      setOutput(item.output_text);
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

          {/* Controls */}
          <div className="lg:col-span-2 space-y-6 h-full flex flex-col">
            <div className="rounded-2xl border border-border bg-card p-6 flex-1 flex flex-col">
              <div className="space-y-5 flex-1">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">Content Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((p, i) => (
                      <button
                        key={p.label}
                        onClick={() => setSelectedPreset(i)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          selectedPreset === i
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {tones.map((t, i) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTone(i)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selectedTone === i
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Topic</label>
                  <textarea
                    value={topic === "Loaded from history" ? "" : topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="What should the content be about?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading ? "Generating..." : "Generate Content"}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-3 rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-full">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Generated Content</span>
              {output && (
                <button onClick={copyOutput} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                  {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                </button>
              )}
            </div>
            <div className="flex-1 p-5 overflow-auto">
              {output ? (
                <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {output}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin text-primary" size={20} />
                      <span>Crafting your content...</span>
                    </div>
                  ) : (
                    "Configure your content and click Generate"
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

export default ContentStudioDemo;
