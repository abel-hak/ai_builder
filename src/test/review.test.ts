import { describe, it, expect } from "vitest";
import { applyFix, parseReview } from "@/lib/review";

describe("parseReview", () => {
  it("parses a valid JSON review and sorts by severity", () => {
    const review = parseReview(
      JSON.stringify({
        summary: "Unsafe patterns throughout.",
        score: 3,
        issues: [
          {
            line: 10,
            severity: "info",
            category: "best-practice",
            title: "Naming",
            message: "Prefer descriptive names.",
          },
          {
            line: 2,
            severity: "critical",
            category: "security",
            title: "SQL injection",
            message: "User input is concatenated into SQL.",
            fix: { startLine: 2, endLine: 2, replacement: "  db.query('SELECT 1');" },
          },
        ],
      }),
    );

    expect(review).not.toBeNull();
    expect(review!.score).toBe(3);
    expect(review!.issues[0].severity).toBe("critical");
    expect(review!.issues[1].severity).toBe("info");
    expect(review!.issues[0].fix?.replacement).toContain("SELECT 1");
  });

  it("tolerates markdown fences and leading prose", () => {
    const review = parseReview(`Here you go:
\`\`\`json
{"summary":"Clean enough.","score":8,"issues":[]}
\`\`\``);
    expect(review?.score).toBe(8);
    expect(review?.issues).toHaveLength(0);
  });

  it("returns null for invalid payloads", () => {
    expect(parseReview("not json")).toBeNull();
    expect(parseReview('{"summary":"x","score":99,"issues":[]}')).toBeNull();
  });
});

describe("applyFix", () => {
  it("replaces an inclusive line range", () => {
    const code = ["a", "b", "c", "d"].join("\n");
    expect(applyFix(code, { startLine: 2, endLine: 3, replacement: "X\nY" })).toBe("a\nX\nY\nd");
  });
});
