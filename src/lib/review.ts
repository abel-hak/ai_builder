import { z } from "zod";

export const SEVERITIES = ["critical", "warning", "info"] as const;
export const CATEGORIES = ["security", "performance", "architecture", "best-practice"] as const;

const fixSchema = z.object({
  startLine: z.number().int().min(1),
  endLine: z.number().int().min(1),
  replacement: z.string(),
});

const issueSchema = z.object({
  line: z.number().int().min(1),
  endLine: z.number().int().min(1).optional(),
  severity: z.enum(SEVERITIES),
  category: z.enum(CATEGORIES),
  title: z.string().min(1),
  message: z.string().min(1),
  fix: fixSchema.nullable().optional(),
});

export const reviewSchema = z.object({
  summary: z.string(),
  score: z.number().min(1).max(10),
  issues: z.array(issueSchema),
});

export type ReviewFix = z.infer<typeof fixSchema>;
export type ReviewIssue = z.infer<typeof issueSchema>;
export type Review = z.infer<typeof reviewSchema>;

const SEVERITY_RANK: Record<ReviewIssue["severity"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

/** Pull the first balanced JSON object out of a string that may have prose around it. */
const extractJsonObject = (text: string): string | null => {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
};

/**
 * Parses model output into a Review. Tolerates code fences and leading prose,
 * clamps the score, and sorts issues by severity then line. Returns null when
 * the payload is not a valid review so callers can fall back to prose.
 */
export function parseReview(text: string, totalLines?: number): Review | null {
  const json = extractJsonObject(text);
  if (!json) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }

  const result = reviewSchema.safeParse(raw);
  if (!result.success) return null;

  const review = result.data;
  const clampLine = (n: number) => (totalLines ? Math.min(Math.max(1, n), totalLines) : Math.max(1, n));

  const issues = review.issues
    .map((issue) => ({
      ...issue,
      line: clampLine(issue.line),
      endLine: issue.endLine ? Math.max(clampLine(issue.endLine), clampLine(issue.line)) : undefined,
      fix: issue.fix
        ? {
            ...issue.fix,
            startLine: clampLine(issue.fix.startLine),
            endLine: Math.max(clampLine(issue.fix.endLine), clampLine(issue.fix.startLine)),
          }
        : null,
    }))
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.line - b.line);

  return {
    summary: review.summary.trim(),
    score: Math.round(Math.min(10, Math.max(1, review.score))),
    issues,
  };
}

/** Replaces lines [startLine, endLine] (1-based, inclusive) with the fix text. */
export function applyFix(code: string, fix: ReviewFix): string {
  const lines = code.split("\n");
  const start = Math.max(0, fix.startLine - 1);
  const end = Math.min(lines.length, Math.max(start, fix.endLine));
  const replacement = fix.replacement.replace(/\n$/, "").split("\n");
  return [...lines.slice(0, start), ...replacement, ...lines.slice(end)].join("\n");
}

export const severityLabel: Record<ReviewIssue["severity"], string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

export const categoryLabel: Record<ReviewIssue["category"], string> = {
  security: "Security",
  performance: "Performance",
  architecture: "Architecture",
  "best-practice": "Best practice",
};
