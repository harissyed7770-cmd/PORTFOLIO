import { mulberry32 } from "./utils";

/**
 * Samples the glyphs of real DOM text elements into points, so particles can
 * converge exactly where the crisp typography will appear.
 *
 * Returns normalized coordinates relative to `frame`:
 *   x in [-0.5, 0.5] (left → right), y in [-0.5, 0.5] (bottom → top)
 */
export function sampleElementsToPoints(elements: HTMLElement[], frame: DOMRect, count: number, seed = 7) {
  const scale = Math.min(2, Math.max(1, 900 / Math.max(1, frame.width)));
  const w = Math.ceil(frame.width * scale);
  const h = Math.ceil(frame.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return new Float32Array(count * 2);

  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  for (const el of elements) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize) * scale;
    ctx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
    const spacing = parseFloat(cs.letterSpacing);
    if ("letterSpacing" in ctx && Number.isFinite(spacing)) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacing * scale}px`;
    }
    const text = cs.textTransform === "uppercase" ? (el.textContent ?? "").toUpperCase() : (el.textContent ?? "");
    const m = ctx.measureText(text);
    const glyphH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const left = (r.left - frame.left) * scale;
    const centerY = (r.top - frame.top + r.height / 2) * scale;
    const baseline = centerY + glyphH / 2 - m.actualBoundingBoxDescent;
    ctx.fillText(text, left, baseline);
  }

  const data = ctx.getImageData(0, 0, w, h).data;
  const step = Math.max(1, Math.round(scale * 1.5));
  const pts: number[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 140) pts.push(x, y);
    }
  }

  const out = new Float32Array(count * 2);
  const available = pts.length / 2;
  if (available === 0) return out;
  const rand = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    const k = Math.floor(rand() * available);
    const jitter = step * 0.5;
    const px = pts[k * 2] + (rand() - 0.5) * jitter;
    const py = pts[k * 2 + 1] + (rand() - 0.5) * jitter;
    out[i * 2] = px / w - 0.5;
    out[i * 2 + 1] = 0.5 - py / h;
  }
  return out;
}
