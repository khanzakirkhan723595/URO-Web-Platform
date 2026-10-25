// src/utils/plt.js
// Pure helper functions for the model output (.PLT text). No React here, so they are easy to test.

const EMPTY = { data: [], minHmax: Infinity, maxHmax: -Infinity };

/**
 * Parses PLT text such as:
 *   VARIABLES = "X", "Y", "HMAX"
 *   ZONE N= 3
 *   100 200 0.5
 * @returns {{data: {x:number,y:number,hmax:number,id:string}[], minHmax:number, maxHmax:number, skipped:number, error?:string}}
 */
export const parsePltData = (pltDataString) => {
  if (!pltDataString || typeof pltDataString !== 'string') {
    return { ...EMPTY, skipped: 0, error: 'Invalid PLT data format: not a string or empty.' };
  }

  const lines = pltDataString.split('\n');
  let variableNames = [];
  let numPoints = 0;
  let dataStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const upper = line.toUpperCase();
    if (upper.startsWith('VARIABLES =')) {
      variableNames = line.substring(line.indexOf('=') + 1).replace(/"/g, '').split(',').map((v) => v.trim());
    }
    if (upper.startsWith('ZONE')) {
      const match = line.match(/N=\s*(\d+)/i);
      if (match) numPoints = parseInt(match[1], 10);
      dataStart = i + 1;
      break;
    }
  }

  if (variableNames.length === 0 || numPoints === 0 || dataStart === -1) {
    return { ...EMPTY, skipped: 0, error: 'PLT header information incomplete or not found (requires a VARIABLES line and a ZONE line with N=value).' };
  }

  const col = (name) => variableNames.findIndex((v) => v.toLowerCase() === name);
  const xIndex = col('x');
  const yIndex = col('y');
  const hIndex = col('hmax');
  if (xIndex === -1 || yIndex === -1 || hIndex === -1) {
    return { ...EMPTY, skipped: 0, error: `Required variables (x, y, hmax) not found. Found: ${variableNames.join(', ')}` };
  }

  const needed = Math.max(xIndex, yIndex, hIndex) + 1;
  const data = [];
  let minHmax = Infinity;
  let maxHmax = -Infinity;
  let skipped = 0;

  for (let i = 0; i < numPoints; i++) {
    const line = lines[dataStart + i];
    if (line === undefined) break; // file shorter than the header promised
    const parts = line.trim().split(/\s+/).map(parseFloat);
    if (parts.length < needed) { skipped++; continue; }
    const x = parts[xIndex];
    const y = parts[yIndex];
    const hmax = parts[hIndex];
    if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(hmax)) { skipped++; continue; }
    data.push({ x, y, hmax, id: `point-${i}` });
    if (hmax < minHmax) minHmax = hmax;
    if (hmax > maxHmax) maxHmax = hmax;
  }

  if (data.length === 0) {
    return { ...EMPTY, skipped, error: 'No valid data points (x, y, hmax) were extracted from the PLT file.' };
  }
  return { data, minHmax, maxHmax, skipped };
};

/** Blue (shallow) -> green -> red (deep). */
export const getColorForHmax = (value, min, max) => {
  if (min === max) return '#3b82f6';
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
  let r, g, b;
  if (ratio < 0.5) {
    r = 0; g = Math.round(255 * ratio * 2); b = Math.round(255 * (1 - ratio * 2));
  } else {
    r = Math.round(255 * (ratio - 0.5) * 2); g = Math.round(255 * (1 - (ratio - 0.5) * 2)); b = 0;
  }
  return `rgb(${r},${g},${b})`;
};

const BANDS = [
  { label: 'Dry / <0.1 m', min: -Infinity, max: 0.1 },
  { label: '0.1 - 0.5 m', min: 0.1, max: 0.5 },
  { label: '0.5 - 1 m', min: 0.5, max: 1 },
  { label: '1 - 2 m', min: 1, max: 2 },
  { label: '> 2 m', min: 2, max: Infinity },
];

/** Summary numbers for the "Result summary" cards and for the AI explanation. */
export const computePltStats = ({ data, minHmax, maxHmax }) => {
  if (!data || data.length === 0) return null;
  const n = data.length;
  let sum = 0;
  let flooded = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const counts = BANDS.map(() => 0);

  for (const p of data) {
    sum += p.hmax;
    if (p.hmax > 0.05) flooded++; // above 5 cm counts as wet
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    const bi = BANDS.findIndex((b) => p.hmax >= b.min && p.hmax < b.max);
    counts[bi === -1 ? BANDS.length - 1 : bi]++;
  }

  const round = (v, d = 3) => Number(v.toFixed(d));
  return {
    pointCount: n,
    minHmax: round(minHmax),
    maxHmax: round(maxHmax),
    meanHmax: round(sum / n),
    floodedPercent: round((flooded / n) * 100, 1),
    extentX: [round(minX, 1), round(maxX, 1)],
    extentY: [round(minY, 1), round(maxY, 1)],
    depthBands: BANDS.map((b, i) => ({ label: b.label, percent: round((counts[i] / n) * 100, 1) })),
  };
};

/** Indicative class of the peak depth (for a quick visual badge, not an official hazard rating). */
export const peakDepthClass = (maxHmax) => {
  if (maxHmax < 0.3) return { label: 'Minor', tone: 'bg-emerald-100 text-emerald-800' };
  if (maxHmax < 1) return { label: 'Moderate', tone: 'bg-amber-100 text-amber-800' };
  if (maxHmax < 2) return { label: 'Major', tone: 'bg-orange-100 text-orange-800' };
  return { label: 'Severe', tone: 'bg-red-100 text-red-800' };
};
