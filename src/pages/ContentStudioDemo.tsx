import { useState, useEffect, useRef } from "react";
import { ArrowLeft, PenTool, Loader2, Sparkles, Copy, Check, History, FileText, Mail, Linkedin, Layout, Type } from "lucide-react";
import { Link } from "react-router-dom";
import { streamAI } from "@/lib/ai-stream";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/lib/supabase";

const templates = [
  { id: "blog", label: "Blog Post", icon: FileText, prompt: "Write a compelling, well-structured blog post about" },
  { id: "linkedin", label: "LinkedIn Post", icon: Linkedin, prompt: "Write a high-engagement LinkedIn post about" },
  { id: "email", label: "Cold Email", icon: Mail, prompt: "Write a concise, high-converting cold email about" },
  { id: "landing", label: "Landing Page", icon: Layout, prompt: "Write persuasive hero copy and key sections for a landing page about" },
];

const toneStops = [
  { value: 0, label: "Casual", emoji: "😊" },
  { value: 1, label: "Friendly", emoji: "🤝" },
  { value: 2, label: "Professional", emoji: "💼" },
  { value: 3, label: "Formal", emoji: "🎩" },
  { value: 4, label: "Academic", emoji: "📚" },
];

const wordCounts = [
  { value: 100, label: "Short (~100)" },
  { value: 250, label: "Medium (~250)" },
  { value: 500, label: "Long (~500)" },
  { value: 800, label: "Extended (~800)" },
];

const ContentStudioDemo = () => {
  const [topic, setTopic] = useState("the future of AI in healthcare");
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [toneIndex, setToneIndex] = useState(2);
  const [targetWords, setTargetWords] = useState(250);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    if (loading && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, loading]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("type", "content-studio")
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const wordCount = output.split(/\s+/).filter(Boolean).length;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setOutput("");
    setLoading(true);
    let result = "";

    const tone = toneStops[toneIndex].label.toLowerCase();
    const template = templates[selectedTemplate];
    const fullPrompt = `${template.prompt} "${topic}". 
Tone: ${tone}. 
Target length: approximately ${targetWords} words. 
Format: Use markdown formatting. Make it publication-ready and compelling.`;

    await streamAI({
      mode: "content-studio",
      messages: [{ role: "user", content: fullPrompt }],
      onDelta: (chunk) => { result += chunk; setOutput(result); },
      onDone: async () => {
        setLoading(false);
        const { error } = await supabase.from("generations").insert({
          type: "content-studio",
          input_text: `[${template.label}] ${topic}`,
          output_text: result,
        });
        if (!error) fetchHistory();
      },
      onError: (err) => { setLoading(false); toast.error(err); },
    });
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
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
                <PenTool className="text-primary" size={16} />
              </div>
              <div>
                <h1 className="text-sm font-medium">AI Content Studio</h1>
                <p className="text-[11px] text-muted-foreground">Blog · LinkedIn · Email · Landing Page</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? "Writing..." : "Generate"}
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
              <div className="text-[11px] text-muted-foreground text-center p-4">No content yet</div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setOutput(item.output_text)}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-secondary transition-colors group"
                >
                  <div className="text-[11px] text-foreground/80 line-clamp-2 leading-relaxed group-hover:text-foreground">
                    {item.input_text}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Controls + Output */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          {/* Controls Panel */}
          <div className="lg:w-[340px] shrink-0 border-r border-border overflow-auto">
            <div className="p-5 space-y-6">
              {/* Template selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(i)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedTemplate === i
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
                      }`}
                    >
                      <t.icon size={13} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Topic</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What should the content be about?"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Tone Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tone</label>
                  <span className="text-xs text-primary font-medium">
                    {toneStops[toneIndex].emoji} {toneStops[toneIndex].label}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={4}
                    step={1}
                    value={toneIndex}
                    onChange={(e) => setToneIndex(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${toneIndex * 25}%, hsl(var(--border)) ${toneIndex * 25}%, hsl(var(--border)) 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1.5">
                    {toneStops.map((stop, i) => (
                      <span
                        key={stop.value}
                        className={`text-[10px] ${i === toneIndex ? "text-primary" : "text-muted-foreground/50"}`}
                      >
                        {stop.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Word Count Target */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Length</label>
                <div className="grid grid-cols-2 gap-2">
                  {wordCounts.map((wc) => (
                    <button
                      key={wc.value}
                      onClick={() => setTargetWords(wc.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        targetWords === wc.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/20"
                      }`}
                    >
                      {wc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button (mobile-friendly, also in header for desktop) */}
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {loading ? "Writing..." : "Generate Content"}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Output toolbar */}
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card/30">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {loading ? "Writing..." : output ? "Content Ready" : "Output"}
                </span>
                {output && (
                  <>
                    <span className="w-px h-3 bg-border" />
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Type size={10} />
                      {wordCount} words
                    </span>
                  </>
                )}
              </div>
              {output && (
                <button
                  onClick={copyOutput}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            {/* Output content */}
            <div ref={outputRef} className="flex-1 overflow-auto">
              {output ? (
                <div className="p-6 max-w-2xl">
                  <div className="prose prose-sm prose-invert max-w-none text-sm leading-[1.8] text-foreground/90">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-xl font-medium text-foreground mt-6 mb-3 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-medium text-foreground mt-5 mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-medium text-foreground mt-4 mb-2">{children}</h3>,
                        p: ({ children }) => <p className="text-foreground/85 leading-[1.8] mb-4">{children}</p>,
                        strong: ({ children }) => <strong className="text-foreground font-medium">{children}</strong>,
                        li: ({ children }) => <li className="text-foreground/80 leading-relaxed">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-primary/40 pl-4 italic text-foreground/70 my-4">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {output}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="text-xs">Crafting your content...</span>
                    </div>
                  ) : (
                    <div className="text-center px-8">
                      <PenTool size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">Configure and generate</p>
                      <p className="text-xs text-muted-foreground/60">Choose a template, set the tone, and hit Generate</p>
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

export default ContentStudioDemo;
