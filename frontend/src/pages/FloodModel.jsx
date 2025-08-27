// src/pages/FloodModel.jsx (Previously InlandFloodModel.jsx)
import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from '../components/FileUpload';
import ProgressBar from '../components/ProgressBar';
import PlotDisplay from '../components/PlotDisplay'; // Updated
import FeedbackForm from '../components/FeedbackForm';
import FeedbackListDisplay from '../components/FeedbackListDisplay';
import SimulationHistoryDisplay from '../components/SimulationHistoryDisplay';
import { 
    runModel as apiRunModel, 
    getFeedbackForModel as apiGetFeedbackForModel,
    getSimulationHistory as apiGetSimulationHistory
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Info, Droplets, FileText, MapPin } from 'lucide-react'; // Added MapPin

const MODEL_NAME = "FloodModel";

const FloodModel = () => {
  const { user } = useAuth();
  const [hydrographFile, setHydrographFile] = useState(null);
  const [tideFile, setTideFile] = useState(null);
  const [hydrographFileContent, setHydrographFileContent] = useState('');
  const [tideFileContent, setTideFileContent] = useState('');

  const [loadingModel, setLoadingModel] = useState(false);
  const [progress, setProgress] = useState(-1);
  const [statusMessage, setStatusMessage] = useState('');
  const [rawPltData, setRawPltData] = useState(null);
  const [modelRunError, setModelRunError] = useState('');

  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [feedbackError, setFeedbackError] = useState('');

  const [simulationHistory, setSimulationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const [selectedPlotPoint, setSelectedPlotPoint] = useState(null); // State for clicked plot point

  const modelExecutionTime = import.meta.env.VITE_MODEL_EXECUTION_TIME_SECONDS || "60";

  const fetchFeedback = useCallback(async () => {
    setLoadingFeedback(true);
    setFeedbackError('');
    try {
      const response = await apiGetFeedbackForModel(MODEL_NAME);
      if (response.status === 'success') setFeedbackList(response.data.feedbacks);
      else setFeedbackError(response.message || 'Could not load feedback.');
    } catch (err) {
      setFeedbackError(err.message || 'An error occurred while fetching feedback.');
    } finally {
      setLoadingFeedback(false);
    }
  }, []);

  const fetchSimulationHistory = useCallback(async () => {
    if (!user) {
        setSimulationHistory([]);
        setLoadingHistory(false);
        return;
    }
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const response = await apiGetSimulationHistory(MODEL_NAME);
      if (response.status === 'success') setSimulationHistory(response.data.history);
      else setHistoryError(response.message || 'Could not load simulation history.');
    } catch (err) {
      setHistoryError(err.message || 'An error occurred while fetching history.');
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeedback();
    fetchSimulationHistory();
  }, [fetchFeedback, fetchSimulationHistory]);

  const handleFilesSelected = ({ hydrograph, tide }) => {
    setHydrographFile(hydrograph);
    setTideFile(tide);
    if (hydrograph) hydrograph.text().then(setHydrographFileContent); else setHydrographFileContent('');
    if (tide) tide.text().then(setTideFileContent); else setTideFileContent('');
    setModelRunError('');
    setProgress(-1);
    setStatusMessage('Files selected. Ready to run model.');
  };

  const handleDownloadFile = async (fileDataOrContent, defaultFileName, contentType = 'text/plain', isRawString = false) => {
    let content;
    let fileName = defaultFileName;
    if (isRawString || typeof fileDataOrContent === 'string') {
        content = fileDataOrContent;
    } else if (fileDataOrContent instanceof File) {
        content = await fileDataOrContent.text();
        fileName = fileDataOrContent.name;
    } else {
        setModelRunError("Could not prepare file for download.");
        return;
    }
    const blob = new Blob([content], { type: contentType });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const handleRunModel = async () => {
    if (!hydrographFile && !hydrographFileContent) {
      setModelRunError('Hydrograph data is mandatory.');
      return;
    }
    setLoadingModel(true);
    setModelRunError('');
    setRawPltData(null); // Clear previous plot before new run
    setProgress(0);
    setStatusMessage('Preparing model run...');
    const formData = new FormData();
    if (hydrographFile) formData.append('hydrographFile', hydrographFile, 'Hydrograph.txt');
    else if (hydrographFileContent) formData.append('hydrographFile', new Blob([hydrographFileContent], { type: 'text/plain' }), 'Hydrograph.txt');
    if (tideFile) formData.append('tideFile', tideFile, 'tide.txt');
    else if (tideFileContent) formData.append('tideFile', new Blob([tideFileContent], { type: 'text/plain' }), 'tide.txt');
    formData.append('executionTime', modelExecutionTime);
    formData.append('modelName', MODEL_NAME);
    try {
      const onUploadProgress = (event) => setProgress(Math.min(Math.round((event.loaded * 100) / event.total) * 0.2, 20));
      // ... (timeouts for progress simulation) ...
      const response = await apiRunModel(formData, onUploadProgress);
      setProgress(90); setStatusMessage('Processing results...');
      if (response.success && response.pltData) {
        setRawPltData(response.pltData);
        setModelRunError('');
        setProgress(100);
        setStatusMessage('Model run successfully. Plotting results.');
        if (user) fetchSimulationHistory();
      } else {
        throw new Error(response.message || 'Failed to get PLT data from backend.');
      }
    } catch (err) {
      const errorMessage = err.message || (err.error ? err.error.toString() : 'An unknown error occurred.');
      setModelRunError(`Failed to run model: ${errorMessage}`);
      setProgress(100); setStatusMessage(`Error: ${errorMessage.substring(0,100)}...`);
    } finally {
      setLoadingModel(false);
    }
  };
  
  const handleFeedbackSubmitted = () => fetchFeedback();

  const handleLoadHistoryItem = (historyItem) => {
    setHydrographFileContent(historyItem.hydrographInput);
    setTideFileContent(historyItem.tideInput || '');
    setHydrographFile(null); 
    setTideFile(null);
    setRawPltData(historyItem.pltOutputData);
    setStatusMessage(`Loaded history from ${new Date(historyItem.runAt).toLocaleString()}. Inputs ready.`);
    setProgress(-1);
    setModelRunError('');
    setSelectedPlotPoint(null); // Clear any previously selected plot point
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // Handler for plot point click
  const handlePlotPointClick = (pointData) => {
    console.log("Plot point clicked:", pointData);
    setSelectedPlotPoint(pointData);
    // Future: Could open a modal or display info elsewhere on the page
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <section className="mb-12 p-6 sm:p-8 bg-white shadow-xl rounded-lg max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:space-x-8">
          <div className="md:w-2/3">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-4 flex items-center heading-primary">
              {/* <Info size={32} className="mr-3 text-blue-500" /> */}
              Flood Model {/* Updated Name */}
            </h1>
            <p className="text-slate-600 leading-relaxed mb-3 text-base sm:text-lg">
              This model simulates flood extent and depth from heavy rainfall, river overflow, or dam breaks using computational fluid dynamics.
            </p>
            <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
              Inputs: hydrograph file (water flow over time) and optional tide file. Output: PLT file visualizing max water surface elevation (hmax).
            </p>
          </div>
          <div className="md:w-1/3 mt-6 md:mt-0 flex justify-center">
            <img 
              src="\Home\IFS.png" 
              alt="Illustration of flooding" 
              className="rounded-lg shadow-md object-cover w-full h-auto max-h-64 md:max-h-80"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/e0e0e0/757575?text=Image+Not+Available&font=inter"; }}
            />
          </div>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          <FileUpload 
              onFilesSelected={handleFilesSelected} 
              onRunModel={handleRunModel}
              loading={loadingModel}
              error={modelRunError}
              hydrographFileForDownload={hydrographFile || hydrographFileContent}
              tideFileForDownload={tideFile || tideFileContent}
              pltDataForDownload={rawPltData}
              onDownloadFile={handleDownloadFile}
              initialHydrographName={hydrographFile ? hydrographFile.name : (hydrographFileContent ? "hydrograph_from_history.txt" : '')}
              initialTideName={tideFile ? tideFile.name : (tideFileContent ? "tide_from_history.txt" : '')}
          />
          {modelRunError && !loadingModel && !statusMessage.toLowerCase().includes("error in fileupload") && (
               <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-md">
                  <p className="font-semibold">Model Operation Failed</p><p>{modelRunError}</p>
              </div>
          )}
          {/* Display selected plot point info (optional simple display) */}
          {selectedPlotPoint && (
            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-md shadow-md">
                <h4 className="font-semibold text-md mb-2 flex items-center"><MapPin size={18} className="mr-2"/>Selected Point Data:</h4>
                <p className="text-sm">X: {selectedPlotPoint.x.toFixed(2)} (m)</p>
                <p className="text-sm">Y: {selectedPlotPoint.y.toFixed(2)} (m)</p>
                <p className="text-sm">HMAX: {selectedPlotPoint.hmax.toFixed(3)} (m)</p>
            </div>
          )}
        </div>
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          {(loadingModel || progress >= 0) && (<div className="w-full"><ProgressBar progress={progress} statusMessage={statusMessage} /></div>)}
          {rawPltData && !loadingModel && ( 
            <PlotDisplay 
                pltData={rawPltData} 
                onPointClick={handlePlotPointClick} // Pass the handler
            /> 
          )}
          {!rawPltData && !loadingModel && !modelRunError && (
            <div className="p-10 bg-white shadow-xl rounded-lg text-center text-gray-500 h-full flex flex-col justify-center items-center min-h-[300px] md:min-h-[500px]">
              <Droplets size={60} className="text-blue-300 mb-4" /><h3 className="text-xl font-semibold text-slate-700">Simulation Output Area</h3>
              <p className="text-slate-500">The flood map will appear here.</p>
            </div>
          )}
           {modelRunError && !loadingModel && (!rawPltData || statusMessage.toLowerCase().includes("error on plot")) && (
             <div className="p-6 bg-red-50 border border-red-300 text-red-600 rounded-lg shadow-lg min-h-[300px] md:min-h-[500px] flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold mb-2">Cannot Display Plot or Model Error</h3><p>{modelRunError}</p>
                {statusMessage.toLowerCase().includes("error") && <p className="text-sm mt-1">{statusMessage}</p>}
            </div>
          )}
        </div>
      </section>
      
      {user && (
        <section className="w-full max-w-7xl mx-auto mb-12">
            <SimulationHistoryDisplay 
                historyItems={simulationHistory}
                isLoading={loadingHistory}
                error={historyError}
                onLoadHistory={handleLoadHistoryItem}
            />
        </section>
      )}

      <section className="w-full max-w-7xl mx-auto mb-12 space-y-8">
        <FeedbackForm isLoading={loadingModel} modelName={MODEL_NAME} onFeedbackSubmitted={handleFeedbackSubmitted} />
        <FeedbackListDisplay feedbackItems={feedbackList} isLoading={loadingFeedback} error={feedbackError} />
      </section>
    </div>
  );
};

export default FloodModel;
