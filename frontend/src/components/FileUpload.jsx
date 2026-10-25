// src/components/FileUpload.jsx
import { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Download, RotateCcw, Clock, Gauge, X, Play, Loader2 } from 'lucide-react';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // must match the server limit (5 MB)

// Defined OUTSIDE FileUpload on purpose: a component declared inside another component is
// re-created on every render, which makes React remount it (losing DOM state).
const FileInputBox = ({ id, label, required, displayFileName, onFile, onClear }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
          dragging ? 'border-brand-500 bg-brand-50' : displayFileName ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-300 bg-slate-50/60 hover:border-brand-400 hover:bg-brand-50/40'
        }`}
      >
        <input
          ref={inputRef}
          id={id}
          name={id}
          type="file"
          accept=".txt,text/plain"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
        />
        {displayFileName ? (
          <div className="pointer-events-none flex items-center justify-center gap-2 text-sm font-medium text-emerald-700">
            <FileText size={18} className="flex-shrink-0" />
            <span className="truncate">{displayFileName}</span>
          </div>
        ) : (
          <div className="pointer-events-none">
            <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600"><span className="font-semibold text-brand-700">Click to upload</span> or drag and drop</p>
            <p className="mt-0.5 text-xs text-slate-500">.txt files only, up to 5 MB</p>
          </div>
        )}
      </div>
      {displayFileName && (
        <button type="button" onClick={onClear} className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600">
          <X size={12} /> Remove
        </button>
      )}
    </div>
  );
};

const DownloadBtn = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="btn-secondary w-full justify-start px-3 py-2 text-xs">
    <Download size={14} className="flex-shrink-0" /> <span className="truncate">{children}</span>
  </button>
);

const FileUpload = ({
  onFilesSelected, onRunModel, loading, error,
  hydrographFileForDownload, tideFileForDownload, pltDataForDownload, onDownloadFile,
  initialHydrographName = '', initialTideName = '',
}) => {
  const [simMode, setSimMode] = useState('capped'); // 'capped' | 'full'
  const [executionTime, setExecutionTime] = useState(120);
  const [localError, setLocalError] = useState('');

  // The parent (FloodModel) owns the files; this component only displays them.
  const hydrographName = initialHydrographName;
  const tideName = initialTideName;

  const accept = (file) => {
    if (!file.name.toLowerCase().endsWith('.txt')) { setLocalError('Only .txt files are allowed.'); return false; }
    if (file.size > MAX_FILE_BYTES) { setLocalError('File is too large. Maximum size is 5 MB.'); return false; }
    if (file.size === 0) { setLocalError('The selected file is empty.'); return false; }
    setLocalError('');
    return true;
  };

  const handleHydrograph = (file) => { if (accept(file)) onFilesSelected({ hydrograph: file }); };
  const handleTide = (file) => { if (accept(file)) onFilesSelected({ tide: file }); };

  const handleResetFiles = () => {
    setLocalError('');
    onFilesSelected({ hydrograph: null, tide: null });
  };

  const duration = simMode === 'full' ? 86400 : Number(executionTime) || 0;
  const durationValid = simMode === 'full' || (duration >= 10 && duration <= 86400);

  const handleRunClick = () => {
    if (!durationValid) { setLocalError('Duration must be between 10 and 86,400 seconds.'); return; }
    setLocalError('');
    onRunModel(duration);
  };

  // Server processes ~4 s of simulation per real second
  const waitTime = (simSeconds) => {
    const real = Math.ceil(simSeconds / 4);
    if (real < 60) return `~${real} seconds`;
    if (real < 3600) return `~${Math.floor(real / 60)} min ${real % 60 ? `${real % 60}s` : ''}`.trim();
    return `~${(real / 3600).toFixed(1)} hours`;
  };

  const canRun = !loading && !!hydrographName;
  const shownError = localError || (typeof error === 'object' && error ? JSON.stringify(error) : error);

  return (
    <div className="panel space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Simulation inputs</h2>
        {(hydrographName || tideName) && (
          <button type="button" onClick={handleResetFiles} className="btn-ghost px-2 py-1 text-xs hover:text-red-600">
            <RotateCcw size={14} /> Clear
          </button>
        )}
      </div>

      <FileInputBox id="hydrograph-file" label="Hydrograph file (Hydrograph.txt)" required displayFileName={hydrographName} onFile={handleHydrograph} onClear={() => onFilesSelected({ hydrograph: null })} />
      <FileInputBox id="tide-file" label="Tide file (tide.txt, optional)" displayFileName={tideName} onFile={handleTide} onClear={() => onFilesSelected({ tide: null })} />

      <fieldset className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <legend className="flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-800">
          <Gauge size={16} className="text-brand-600" /> Simulation mode
        </legend>

        <div className="grid grid-cols-2 gap-2">
          {[['capped', 'Custom duration'], ['full', 'Full event']].map(([value, label]) => (
            <label key={value} className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium transition ${simMode === value ? 'border-brand-500 bg-white text-brand-800 shadow-sm ring-2 ring-brand-500/20' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
              <input type="radio" name="simMode" value={value} checked={simMode === value} onChange={() => setSimMode(value)} className="sr-only" />
              {label}
            </label>
          ))}
        </div>

        {simMode === 'capped' ? (
          <div>
            <label htmlFor="execution-time" className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-600"><Clock size={14} /> Simulation duration (seconds)</label>
            <input id="execution-time" type="number" inputMode="numeric" min="10" max="86400" value={executionTime} onChange={(e) => setExecutionTime(e.target.value)} className="input-field" placeholder="e.g. 180" />
            <p className="mt-1.5 text-xs font-medium text-brand-700">Estimated wait: {waitTime(duration)}</p>
          </div>
        ) : (
          <div className="alert-warn text-xs">
            <p className="font-semibold">Full event run (24 h / 86,400 s)</p>
            <p className="mt-0.5">Estimated wait: ~5.5 hours. Keep this tab open until the run completes.</p>
          </div>
        )}
      </fieldset>

      {shownError && (
        <div className="alert-error flex items-start gap-2" role="alert">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span className="break-words">{shownError}</span>
        </div>
      )}

      <button type="button" onClick={handleRunClick} disabled={!canRun} className="btn-primary w-full py-3">
        {loading ? <><Loader2 size={18} className="animate-spin" /> Processing model...</> : <><Play size={16} /> Run flood model</>}
      </button>

      {(hydrographFileForDownload || tideFileForDownload || pltDataForDownload) && (
        <div className="border-t border-slate-200 pt-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Download data</h3>
          <div className="space-y-2">
            {hydrographFileForDownload && (
              <DownloadBtn onClick={() => onDownloadFile(hydrographFileForDownload, hydrographFileForDownload instanceof File ? hydrographFileForDownload.name : 'hydrograph_history.txt', 'text/plain', typeof hydrographFileForDownload === 'string')}>Hydrograph</DownloadBtn>
            )}
            {tideFileForDownload && (
              <DownloadBtn onClick={() => onDownloadFile(tideFileForDownload, tideFileForDownload instanceof File ? tideFileForDownload.name : 'tide_history.txt', 'text/plain', typeof tideFileForDownload === 'string')}>Tide</DownloadBtn>
            )}
            {pltDataForDownload && <DownloadBtn onClick={() => onDownloadFile(pltDataForDownload, 'output.plt', 'text/plain', true)}>Output.plt</DownloadBtn>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
