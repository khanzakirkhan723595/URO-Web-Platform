// src/components/PlotDisplay.jsx
import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ColorScaleLegend from './ColorScaleLegend';
import { getColorForHmax } from '../utils/plt';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 text-sm shadow-lift backdrop-blur">
      <p className="text-slate-600"><span className="font-semibold text-slate-800">X:</span> {d.x.toFixed(2)} m</p>
      <p className="text-slate-600"><span className="font-semibold text-slate-800">Y:</span> {d.y.toFixed(2)} m</p>
      <p className="font-semibold text-brand-700">HMAX: {d.hmax.toFixed(3)} m</p>
    </div>
  );
};

// SVG draws one element per point; above this many, thin the data so interaction stays smooth.
const MAX_RENDERED_POINTS = 12000;

/** `parsed` is the result of parsePltData() (parsed once in the parent). */
const PlotDisplay = ({ parsed, onPointClick }) => {
  const { data, minHmax, maxHmax, error, skipped } = parsed;

  const rendered = useMemo(() => {
    if (!data || data.length <= MAX_RENDERED_POINTS) return data;
    const step = Math.ceil(data.length / MAX_RENDERED_POINTS);
    return data.filter((_, i) => i % step === 0);
  }, [data]);

  if (error) {
    return (
      <div className="alert-error" role="alert">
        <h3 className="mb-1 text-base font-semibold">Could not display the plot</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Flood simulation output</h3>
          <p className="text-xs text-slate-500">Tap or click a point to see its coordinates and depth.</p>
        </div>
        <p className="text-xs tabular-nums text-slate-500">
          {rendered.length === data.length ? `${data.length.toLocaleString()} points` : `Showing ${rendered.length.toLocaleString()} of ${data.length.toLocaleString()} points`}
          {skipped > 0 && ` · ${skipped} invalid lines skipped`}
        </p>
      </div>

      <ColorScaleLegend minHmax={minHmax} maxHmax={maxHmax} getColor={(v) => getColorForHmax(v, minHmax, maxHmax)} />

      {/* Responsive height: compact on phones, taller on desktop */}
      <div className="mt-4 h-[20rem] w-full sm:h-[26rem] lg:h-[32rem]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 16, bottom: 28, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" dataKey="x" name="X (m)" domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'X (m)', position: 'insideBottom', offset: -16, fill: '#64748b', fontSize: 12 }} />
            <YAxis type="number" dataKey="y" name="Y (m)" width={56} domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Y (m)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
            <ZAxis type="number" dataKey="hmax" name="HMAX (m)" range={[0, 1]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={rendered} isAnimationActive={false} onClick={(proxy) => proxy?.payload && onPointClick?.(proxy.payload)}>
              {rendered.map((p) => <Cell key={p.id} fill={getColorForHmax(p.hmax, minHmax, maxHmax)} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlotDisplay;
