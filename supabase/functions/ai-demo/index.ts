import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  "code-review": `You are a senior software engineer performing expert-level code reviews. Analyze the code and provide:
1. **Security Issues** — vulnerabilities, injection risks, auth problems
2. **Performance** — bottlenecks, memory leaks, inefficient patterns
3. **Architecture** — SOLID violations, coupling, separation of concerns
4. **Best Practices** — naming, error handling, testing gaps
5. **Score** — Rate the code 1-10 with a brief justification

Be specific with line references. Suggest concrete fixes with code snippets. Be thorough but concise.`,

  "content-studio": `You are an expert content strategist and copywriter. Generate high-quality content based on the user's request. Adapt your tone, style, and format precisely to the brief. Include:
- Engaging hooks and headlines
- Well-structured body content
- Clear CTAs when appropriate
- SEO-friendly language when relevant
Always deliver polished, publication-ready content.`,

  "sentiment": `You are a sentiment analysis engine. Analyze the provided text and return a structured analysis:
1. **Overall Sentiment**: Positive / Negative / Neutral / Mixed (with confidence %)
2. **Emotion Breakdown**: Joy, Anger, Fear, Sadness, Surprise, Disgust (each with %)
3. **Key Phrases**: Extract the most emotionally charged phrases
4. **Tone**: Professional, Casual, Aggressive, Empathetic, etc.
5. **Summary**: 2-3 sentence analysis of the emotional undercurrent

Be precise and data-driven in your analysis.`,

  "translate": `You are an expert multilingual translator with deep cultural knowledge. Translate the provided text accurately while:
- Preserving tone, idioms, and cultural nuances
- Adapting expressions that don't translate directly
- Noting any cultural context the reader should know
- Maintaining the original formatting and structure

Provide the translation followed by brief translator's notes if any cultural adaptations were made.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, messages } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const systemPrompt = systemPrompts[mode] || systemPrompts["content-studio"];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-demo error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
