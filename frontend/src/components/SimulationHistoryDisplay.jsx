// src/components/SimulationHistoryDisplay.jsx
import React from 'react';
import { Clock, FileText, Zap, Maximize2, Download } from 'lucide-react';

const SimulationHistoryItem = ({ historyItem, onLoadHistory }) => {
  const { runAt, executionTimeRequested, _id, hydrographInput, tideInput, pltOutputData } = historyItem;

  // Function to create a Blob from text content for download
  const createTextFileBlob = (text) => new Blob([text], { type: 'text/plain' });

  // Function to trigger download
  const handleDownload = (content, filename) => {
    const blob = createTextFileBlob(content);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="bg-slate-50 p-4 rounded-lg shadow border border-slate-200 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Simulation Run
          </p>
          <p className="text-xs text-slate-500 flex items-center">
            <Clock size={14} className="mr-1 text-slate-400" /> {new Date(runAt).toLocaleString()}
          </p>
        </div>
        <span className="text-xs text-slate-500 flex items-center">
          <Zap size={14} className="mr-1 text-yellow-500" /> {executionTimeRequested}s
        </span>
      </div>
      
      <div className="text-xs text-slate-600 space-y-1 mb-3">
        <p><strong>Inputs:</strong></p>
        <div className="flex items-center justify-between text-slate-500 hover:text-blue-600 transition-colors">
            <span>Hydrograph Data</span>
            <button 
                onClick={() => handleDownload(hydrographInput, `hydrograph_history_${_id.slice(-6)}.txt`)}
                title="Download Hydrograph Input"
                className="p-1 rounded hover:bg-slate-200">
                <Download size={14} />
            </button>
        </div>
        {tideInput && (
            <div className="flex items-center justify-between text-slate-500 hover:text-blue-600 transition-colors">
                <span>Tide Data</span>
                <button 
                    onClick={() => handleDownload(tideInput, `tide_history_${_id.slice(-6)}.txt`)}
                    title="Download Tide Input"
                    className="p-1 rounded hover:bg-slate-200">
                    <Download size={14} />
                </button>
            </div>
        )}
      </div>
      
      <div className="mt-3 flex items-center space-x-2">
        <button 
          onClick={() => onLoadHistory(historyItem)}
          className="btn-secondary text-xs px-3 py-1.5 flex items-center"
          title="Load this simulation's inputs and output"
        >
          <Maximize2 size={14} className="mr-1.5" /> Load this Run
        </button>
         <button 
            onClick={() => handleDownload(pltOutputData, `output_history_${_id.slice(-6)}.plt`)}
            title="Download PLT Output"
            className="btn-secondary text-xs px-3 py-1.5 flex items-center">
            <Download size={14} className="mr-1.5" /> Download Output
        </button>
      </div>
    </div>
  );
};

const SimulationHistoryDisplay = ({ historyItems, isLoading, error, onLoadHistory }) => {
  if (isLoading) {
    return <div className="text-center py-4 text-slate-500">Loading simulation history...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600 bg-red-50 p-3 rounded-md">Error loading history: {error}</div>;
  }

  if (!historyItems || historyItems.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <FileText size={40} className="mx-auto mb-2 text-slate-400" />
        No simulation history found for this model. <br/> Run a simulation to see it here!
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">
        Your Recent Simulations ({historyItems.length > 0 ? `Latest ${historyItems.length}` : 'None'})
      </h3>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {historyItems.map((item) => (
          <SimulationHistoryItem key={item._id} historyItem={item} onLoadHistory={onLoadHistory} />
        ))}
      </div>
    </div>
  );
};

export default SimulationHistoryDisplay;
