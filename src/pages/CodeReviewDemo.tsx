import { useState } from "react";
import { ArrowLeft, Code2, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { streamAI } from "@/lib/ai-stream";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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

const CodeReviewDemo = () => {
  const [code, setCode] = useState(sampleCode);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReview = async () => {
    if (!code.trim()) return;
    setReview("");
    setLoading(true);
    let result = "";

    await streamAI({
      mode: "code-review",
      messages: [{ role: "user", content: `Review this code:\n\`\`\`\n${code}\n\`\`\`` }],
      onDelta: (chunk) => {
        result += chunk;
        setReview(result);
      },
      onDone: () => setLoading(false),
      onError: (err) => toast.error(err),
    });
  };

  const copyReview = () => {
    navigator.clipboard.writeText(review);
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
              <Code2 className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg">AI Code Reviewer</h1>
              <p className="text-xs text-muted-foreground">Security · Performance · Architecture Analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-10rem)]">
          {/* Code Input */}
          <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Paste your code</span>
              <button
                onClick={handleReview}
                disabled={loading || !code.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {loading ? "Analyzing..." : "Review Code"}
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="flex-1 p-5 bg-transparent text-sm font-mono resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
            />
          </div>

          {/* Review Output */}
          <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Review Results</span>
              {review && (
                <button onClick={copyReview} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                  {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                </button>
              )}
            </div>
            <div className="flex-1 p-5 overflow-auto">
              {review ? (
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
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-secondary px-1.5 py-0.5 rounded-md text-primary" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {review}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Analyzing code for issues...</span>
                    </div>
                  ) : (
                    "Click 'Review Code' to get an expert analysis"
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
