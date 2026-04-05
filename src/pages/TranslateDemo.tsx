import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Languages, Loader2, Sparkles, Copy, Check, History, ArrowRightLeft, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { streamAI } from "@/lib/ai-stream";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "am", label: "Amharic", flag: "🇪🇹" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
];

const TranslateDemo = () => {
  const [sourceText, setSourceText] = useState("The future of software engineering lies in building tools that amplify human creativity rather than replace it.");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("am");
  const [translation, setTranslation] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<"source" | "target" | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("type", "translate")
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setTranslation("");
    setPronunciation("");
    setLoading(true);
    let result = "";

    const targetName = languages.find(l => l.code === targetLang)?.label || targetLang;
    const sourceInfo = sourceLang === "auto" ? "Auto-detect the source language" : `Source language: ${languages.find(l => l.code === sourceLang)?.label}`;

    const prompt = `Translate the following text to ${targetName}.
${sourceInfo}.

IMPORTANT: Structure your response exactly like this:
1. First line: Just the translation, nothing else
2. Then a blank line
3. Then "Pronunciation:" followed by a phonetic/romanized guide (if the target language uses non-Latin script)
4. Then "Notes:" followed by any cultural context or nuance notes

Text to translate:
"${sourceText}"`;

    await streamAI({
      mode: "translate",
      messages: [{ role: "user", content: prompt }],
      onDelta: (chunk) => {
        result += chunk;
        // Try to separate translation from pronunciation
        const parts = result.split(/\n\s*pronunciation\s*[:：]/i);
        setTranslation(parts[0].trim());
        if (parts[1]) setPronunciation(parts[1].trim());
      },
      onDone: async () => {
        setLoading(false);
        const { error } = await supabase.from("generations").insert({
          type: "translate",
          input_text: `[${sourceLang}→${targetLang}] ${sourceText}`,
          output_text: result,
        });
        if (!error) fetchHistory();
      },
      onError: (err) => { setLoading(false); toast.error(err); },
    });
  };

  const swapLanguages = () => {
    if (sourceLang === "auto" || !translation) return;
    const newSource = targetLang;
    const newTarget = sourceLang;
    setSourceLang(newSource);
    setTargetLang(newTarget);
    setSourceText(translation.split("\n")[0]); // First line is the pure translation
    setTranslation("");
    setPronunciation("");
  };

  const copyText = (text: string, type: "source" | "target") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const charCount = sourceText.length;
  const targetLangObj = languages.find(l => l.code === targetLang);

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
                <Languages className="text-primary" size={16} />
              </div>
              <div>
                <h1 className="text-sm font-medium">Translation Hub</h1>
                <p className="text-[11px] text-muted-foreground">Context-aware multilingual translation</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleTranslate}
            disabled={loading || !sourceText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? "Translating..." : "Translate"}
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
              <div className="text-[11px] text-muted-foreground text-center p-4">No translations yet</div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setTranslation(item.output_text);
                    const match = item.input_text.match(/\[(\w+)→(\w+)\]\s*(.*)/s);
                    if (match) {
                      setSourceLang(match[1]);
                      setTargetLang(match[2]);
                      setSourceText(match[3]);
                    }
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-secondary transition-colors group"
                >
                  <div className="text-[11px] text-foreground/80 line-clamp-2 leading-relaxed group-hover:text-foreground">
                    {item.input_text.replace(/\[.*?\]\s*/, "").slice(0, 60)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Translation Panels */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Language selector bar */}
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-center gap-4 bg-card/30">
            {/* Source language */}
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-transparent text-xs font-medium text-foreground border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
            >
              <option value="auto">🔍 Auto-detect</option>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>

            {/* Swap button */}
            <button
              onClick={swapLanguages}
              disabled={sourceLang === "auto" || !translation}
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-all disabled:opacity-30"
            >
              <ArrowRightLeft size={14} />
            </button>

            {/* Target language */}
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-transparent text-xs font-medium text-foreground border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>

          {/* Side-by-side panels */}
          <div className="flex-1 flex flex-col lg:flex-row min-w-0">
            {/* Source */}
            <div className="flex-1 flex flex-col border-r border-border">
              <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card/20">
                <span className="text-[11px] text-muted-foreground">
                  {sourceLang === "auto" ? "Source" : languages.find(l => l.code === sourceLang)?.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{charCount} chars</span>
                  <button
                    onClick={() => copyText(sourceText, "source")}
                    className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === "source" ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                className="flex-1 p-5 bg-transparent text-sm resize-none focus:outline-none text-foreground placeholder:text-muted-foreground leading-[1.8]"
                spellCheck={false}
              />
            </div>

            {/* Target */}
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card/20">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  {targetLangObj?.flag} {targetLangObj?.label}
                </span>
                {translation && (
                  <button
                    onClick={() => copyText(translation, "target")}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  >
                    {copied === "target" ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
                    {copied === "target" ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <div ref={outputRef} className="flex-1 overflow-auto">
                {translation ? (
                  <div className="p-5 space-y-4">
                    {/* Translation text */}
                    <div className="text-sm text-foreground leading-[1.8] whitespace-pre-wrap">
                      {translation}
                    </div>

                    {/* Pronunciation guide */}
                    {pronunciation && (
                      <div className="p-3 rounded-lg border border-border bg-card">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Volume2 size={12} className="text-primary" />
                          <span className="text-[11px] font-medium text-muted-foreground">Pronunciation</span>
                        </div>
                        <p className="text-xs text-foreground/70 leading-relaxed italic whitespace-pre-wrap">
                          {pronunciation.split(/\n\s*notes?\s*[:：]/i)[0]}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {pronunciation && /notes?\s*[:：]/i.test(pronunciation) && (
                      <div className="p-3 rounded-lg border border-border bg-secondary/30">
                        <span className="text-[11px] font-medium text-muted-foreground block mb-1">Notes</span>
                        <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">
                          {pronunciation.split(/\n\s*notes?\s*[:：]/i)[1]?.trim()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    {loading ? (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-xs">Translating...</span>
                      </div>
                    ) : (
                      <div className="text-center px-8">
                        <Languages size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-1">Translation will appear here</p>
                        <p className="text-xs text-muted-foreground/60">With pronunciation guides for non-Latin scripts</p>
                      </div>
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
