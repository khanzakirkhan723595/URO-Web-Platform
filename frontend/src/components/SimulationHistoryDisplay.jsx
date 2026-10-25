// src/components/SimulationHistoryDisplay.jsx
import { useState } from 'react';
import { History, Download, Upload, Trash2, Loader2 } from 'lucide-react';

const SimulationHistoryDisplay = ({ historyItems = [], isLoading, error, onLoadHistory, onDeleteHistory, onDownload }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this saved run? This cannot be undone.')) return;
    setDeletingId(item._id);
    try { await onDeleteHistory(item._id); } finally { setDeletingId(null); }
  };

  return (
    <section className="panel" aria-labelledby="history-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="history-title" className="flex items-center gap-2 text-lg font-bold text-slate-900"><History size={20} className="text-brand-600" /> Your recent runs</h2>
        <span className="text-xs text-slate-500">Last 3 are kept</span>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3" aria-busy="true">{[1, 2, 3].map((i) => <div key={i} className="h-36 animate-pulse rounded-xl bg-slate-100" />)}</div>
      ) : error ? (
        <p className="alert-error" role="alert">{error}</p>
      ) : historyItems.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No saved runs yet. Run the model and it will appear here.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {historyItems.map((item) => (
            <li key={item._id} className="flex flex-col rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-soft">
              <p className="text-sm font-semibold text-slate-900">{new Date(item.runAt).toLocaleString()}</p>
              <p className="mb-3 text-xs text-slate-500">Duration: {item.executionTimeRequested} s</p>

              <div className="mt-auto space-y-2">
                <button type="button" onClick={() => onLoadHistory(item)} className="btn-primary w-full py-2 text-xs"><Upload size={14} /> Load this run</button>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => onDownload(item.hydrographInput, `hydrograph_${item._id.slice(-6)}.txt`)} className="btn-secondary px-2 py-1.5 text-xs" title="Download hydrograph"><Download size={13} /> In</button>
                  <button type="button" onClick={() => onDownload(item.pltOutputData, `output_${item._id.slice(-6)}.plt`)} className="btn-secondary px-2 py-1.5 text-xs" title="Download output"><Download size={13} /> Out</button>
                  <button type="button" onClick={() => handleDelete(item)} disabled={deletingId === item._id} className="btn-secondary px-2 py-1.5 text-xs text-red-600 hover:bg-red-50" title="Delete run" aria-label="Delete run">
                    {deletingId === item._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default SimulationHistoryDisplay;
