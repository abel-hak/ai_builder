import { useState } from "react";
import { ArrowLeft, Languages, Loader2, Sparkles, Copy, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { streamAI } from "@/lib/ai-stream";
import { toast } from "sonner";

const languages = ["Spanish", "French", "German", "Japanese", "Chinese", "Arabic", "Portuguese", "Korean", "Hindi", "Russian"];

const TranslateDemo = () => {
  const [text, setText] = useState("The art of programming is the art of organizing complexity, of mastering multitude and avoiding its bastard chaos as effectively as possible.");
  const [targetLang, setTargetLang] = useState("Spanish");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
      onDone: () => setLoading(false),
      onError: (err) => toast.error(err),
    });
  };

  const copyTranslation = () => {
    navigator.clipboard.writeText(translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Language selector */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium">English</span>
          <ArrowRight size={16} className="text-primary" />
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setTargetLang(lang)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  targetLang === lang
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-14rem)]">
          {/* Input */}
          <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">English</span>
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
              className="flex-1 p-5 bg-transparent text-sm resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Output */}
          <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{targetLang}</span>
              {translation && (
                <button onClick={copyTranslation} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                  {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                </button>
              )}
            </div>
            <div className="flex-1 p-5 overflow-auto">
              {translation ? (
                <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {translation}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin" size={20} />
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
      </main>
    </div>
  );
};

export default TranslateDemo;
