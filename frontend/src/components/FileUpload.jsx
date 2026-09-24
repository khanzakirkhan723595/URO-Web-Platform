
// export default FileUpload;

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, AlertCircle, Download, RotateCcw, Clock, Gauge } from 'lucide-react';

const FileUpload = ({ 
  onFilesSelected, 
  onRunModel, 
  loading, 
  error,
  hydrographFileForDownload, 
  tideFileForDownload,       
  pltDataForDownload,        
  onDownloadFile,
  initialHydrographName = '', 
  initialTideName = ''        
}) => {
  const [hydrographFile, setHydrographFile] = useState(null); 
  const [tideFile, setTideFile] = useState(null); 
  
  // Simulation Mode States
  const [simMode, setSimMode] = useState('capped'); // 'capped' or 'full'
  const [executionTime, setExecutionTime] = useState(120); // User typed seconds
  
  const [displayHydrographName, setDisplayHydrographName] = useState('');
  const [displayTideName, setDisplayTideName] = useState('');

  useEffect(() => {
    setDisplayHydrographName(initialHydrographName);
  }, [initialHydrographName]);

  useEffect(() => {
    setDisplayTideName(initialTideName);
  }, [initialTideName]);

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    let currentHydroFile = hydrographFile;
    let currentTideFile = tideFile;

    if (file) {
      if (fileType === 'hydrograph') {
        setHydrographFile(file);
        setDisplayHydrographName(file.name);
        currentHydroFile = file;
      } else if (fileType === 'tide') {
        setTideFile(file);
        setDisplayTideName(file.name);
        currentTideFile = file;
      }
      onFilesSelected({ hydrograph: currentHydroFile, tide: currentTideFile });
    }
  };
  
  const handleRunClick = () => {
    // If Full Event, pass 86400 (or max duration); if Quick Preview, pass custom typed time
    const runTime = simMode === 'full' ? 86400 : (Number(executionTime) || 60);
    onRunModel(runTime);
  };

  const handleResetFiles = () => {
    setHydrographFile(null);
    setTideFile(null);
    setDisplayHydrographName('');
    setDisplayTideName('');
    onFilesSelected({ hydrograph: null, tide: null }); 
  };

  // Compute real clock-time estimate (Server processes ~4s of simulation per 1s real time)
  const calculateRealWaitTime = (simSeconds) => {
    const realSeconds = Math.ceil(simSeconds / 4);
    if (realSeconds < 60) return `~${realSeconds} seconds`;
    const minutes = Math.floor(realSeconds / 60);
    const remainingSecs = realSeconds % 60;
    return `~${minutes} min ${remainingSecs > 0 ? `${remainingSecs}s` : ''}`;
  };

  const FileInputBox = ({ id, label, displayFileName, onChange, fileType, accept }) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label} {fileType === 'hydrograph' && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 flex justify-center px-6 py-4 border-2 border-slate-300 border-dashed rounded-md hover:border-blue-500 transition-colors">
        <div className="space-y-1 text-center">
          <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
          <div className="flex text-sm text-slate-600">
            <label
              htmlFor={id}
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span>Upload a file</span>
              <input id={id} name={id} type="file" className="sr-only" onChange={(e) => onChange(e, fileType)} accept={accept} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-slate-500">.txt files only</p>
          {displayFileName && (
            <div className="mt-2 text-sm text-green-600 flex items-center justify-center">
              <FileText size={16} className="mr-1" /> {displayFileName}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full p-6 bg-white shadow-xl rounded-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Simulation Inputs</h2>
        {(displayHydrographName || displayTideName) && (
          <button
            onClick={handleResetFiles}
            title="Clear selected files"
            className="text-xs text-slate-500 hover:text-red-600 flex items-center p-1 rounded hover:bg-slate-100"
          >
            <RotateCcw size={14} className="mr-1" /> Clear Files
          </button>
        )}
      </div>
      
      <FileInputBox 
        id="hydrograph-file"
        label="Hydrograph File (Hydrograph.txt)"
        displayFileName={displayHydrographName}
        onChange={handleFileChange}
        fileType="hydrograph"
        accept=".txt"
      />

      <FileInputBox
        id="tide-file"
        label="Tide File (tide.txt - Optional)"
        displayFileName={displayTideName}
        onChange={handleFileChange}
        fileType="tide"
        accept=".txt"
      />

      {/* --- MANUAL TIME INPUT & ESTIMATE --- */}
      <div className="p-4 border rounded-md bg-slate-50 space-y-3">
        <label className="block text-sm font-semibold text-slate-700 flex items-center">
          <Gauge size={16} className="mr-1.5 text-blue-600" />
          Simulation Mode
        </label>

        <div className="flex gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="radio" 
              name="simMode" 
              value="capped" 
              checked={simMode === 'capped'} 
              onChange={() => setSimMode('capped')} 
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 font-medium">Custom Duration</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="radio" 
              name="simMode" 
              value="full" 
              checked={simMode === 'full'} 
              onChange={() => setSimMode('full')} 
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 font-medium">Full Event</span>
          </label>
        </div>

        {simMode === 'capped' ? (
          <div>
            <label htmlFor="execution-time" className="block text-xs font-medium text-slate-600 mb-1 flex items-center">
              <Clock size={14} className="mr-1 text-slate-500" />
              Enter Simulation Duration (Seconds)
            </label>
            <input
              id="execution-time"
              type="number"
              min="10"
              max="86400"
              value={executionTime}
              onChange={(e) => setExecutionTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm bg-white"
              placeholder="e.g. 180"
            />
            <p className="text-xs text-blue-600 font-medium mt-1.5">
              ⏱ Estimated Real Wait Time: {calculateRealWaitTime(Number(executionTime) || 0)}
            </p>
          </div>
        ) : (
          <div className="p-2.5 bg-blue-50 border-l-4 border-blue-500 text-blue-800 text-xs rounded">
            <p className="font-semibold mb-0.5">Full Event Run (24 Hours / 86,400s):</p>
            <p>⏱ Estimated Real Wait Time: ~5.5 hours to compute full hydrograph event.</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md flex items-center text-sm">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <span>{typeof error === 'object' ? JSON.stringify(error) : error}</span>
        </div>
      )}

      <button
        onClick={handleRunClick}
        disabled={loading || (!hydrographFile && !initialHydrographName)}
        className={`btn-primary w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md shadow-sm 
                    ${(loading || (!hydrographFile && !initialHydrographName)) ? 'opacity-60 cursor-not-allowed' : ''}
                    transition-opacity duration-150 ease-in-out`}
      >
        {loading ? 'Processing Model...' : 'Run Flood Model'}
      </button>

      {(hydrographFileForDownload || tideFileForDownload || pltDataForDownload) && (
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-md font-medium text-slate-700 mb-2">Current Data for Download</h3>
          <div className="space-y-2">
            {hydrographFileForDownload && (
              <button
                onClick={() => onDownloadFile(
                  hydrographFileForDownload, 
                  hydrographFileForDownload instanceof File ? hydrographFileForDownload.name : 'hydrograph_history.txt', 
                  'text/plain', 
                  typeof hydrographFileForDownload === 'string'
                )}
                className="btn-secondary w-full text-xs flex items-center justify-center px-3 py-1.5"
              >
                <Download size={14} className="mr-2" /> Download Hydrograph
              </button>
            )}
            {tideFileForDownload && (
              <button
                onClick={() => onDownloadFile(
                  tideFileForDownload, 
                  tideFileForDownload instanceof File ? tideFileForDownload.name : 'tide_history.txt',
                  'text/plain',
                  typeof tideFileForDownload === 'string'
                )}
                className="btn-secondary w-full text-xs flex items-center justify-center px-3 py-1.5"
              >
                <Download size={14} className="mr-2" /> Download Tide
              </button>
            )}
            {pltDataForDownload && (
              <button
                onClick={() => onDownloadFile(pltDataForDownload, 'output.plt', 'text/plain', true)}
                className="btn-secondary w-full text-xs flex items-center justify-center px-3 py-1.5"
              >
                <Download size={14} className="mr-2" /> Download Output.plt
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;