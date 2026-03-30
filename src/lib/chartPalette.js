/**
 * Brand-anchored chart colors: forest greens, sage, terracotta, amber, muted teal/taupe.
 * Ordered so adjacent entries interpolate without harsh jumps; loop closes back to dark green.
 */
export const CHART_COLOR_ANCHORS = [
  "#1A3D1B",
  "#234826",
  "#2C5F2D",
  "#346337",
  "#3D6B3E",
  "#4A7C4B",
  "#528A54",
  "#5FA062",
  "#6CAD6E",
  "#7FB87A",
  "#8FC488",
  "#97BC62",
  "#A8C877",
  "#B9D490",
  "#C8DDA0",
  "#D4E8A8",
  "#E0EEC4",
  "#E8C46A",
  "#F59E0B",
  "#E8A060",
  "#D97964",
  "#C86858",
  "#7A6F62",
  "#5C7A6E",
  "#4A6560",
  "#2E4A40",
];

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const c = (n) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function lerpColor(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(
    A.r + (B.r - A.r) * t,
    A.g + (B.g - A.g) * t,
    A.b + (B.b - A.b) * t,
  );
}

/**
 * Returns `count` distinct hex colors on the brand spectrum.
 * @param {number} count
 * @param {{ rotation?: number }} [options] — shifts the sequence so multiple charts on one screen don’t match slice-for-slice.
 */
export function getChartColors(count, options = {}) {
  const rotation = Number(options.rotation) || 0;
  const anchors = CHART_COLOR_ANCHORS;
  const aLen = anchors.length;
  if (count <= 0) return [];
  if (aLen === 0) return [];

  if (count === 1) {
    return [anchors[((rotation % aLen) + aLen) % aLen]];
  }

  if (count <= aLen) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.round((i * (aLen - 1)) / (count - 1));
      const shifted = (idx + rotation) % aLen;
      out.push(anchors[shifted]);
    }
    for (let i = 1; i < out.length; i++) {
      if (out[i] === out[i - 1]) {
        const j = (anchors.indexOf(out[i]) + 1) % aLen;
        out[i] = anchors[j];
      }
    }
    return out;
  }

  const loop = [...anchors, anchors[0]];
  const segCount = loop.length - 1;
  const out = [];
  for (let i = 0; i < count; i++) {
    let t = i / count;
    t = (t + rotation / aLen) % 1;
    const pos = t * segCount;
    const j = Math.min(Math.floor(pos), segCount - 1);
    const frac = pos - j;
    out.push(lerpColor(loop[j], loop[j + 1], frac));
  }
  return out;
}
