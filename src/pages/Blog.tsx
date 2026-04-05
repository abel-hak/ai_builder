import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "building-sms-transaction-parser-kotlin",
    title: "How I Built an SMS Transaction Parser in Kotlin for Ethiopian Banks",
    excerpt:
      "A deep dive into parsing unstructured SMS messages from Ethiopian banks and mobile money providers into structured financial data — handling Amharic text, regex edge cases, and 100+ daily transactions.",
    date: "2026-03-15",
    readTime: "6 min",
    tags: ["Kotlin", "Android", "Fintech"],
    content: `## The Problem

Most Ethiopian banking and mobile money apps (CBE Birr, Telebirr, Dashen) send transaction confirmations via SMS in wildly inconsistent formats — some in Amharic, some in English, some mixing both. No standard structure, no API.

For my **Smart Personal Finance** app, I needed to automatically ingest these messages and turn them into structured transaction records.

## The Approach

I built a **native Kotlin BroadcastReceiver** that intercepts incoming SMS and runs each message through a pipeline:

\`\`\`kotlin
class TransactionSmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        messages.forEach { sms ->
            val parsed = TransactionParser.parse(sms.displayMessageBody)
            parsed?.let { repository.insert(it) }
        }
    }
}
\`\`\`

## Pattern Matching Strategy

Each bank has its own SMS template. I catalogued 15+ templates and wrote regex patterns for each:

- **CBE**: \`"ETB ([\\d,]+\\.\\d{2}) has been (credited|debited)"\`
- **Telebirr**: \`"You have received ([\\d,]+) Birr from"\`
- **Dashen**: \`"Withdrawal of ETB ([\\d,]+\\.\\d{2}) successful"\`

The parser returns a normalized \`Transaction\` object with amount, direction (credit/debit), source, and timestamp.

## Challenges

1. **Amharic numerals** — Some banks mix Ethiopian and Arabic numerals
2. **Duplicate detection** — SMS delivery retries cause duplicates; I hash message body + timestamp
3. **Battery optimization** — Android kills background receivers; I used \`WorkManager\` for reliability

## Results

The parser handles **100+ transactions/day** with ~92% accuracy on first-pass, feeding directly into the Supabase-backed expense dashboard with AI categorization.

## Takeaway

Don't wait for APIs that don't exist. Sometimes the scrappiest solution — parsing raw SMS — is exactly what the product needs. The key is building a robust enough parser that users never notice the complexity.`,
  },
  {
    slug: "clean-architecture-flutter-lessons",
    title: "What I Learned Implementing Clean Architecture in Flutter at Scale",
    excerpt:
      "After shipping JobGen with strict Clean Architecture and BLoC state management, here are the patterns that actually mattered — and the ones that were overkill.",
    date: "2026-02-28",
    readTime: "5 min",
    tags: ["Flutter", "Architecture", "BLoC"],
    content: `## Context

When I joined the **JobGen** project — a remote job finder app — the codebase was a single \`lib/\` folder with screens, models, and API calls all mixed together. Adding features meant touching 6+ files. Bug rate was high.

I led the refactor to **Clean Architecture** with BLoC state management. Here's what I learned.

## The Structure That Worked

\`\`\`
lib/
├── core/           # Shared utilities, error handling, network
├── features/
│   ├── auth/
│   │   ├── data/         # Repositories, data sources, models
│   │   ├── domain/       # Entities, use cases, repo interfaces
│   │   └── presentation/ # BLoC, screens, widgets
│   ├── jobs/
│   └── chat/
\`\`\`

Each feature is fully self-contained. The \`domain\` layer has zero dependencies on Flutter or any package.

## BLoC Patterns That Scaled

The biggest win was enforcing a strict **event → state** flow:

\`\`\`dart
class JobsBloc extends Bloc<JobsEvent, JobsState> {
  final GetRemoteJobs getRemoteJobs;

  JobsBloc(this.getRemoteJobs) : super(JobsInitial()) {
    on<FetchJobs>((event, emit) async {
      emit(JobsLoading());
      final result = await getRemoteJobs(event.filters);
      result.fold(
        (failure) => emit(JobsError(failure.message)),
        (jobs) => emit(JobsLoaded(jobs)),
      );
    });
  }
}
\`\`\`

This made testing trivial — inject a mock use case, fire an event, assert the state.

## What Was Overkill

- **Use cases for simple CRUD** — wrapping a single repository call in a \`UseCase\` class adds boilerplate with zero benefit
- **Strict mapper classes** — mapping between identical data/domain models wastes time
- **Separate failure classes per feature** — a shared \`Failure\` base class was enough

## Measurable Impact

- Bug rate dropped **40%** during QA testing
- New feature development time decreased by ~30%
- Onboarding new contributors went from days to hours

## The Lesson

Clean Architecture isn't about following every layer religiously. It's about **dependency inversion** — making your business logic testable and framework-independent. Apply it where complexity demands it; skip it where it doesn't.`,
  },
  {
    slug: "streaming-ai-responses-supabase-edge",
    title: "Streaming AI Responses Through Supabase Edge Functions",
    excerpt:
      "How I built a real-time AI streaming pipeline using Supabase Edge Functions, Groq's API, and Server-Sent Events — with auto-saving to PostgreSQL.",
    date: "2026-03-28",
    readTime: "4 min",
    tags: ["Supabase", "AI", "TypeScript"],
    content: `## Why Streaming?

For my portfolio's AI demo tools (Code Reviewer, Content Studio, etc.), I needed AI responses to appear **word-by-word** in real time — not as a single block after 10 seconds of waiting. The UX difference is massive.

## Architecture

\`\`\`
Browser → Supabase Edge Function → Groq API (streaming)
   ↑                                        ↓
   └──────── Server-Sent Events ← ─────────┘
\`\`\`

The Edge Function acts as a proxy: receives the user's prompt, forwards it to Groq with \`stream: true\`, and pipes the response chunks directly back to the browser.

## The Edge Function

\`\`\`typescript
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: \\\`Bearer \\\${GROQ_API_KEY}\\\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    stream: true,
  }),
});

return new Response(response.body, {
  headers: { "Content-Type": "text/event-stream" },
});
\`\`\`

The key insight: Groq's response body is already an SSE stream. I just **pass it through** — no parsing, no buffering. The Edge Function is a zero-copy proxy.

## Client-Side Consumption

\`\`\`typescript
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  // Parse SSE data lines and extract content deltas
  const lines = chunk.split("\\n").filter(l => l.startsWith("data: "));
  for (const line of lines) {
    const json = JSON.parse(line.slice(6));
    const token = json.choices?.[0]?.delta?.content;
    if (token) onToken(token); // Append to UI
  }
}
\`\`\`

## Auto-Saving to PostgreSQL

After the stream completes, the full accumulated response is saved:

\`\`\`typescript
await supabase.from("generations").insert({
  type: "code-review",
  input_text: userInput,
  output_text: fullResponse,
});
\`\`\`

This powers the "History" sidebar on each demo page — users can revisit past generations.

## Performance

- **Time to first token**: ~200ms (Groq is fast)
- **Perceived latency**: Near-zero — text starts appearing immediately
- **Cost**: $0 — Groq's free tier handles portfolio traffic easily

## Takeaway

Don't over-engineer AI integrations. A thin proxy Edge Function + SSE streaming gives you a production-quality AI experience with minimal code.`,
  },
];

const Blog = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Portfolio
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-medium text-primary tracking-widest uppercase mb-6 block">Blog</span>
          <h1 className="text-4xl md:text-5xl font-normal mb-4 leading-[1.1]">
            Technical <span className="text-gradient-primary italic">Writing</span>
          </h1>
          <p className="text-muted-foreground mb-14 max-w-lg">
            Lessons from building real products — architecture decisions, debugging war stories, and engineering trade-offs.
          </p>
        </motion.div>

        <div className="space-y-1">
          {blogPosts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group block p-5 -mx-5 rounded-lg hover:bg-card transition-colors duration-200"
              >
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {post.readTime}
                  </span>
                </div>
                <h2 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                  <ArrowRight size={12} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Blog;
