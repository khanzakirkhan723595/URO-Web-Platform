import { describe, it, expect } from 'vitest';
import { parsePltData, getColorForHmax, computePltStats, peakDepthClass } from './plt';

const SAMPLE = `TITLE = "Flood"
VARIABLES = "X", "Y", "HMAX"
ZONE N= 4, E= 1
0 0 0.0
10 0 0.4
10 10 1.5
0 10 2.5
`;

describe('parsePltData', () => {
  it('extracts points and min/max depth', () => {
    const r = parsePltData(SAMPLE);
    expect(r.error).toBeUndefined();
    expect(r.data).toHaveLength(4);
    expect(r.minHmax).toBe(0);
    expect(r.maxHmax).toBe(2.5);
  });

  it('works with Windows line endings and any column order', () => {
    const text = 'VARIABLES = "HMAX", "X", "Y"\r\nZONE N= 1\r\n0.7 5 6\r\n';
    const r = parsePltData(text);
    expect(r.data[0]).toMatchObject({ x: 5, y: 6, hmax: 0.7 });
  });

  it('counts skipped invalid lines instead of crashing', () => {
    const text = 'VARIABLES = "X", "Y", "HMAX"\nZONE N= 3\n1 2 0.5\nabc def ghi\n3 4\n';
    const r = parsePltData(text);
    expect(r.data).toHaveLength(1);
    expect(r.skipped).toBe(2);
  });

  it('reports clear errors for bad input', () => {
    expect(parsePltData('').error).toMatch(/Invalid PLT/);
    expect(parsePltData(null).error).toBeDefined();
    expect(parsePltData('hello\nworld').error).toMatch(/header/);
    expect(parsePltData('VARIABLES = "A", "B"\nZONE N= 1\n1 2').error).toMatch(/Required variables/);
  });
});

describe('getColorForHmax', () => {
  it('goes blue -> green -> red', () => {
    expect(getColorForHmax(0, 0, 10)).toBe('rgb(0,0,255)');
    expect(getColorForHmax(5, 0, 10)).toBe('rgb(0,255,0)');
    expect(getColorForHmax(10, 0, 10)).toBe('rgb(255,0,0)');
  });
  it('handles min === max and out-of-range values', () => {
    expect(getColorForHmax(1, 1, 1)).toBe('#3b82f6');
    expect(getColorForHmax(99, 0, 10)).toBe('rgb(255,0,0)');
  });
});

describe('computePltStats', () => {
  it('summarises the result', () => {
    const stats = computePltStats(parsePltData(SAMPLE));
    expect(stats.pointCount).toBe(4);
    expect(stats.maxHmax).toBe(2.5);
    expect(stats.meanHmax).toBe(1.1);
    expect(stats.floodedPercent).toBe(75); // 3 of 4 points deeper than 5 cm
    expect(stats.extentX).toEqual([0, 10]);
    expect(stats.depthBands.reduce((a, b) => a + b.percent, 0)).toBeCloseTo(100, 0);
  });
  it('returns null without data', () => {
    expect(computePltStats({ data: [] })).toBeNull();
  });
});

describe('peakDepthClass', () => {
  it('classifies depth', () => {
    expect(peakDepthClass(0.1).label).toBe('Minor');
    expect(peakDepthClass(0.5).label).toBe('Moderate');
    expect(peakDepthClass(1.5).label).toBe('Major');
    expect(peakDepthClass(3).label).toBe('Severe');
  });
});
