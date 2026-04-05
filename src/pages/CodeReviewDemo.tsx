import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Code2, Loader2, Sparkles, Copy, Check, History, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { streamAI } from "@/lib/ai-stream";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { supabase } from "@/lib/supabase";
import MonacoEditor from "@monaco-editor/react";

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

// Extract score from AI review text (looks for patterns like "Score: 3/10" or "Rating: 4/10")
const extractScore = (text: string): number | null => {
  const patterns = [
    /(?:score|rating|overall)\s*[:：]\s*(\d+)\s*(?:\/\s*10)?/i,
    /(\d+)\s*\/\s*10/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseInt(match[1], 10);
      if (score >= 1 && score <= 10) return score;
    }
  }
  return null;
};

const getScoreColor = (score: number) => {
  if (score <= 3) return { bg: "bg-red-500/15", text: "text-red-400", ring: "ring-red-500/30", fill: "#ef4444" };
  if (score <= 5) return { bg: "bg-orange-500/15", text: "text-orange-400", ring: "ring-orange-500/30", fill: "#f97316" };
  if (score <= 7) return { bg: "bg-yellow-500/15", text: "text-yellow-400", ring: "ring-yellow-500/30", fill: "#eab308" };
  return { bg: "bg-emerald-500/15", text: "text-emerald-400", ring: "ring-emerald-500/30", fill: "#10b981" };
};

const ScoreGauge = ({ score }: { score: number }) => {
  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 10) * circumference;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={colors.fill}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-semibold ${colors.text}`}>{score}</span>
        </div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">Code Quality</div>
        <div className={`text-sm font-medium ${colors.text}`}>
          {score <= 3 ? "Critical Issues" : score <= 5 ? "Needs Work" : score <= 7 ? "Acceptable" : "Clean Code"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{score}/10</div>
      </div>
    </div>
  );
};

const CodeReviewDemo = () => {
  const [code, setCode] = useState(sampleCode);
  const [language, setLanguage] = useState("javascript");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Auto-scroll results as they stream in
  useEffect(() => {
    if (loading && resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [review, loading]);

  // Extract score whenever review updates
  useEffect(() => {
    if (review && !loading) {
      setScore(extractScore(review));
    }
  }, [review, loading]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("type", "code-review")
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const handleReview = async () => {
    if (!code.trim()) return;
    setReview("");
    setScore(null);
    setLoading(true);
    let result = "";

    await streamAI({
      mode: "code-review",
      messages: [{ role: "user", content: `Review this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`` }],
      onDelta: (chunk) => {
        result += chunk;
        setReview(result);
      },
      onDone: async () => {
        setLoading(false);
        const { error } = await supabase.from("generations").insert({
          type: "code-review",
          input_text: code,
          output_text: result,
        });
        if (!error) fetchHistory();
      },
      onError: (err) => {
        setLoading(false);
        toast.error(err);
      },
    });
  };

  const copyReview = () => {
    navigator.clipboard.writeText(review);
    setCopied(true);
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
                <Code2 className="text-primary" size={16} />
              </div>
              <div>
                <h1 className="text-sm font-medium">AI Code Reviewer</h1>
                <p className="text-[11px] text-muted-foreground">Security · Performance · Architecture</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleReview}
            disabled={loading || !code.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? "Analyzing..." : "Review Code"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar — History */}
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
                  onClick={() => {
                    setCode(item.input_text);
                    setReview(item.output_text);
                    setScore(extractScore(item.output_text));
                  }}
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

        {/* Editor + Results */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          {/* Code Editor Panel */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-border">
            {/* Editor toolbar */}
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card/30">
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary"
                >
                  {LANGUAGES.find(l => l.value === language)?.label || language}
                  <ChevronDown size={12} />
                </button>
                {showLangDropdown && (
                  <div className="absolute top-full left-0 mt-1 py-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[140px]">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => { setLanguage(lang.value); setShowLangDropdown(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors ${
                          language === lang.value ? "text-primary" : "text-foreground/80"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {code.split("\n").length} lines
              </div>
            </div>

            {/* Monaco Editor */}
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
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  padding: { top: 16, bottom: 16 },
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  overviewRulerLanes: 0,
                  scrollbar: {
                    verticalScrollbarSize: 6,
                    horizontalScrollbarSize: 6,
                  },
                  wordWrap: "on",
                  bracketPairColorization: { enabled: true },
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Results toolbar */}
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card/30">
              <span className="text-xs text-muted-foreground">
                {loading ? "Analyzing..." : review ? "Review Complete" : "Results"}
              </span>
              {review && (
                <button onClick={copyReview} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground">
                  {copied ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
                </button>
              )}
            </div>

            {/* Results content */}
            <div ref={resultRef} className="flex-1 overflow-auto">
              {review ? (
                <div className="p-5 space-y-4">
                  {/* Score Gauge */}
                  {score !== null && !loading && <ScoreGauge score={score} />}

                  {/* Markdown Review */}
                  <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus as any}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ borderRadius: "0.5rem", fontSize: "12px" }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-secondary px-1.5 py-0.5 rounded text-primary text-xs" {...props}>
                              {children}
                            </code>
                          );
                        },
                        h1: ({ children }) => <h2 className="text-base font-medium text-foreground mt-6 mb-2 first:mt-0">{children}</h2>,
                        h2: ({ children }) => <h3 className="text-sm font-medium text-foreground mt-5 mb-2">{children}</h3>,
                        strong: ({ children }) => <strong className="text-foreground font-medium">{children}</strong>,
                        li: ({ children }) => <li className="text-foreground/80 leading-relaxed">{children}</li>,
                      }}
                    >
                      {review}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="text-xs">Analyzing code for issues...</span>
                    </div>
                  ) : (
                    <div className="text-center px-8">
                      <Code2 size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">Paste code and click "Review Code"</p>
                      <p className="text-xs text-muted-foreground/60">Get security, performance, and architecture analysis</p>
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
