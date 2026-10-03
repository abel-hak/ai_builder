// "Ask your docs" — retrieval-augmented answers over user-uploaded text.
//
//   POST { action: "ingest", title, content }
//     → chunks the text, embeds each chunk with Supabase's built-in gte-small
//       model (384 dims, no external key), stores rows in document_chunks.
//   POST { action: "ask", question, documentId?, model? }
//     → embeds the question, finds the nearest chunks via the match_chunks
//       RPC, streams a Groq answer that cites chunks as [1], [2], ...
//       The first SSE event is `{"forge":{"citations":[...]}}` so the UI can
//       render sources before the answer finishes.
//   POST { action: "delete", documentId }
//
// Deploy: npx supabase functions deploy docs --no-verify-jwt --use-api

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const ALLOWED_MODELS = new Set([
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
]);

const resolveModel = (requested: unknown): string =>
  typeof requested === "string" && ALLOWED_MODELS.has(requested)
    ? requested
    : Deno.env.get("GROQ_MODEL") ?? "openai/gpt-oss-20b";

const MAX_DOC_CHARS = 120_000;
const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 150;
const MATCH_COUNT = 6;

/**
 * Paragraph-aware chunker. Packs paragraphs up to CHUNK_SIZE chars, and
 * when a single paragraph is too long, slides a window with overlap so no
 * sentence is cut from both neighbours.
 */
export function chunkText(text: string): string[] {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };

  for (const para of paragraphs) {
    if (para.length > CHUNK_SIZE) {
      flush();
      for (let i = 0; i < para.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
        chunks.push(para.slice(i, i + CHUNK_SIZE).trim());
        if (i + CHUNK_SIZE >= para.length) break;
      }
      continue;
    }
    if (current.length + para.length + 2 > CHUNK_SIZE) flush();
    current = current ? `${current}\n\n${para}` : para;
  }
  flush();
  return chunks;
}

// deno-lint-ignore no-explicit-any
const embedder = new (globalThis as any).Supabase.ai.Session("gte-small");

async function embed(text: string): Promise<number[]> {
  const out = await embedder.run(text, { mean_pool: true, normalize: true });
  return Array.from(out as Iterable<number>);
}

const admin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

type MatchRow = {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  similarity: number;
};

async function handleIngest(body: { title?: unknown; content?: unknown }) {
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
  const content = typeof body.content === "string" ? body.content : "";
  if (!title) return json({ error: "A title is required." }, 400);
  if (content.trim().length < 50) return json({ error: "Paste at least a paragraph of text." }, 400);
  if (content.length > MAX_DOC_CHARS) {
    return json({ error: `Documents are capped at ${MAX_DOC_CHARS.toLocaleString()} characters.` }, 413);
  }

  const chunks = chunkText(content);
  if (chunks.length === 0) return json({ error: "Nothing to index." }, 400);

  const db = admin();
  const { data: doc, error: docError } = await db
    .from("documents")
    .insert({ title, chunk_count: chunks.length, char_count: content.length })
    .select("id, title, chunk_count, char_count, created_at")
    .single();
  if (docError || !doc) {
    console.error("documents insert failed", docError);
    return json({ error: "Could not save the document." }, 500);
  }

  const started = performance.now();
  const rows = [];
  for (let i = 0; i < chunks.length; i++) {
    rows.push({
      document_id: doc.id,
      chunk_index: i,
      content: chunks[i],
      embedding: await embed(chunks[i]),
    });
  }

  const { error: chunkError } = await db.from("document_chunks").insert(rows);
  if (chunkError) {
    console.error("document_chunks insert failed", chunkError);
    await db.from("documents").delete().eq("id", doc.id);
    return json({ error: "Could not index the document." }, 500);
  }

  return json({
    document: doc,
    embedMs: Math.round(performance.now() - started),
  });
}

async function handleAsk(body: { question?: unknown; documentId?: unknown; model?: unknown }) {
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) return json({ error: "Ask a question first." }, 400);
  const documentId = typeof body.documentId === "string" && body.documentId ? body.documentId : null;

  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
  if (!GROQ_API_KEY) return json({ error: "GROQ_API_KEY is not configured" }, 500);

  const retrievalStart = performance.now();
  const queryEmbedding = await embed(question);
  const { data: matches, error } = await admin().rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_count: MATCH_COUNT,
    filter_document: documentId,
  });
  if (error) {
    console.error("match_chunks failed", error);
    return json({ error: "Retrieval failed. Has schema.sql been applied?" }, 500);
  }
  const retrievalMs = Math.round(performance.now() - retrievalStart);
  const sources = (matches ?? []) as MatchRow[];

  if (sources.length === 0) {
    return json({ error: "No documents indexed yet. Add one on the left first." }, 404);
  }

  const context = sources
    .map((s, i) => `[${i + 1}] ${s.content}`)
    .join("\n\n");

  const systemPrompt = `You answer questions using ONLY the numbered source passages provided.
Cite every claim with the passage number in square brackets, e.g. "...due in 30 days [2]."
If the passages do not contain the answer, say so plainly and do not guess.
Be concise. Use short paragraphs or bullets. Do not mention "passages" or "context"; just cite.`;

  const groq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: resolveModel(body.model),
      stream: true,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Sources:\n\n${context}\n\nQuestion: ${question}` },
      ],
    }),
  });

  if (!groq.ok || !groq.body) {
    const detail = await groq.text().catch(() => "");
    console.error("Groq error", groq.status, detail);
    return json(
      { error: groq.status === 429 ? "Rate limit exceeded. Please try again in a moment." : "AI service error" },
      groq.status === 429 ? 429 : 500,
    );
  }

  const encoder = new TextEncoder();
  const header = encoder.encode(
    `data: ${JSON.stringify({
      forge: {
        citations: sources.map((s, i) => ({
          n: i + 1,
          id: s.id,
          documentId: s.document_id,
          chunkIndex: s.chunk_index,
          content: s.content,
          similarity: s.similarity,
        })),
        retrievalMs,
      },
    })}\n\n`,
  );

  const upstream = groq.body;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(header);
      const reader = upstream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

async function handleDelete(body: { documentId?: unknown }) {
  const documentId = typeof body.documentId === "string" ? body.documentId : "";
  if (!documentId) return json({ error: "documentId is required." }, 400);
  const { error } = await admin().from("documents").delete().eq("id", documentId);
  if (error) return json({ error: "Could not delete the document." }, 500);
  return json({ ok: true });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    switch (body.action) {
      case "ingest":
        return await handleIngest(body);
      case "ask":
        return await handleAsk(body);
      case "delete":
        return await handleDelete(body);
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("docs error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
