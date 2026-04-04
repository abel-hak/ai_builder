import { useState, useEffect } from "react";
import { ArrowLeft, Languages, Loader2, Sparkles, Copy, Check, ArrowRight, History } from "lucide-react";
import { Link } from "react-router-dom";
import { streamAI } from "@/lib/ai-stream";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/lib/supabase";

const languages = ["Spanish", "French", "German", "Japanese", "Chinese", "Arabic", "Portuguese", "Korean", "Hindi", "Russian"];

const TranslateDemo = () => {
  const [text, setText] = useState("The art of programming is the art of organizing complexity, of mastering multitude and avoiding its bastard chaos as effectively as possible.");
  const [targetLang, setTargetLang] = useState("Spanish");
  const [translation, setTranslation] = useState("");
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
      .eq("type", "translate")
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setTranslation("");
    setLoading(true);
    let result = "";

    await streamAI({
      mode: "translate",
      messages: [{ role: "user", content: `Translate the following text to ${targetLang}. Preserve nuance and cultural context:\n\n"${text}"` }],
      onDelta: (chunk) => {
        result += chunk;
        setTranslation(result);
      },
      onDone: async () => {
        setLoading(false);
        const { error } = await supabase.from("generations").insert({
          type: "translate",
          input_text: text,
          output_text: `**Target: ${targetLang}**\n\n${result}`,
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

  const copyTranslation = () => {
    navigator.clipboard.writeText(translation);
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
              <Languages className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg">AI Translation Hub</h1>
              <p className="text-xs text-muted-foreground">Context-Aware · Cultural Nuance · 10+ Languages</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full flex flex-col">
        {/* Language selector */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-sm text-foreground font-medium px-4 py-2 bg-secondary/50 rounded-xl border border-border">English</span>
          <ArrowRight size={18} className="text-primary" />
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setTargetLang(lang)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  targetLang === lang
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)] flex-1">
          {/* History Sidebar */}
          <div className="col-span-1 flex flex-col rounded-2xl border border-border bg-card overflow-hidden h-full">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <History size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">History</span>
            </div>
            <div className="flex-1 p-3 overflow-auto flex flex-col gap-2">
              {history.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center p-4">No past translations yet.</div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setText(item.input_text);
                      setTranslation(item.output_text);
                    }}
                    className="text-left p-3 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-secondary/20 transition-all text-xs group flex flex-col"
                  >
                    <div className="font-medium text-foreground mb-2 line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
                      {item.input_text}
                    </div>
                    <div className="mt-auto flex justify-between items-center text-muted-foreground opacity-60">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
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
                <span className="text-sm font-medium text-muted-foreground">Original Text</span>
                <button
                  onClick={handleTranslate}
                  disabled={loading || !text.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {loading ? "Translating..." : "Translate"}
                </button>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to translate..."
                className="flex-1 p-6 bg-transparent text-sm resize-none focus:outline-none text-foreground placeholder:text-muted-foreground leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Output */}
            <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden h-full">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{targetLang}</span>
                {translation && (
                  <button onClick={copyTranslation} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                    {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
              <div className="flex-1 p-6 overflow-auto">
                {translation ? (
                  <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {translation}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={20} />
                        <span>Translating to {targetLang}...</span>
                      </div>
                    ) : (
                      `Click 'Translate' to convert to ${targetLang}`
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

export default TranslateDemo;
