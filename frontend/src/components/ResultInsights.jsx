// src/components/ResultInsights.jsx
// "Result summary" cards computed from the PLT data, plus an optional AI explanation.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, MessageCircle, Ruler, Droplets, Waves, Grid3x3 } from 'lucide-react';
import { computePltStats, peakDepthClass } from '../utils/plt';
import { aiExplainResults } from '../services/api';
import { useAiEnabled } from '../hooks/useAiEnabled';
import { useAuth } from '../context/AuthContext';
import AiText from './AiText';

const Stat = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
    <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><Icon size={14} className="text-brand-600" /> {label}</div>
    <p className="mt-1 font-display text-xl font-extrabold tabular-nums text-slate-900">{value}</p>
    {sub && <p className="text-xs text-slate-500">{sub}</p>}
  </div>
);

const ResultInsights = ({ parsed, modelName, executionTime }) => {
  const { user } = useAuth();
  const aiEnabled = useAiEnabled();
  const stats = useMemo(() => computePltStats(parsed), [parsed]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  if (!stats) return null;
  const peak = peakDepthClass(stats.maxHmax);

  const explain = async () => {
    setLoading(true); setError(''); setExplanation('');
    try {
      const res = await aiExplainResults({ modelName, executionTime, stats });
      setExplanation(res.data.explanation);
    } catch (e) {
      setError(e.message || 'The AI could not explain these results.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel space-y-5" aria-labelledby="insights-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="insights-title" className="text-lg font-bold text-slate-900">Result summary</h3>
        <span className={`badge ${peak.tone}`} title="Indicative class based on peak depth, not an official hazard rating">Peak depth: {peak.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Droplets} label="Max depth" value={`${stats.maxHmax} m`} sub="HMAX peak" />
        <Stat icon={Waves} label="Mean depth" value={`${stats.meanHmax} m`} />
        <Stat icon={Grid3x3} label="Wet area" value={`${stats.floodedPercent}%`} sub="depth > 5 cm" />
        <Stat icon={Ruler} label="Grid points" value={stats.pointCount.toLocaleString()} />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Share of area by depth</p>
        <ul className="space-y-1.5">
          {stats.depthBands.map((b) => (
            <li key={b.label} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-2 text-xs sm:grid-cols-[8rem_1fr_3.5rem]">
              <span className="truncate text-slate-600">{b.label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${b.percent}%` }} /></span>
              <span className="text-right font-medium tabular-nums text-slate-700">{b.percent}%</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI explanation (only shown when the server has an AI key and the user is logged in) */}
      {aiEnabled && user && (
        <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-semibold text-brand-900"><Sparkles size={18} className="text-brand-600" /> AI explanation</p>
              <p className="text-xs text-slate-600">Get a plain-language summary of these results. Only the summary numbers above are sent, never your files.</p>
            </div>
            <button type="button" onClick={explain} disabled={loading} className="btn-primary flex-shrink-0">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Analysing...</> : explanation ? 'Explain again' : 'Explain my results'}
            </button>
          </div>
          {error && <p className="alert-error mt-3" role="alert">{error}</p>}
          {explanation && (
            <div className="mt-4 border-t border-brand-100 pt-4">
              <AiText text={explanation} />
              <Link to="/assistant" state={{ context: stats }} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-600">
                <MessageCircle size={15} /> Ask a follow-up question
              </Link>
              <p className="mt-3 text-[11px] text-slate-500">AI-generated. Simulation results depend on your input data and are not a substitute for official warnings or professional judgement.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ResultInsights;
