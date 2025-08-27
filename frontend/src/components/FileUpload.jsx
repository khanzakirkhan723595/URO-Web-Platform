// src/components/FileUpload.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { UploadCloud, FileText, AlertCircle, Download, RotateCcw } from 'lucide-react';

const FileUpload = ({ 
  onFilesSelected, 
  onRunModel, 
  loading, 
  error,
  hydrographFileForDownload, // Can be File object or string content
  tideFileForDownload,       // Can be File object or string content
  pltDataForDownload,        // String content
  onDownloadFile,
  initialHydrographName = '', // New prop for pre-filled name
  initialTideName = ''        // New prop for pre-filled name
}) => {
  const [hydrographFile, setHydrographFile] = useState(null); // Stores the File object
  const [tideFile, setTideFile] = useState(null);             // Stores the File object
  
  // These states will hold the names to be displayed, whether from a new File or initial prop
  const [displayHydrographName, setDisplayHydrographName] = useState('');
  const [displayTideName, setDisplayTideName] = useState('');

  // Effect to set display names from initial props (e.g., when loading from history)
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
      // Pass the actual File objects up
      onFilesSelected({ hydrograph: currentHydroFile, tide: currentTideFile });
    }
  };
  
  const handleRunClick = () => {
    // The parent (FloodModel.jsx) will check if hydrographFile or hydrographFileContent exists.
    // This component primarily deals with newly selected files.
    onRunModel();
  };

  const handleResetFiles = () => {
    setHydrographFile(null);
    setTideFile(null);
    setDisplayHydrographName('');
    setDisplayTideName('');
    // Notify parent that files are cleared, so it can clear its content states too
    onFilesSelected({ hydrograph: null, tide: null }); 
  };

  const FileInputBox = ({ id, label, displayFileName, onChange, fileType, accept }) => (
    <div className="mb-4"> {/* Reduced mb-6 to mb-4 */}
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
    <div className="w-full p-6 bg-white shadow-xl rounded-lg space-y-6"> {/* Adjusted padding and space-y */}
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
      
      {error && ( // Displaying error passed from parent
        <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md flex items-center text-sm">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <span>{typeof error === 'object' ? JSON.stringify(error) : error}</span>
        </div>
      )}

      <button
        onClick={handleRunClick}
        disabled={loading || (!hydrographFile && !initialHydrographName)} // Disable if no file and no initial content
        className={`btn-primary w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md shadow-sm 
                    ${(loading || (!hydrographFile && !initialHydrographName)) ? 'opacity-60 cursor-not-allowed' : ''}
                    transition-opacity duration-150 ease-in-out`}
      >
        {loading ? 'Processing Model...' : 'Run Flood Model'}
      </button>

      {/* Download section for currently loaded/selected inputs and last output */}
      {(hydrographFileForDownload || tideFileForDownload || pltDataForDownload) && (
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-md font-medium text-slate-700 mb-2">Current Data for Download</h3>
          <div className="space-y-2">
            {hydrographFileForDownload && (
              <button
                onClick={() => onDownloadFile(hydrographFileForDownload, 
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
                onClick={() => onDownloadFile(tideFileForDownload, 
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
