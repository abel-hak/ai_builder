/**
 * Split long text into overlapping chunks for embedding. Prefers paragraph
 * boundaries, then falls back to hard splits so no chunk exceeds maxChars.
 */
export function chunkText(text: string, maxChars = 900, overlap = 120): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  if (clean.length <= maxChars) return [clean];

  const paragraphs = clean.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  const push = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };

  for (const para of paragraphs) {
    if (para.length > maxChars) {
      push();
      for (let i = 0; i < para.length; i += maxChars - overlap) {
        chunks.push(para.slice(i, i + maxChars).trim());
        if (i + maxChars >= para.length) break;
      }
      continue;
    }
    if ((current + "\n\n" + para).length > maxChars) {
      push();
      const tail = chunks.length ? chunks[chunks.length - 1].slice(-overlap) : "";
      current = tail ? tail + "\n\n" + para : para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  push();

  return chunks.filter((c) => c.length > 0);
}
