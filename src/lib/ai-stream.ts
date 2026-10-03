import { DEFAULT_MODEL, finalizeStats, type StreamStats } from "./models";

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export type Msg = { role: "user" | "assistant"; content: string };

export type StreamMeta = Record<string, unknown>;

export type StreamOptions = {
  mode: string;
  messages: Msg[];
  model?: string;
  /** Ask the edge function for a JSON object instead of prose. */
  format?: "json";
  /** Override the function name; defaults to the shared `ai-demo` gateway. */
  endpoint?: string;
  /** Extra JSON fields merged into the request body. */
  body?: Record<string, unknown>;
  onDelta: (text: string) => void;
  /** Receives any non-OpenAI `forge` events the function emits (e.g. citations). */
  onMeta?: (meta: StreamMeta) => void;
  onDone: (stats: StreamStats) => void;
  onError?: (error: string) => void;
};

/**
 * Streams an OpenAI-style SSE response from a Supabase edge function and
 * reports timing / token stats when it finishes. Never throws; failures are
 * routed to onError and onDone still fires.
 */
export async function streamAI({
  mode,
  messages,
  model = DEFAULT_MODEL,
  format,
  endpoint = "ai-demo",
  body,
  onDelta,
  onMeta,
  onDone,
  onError,
}: StreamOptions) {
  const startedAt = performance.now();
  let firstTokenAt: number | null = null;
  let chars = 0;
  let promptTokens: number | null = null;
  let completionTokens: number | null = null;

  const finish = () =>
    onDone(
      finalizeStats({
        model,
        startedAt,
        firstTokenAt,
        endedAt: performance.now(),
        chars,
        promptTokens,
        completionTokens,
      }),
    );

  let resp: Response;
  try {
    resp = await fetch(`${FUNCTIONS_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ mode, messages, model, format, ...body }),
    });
  } catch {
    onError?.("Could not reach the AI service. Check your connection and try again.");
    finish();
    return;
  }

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({ error: "Request failed" }));
    onError?.(errorData.error || "Request failed");
    finish();
    return;
  }

  if (!resp.body) {
    onError?.("No response body");
    finish();
    return;
  }

  const handleEvent = (jsonStr: string): boolean => {
    let parsed: {
      forge?: StreamMeta;
      choices?: { delta?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
      x_groq?: { usage?: { prompt_tokens?: number; completion_tokens?: number } };
    };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return false;
    }

    if (parsed.forge) onMeta?.(parsed.forge);

    const content = parsed.choices?.[0]?.delta?.content;
    if (content) {
      if (firstTokenAt === null) firstTokenAt = performance.now();
      chars += content.length;
      onDelta(content);
    }

    const usage = parsed.x_groq?.usage ?? parsed.usage;
    if (usage) {
      promptTokens = usage.prompt_tokens ?? promptTokens;
      completionTokens = usage.completion_tokens ?? completionTokens;
    }
    return true;
  };

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  try {
    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        if (!handleEvent(jsonStr)) {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        handleEvent(jsonStr);
      }
    }
  } catch {
    onError?.("The AI response was interrupted. Please try again.");
  } finally {
    reader.releaseLock();
    finish();
  }
}
