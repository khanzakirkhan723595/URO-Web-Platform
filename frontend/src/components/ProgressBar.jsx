// src/components/ProgressBar.jsx
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const ProgressBar = ({ progress, statusMessage = '' }) => {
  if (progress === null || progress < 0) return null;

  const failed = statusMessage.toLowerCase().includes('error');
  const done = progress >= 100;
  const pct = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="panel" role="status" aria-live="polite">
      <div className="mb-3 flex items-start gap-3">
        {failed ? <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          : done ? <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
          : <Loader2 className="mt-0.5 h-5 w-5 flex-shrink-0 animate-spin text-brand-600" />}
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold text-slate-800">{statusMessage || `Processing: ${pct}%`}</p>
          <p className="text-xs text-slate-500">{failed ? 'The run ended with an error.' : done ? 'Processing complete.' : 'Please keep this tab open.'}</p>
        </div>
        <span className="text-sm font-bold tabular-nums text-slate-700">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${failed ? 'bg-red-500' : done ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-500 to-brand-300'}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={statusMessage || `Processing: ${pct}%`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
