// src/components/ColorScaleLegend.jsx
const ColorScaleLegend = ({ minHmax, maxHmax, getColor }) => {
  if (!Number.isFinite(minHmax) || !Number.isFinite(maxHmax)) return null;

  const steps = 5;
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const value = minHmax + (maxHmax - minHmax) * (i / steps);
    return { value, color: getColor(value) };
  });

  return (
    <div className="mx-auto w-full max-w-xl" aria-label="HMAX colour legend">
      <p className="mb-1.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Max water depth, HMAX (m)</p>
      <div className="h-3 w-full rounded-full ring-1 ring-slate-200" style={{ background: `linear-gradient(to right, ${stops.map((s) => s.color).join(', ')})` }} />
      <div className="mt-1.5 flex justify-between text-[11px] font-medium tabular-nums text-slate-600 sm:text-xs">
        {stops.map((s, i) => <span key={i}>{s.value.toFixed(2)}</span>)}
      </div>
    </div>
  );
};

export default ColorScaleLegend;
