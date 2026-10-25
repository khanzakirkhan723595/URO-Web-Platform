// src/pages/FloodModel.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import FileUpload from '../components/FileUpload';
import ProgressBar from '../components/ProgressBar';
import PlotDisplay from '../components/PlotDisplay';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackListDisplay from '../components/FeedbackListDisplay';
import SimulationHistoryDisplay from '../components/SimulationHistoryDisplay';
import PageHeader from '../components/PageHeader';
import ResultInsights from '../components/ResultInsights';
import { parsePltData } from '../utils/plt';
import {
  runModel as apiRunModel,
  getFeedbackForModel as apiGetFeedbackForModel,
  getSimulationHistory as apiGetSimulationHistory,
  deleteHistoryItem as apiDeleteHistoryItem,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Droplets, MapPin, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const MODEL_NAME = 'FloodModel';

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

  const [selectedPlotPoint, setSelectedPlotPoint] = useState(null);
  const [lastRunSeconds, setLastRunSeconds] = useState(null);

  // Parse the PLT text ONCE per result (shared by the chart and the summary cards)
  const parsed = useMemo(() => (rawPltData ? parsePltData(rawPltData) : null), [rawPltData]);

  const modelExecutionTime = import.meta.env.VITE_MODEL_EXECUTION_TIME_SECONDS || '60';

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
    if (!user) { setSimulationHistory([]); setLoadingHistory(false); return; }
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

  useEffect(() => { fetchFeedback(); fetchSimulationHistory(); }, [fetchFeedback, fetchSimulationHistory]);

  // FileUpload sends only the part that changed: { hydrograph } and/or { tide } (null = removed)
  const handleFilesSelected = (update) => {
    if ('hydrograph' in update) {
      const file = update.hydrograph;
      setHydrographFile(file);
      if (file) file.text().then(setHydrographFileContent); else setHydrographFileContent('');
    }
    if ('tide' in update) {
      const file = update.tide;
      setTideFile(file);
      if (file) file.text().then(setTideFileContent); else setTideFileContent('');
    }
    setModelRunError('');
    setProgress(-1);
    setStatusMessage('');
  };

  const handleDownloadFile = async (fileDataOrContent, defaultFileName, contentType = 'text/plain', isRawString = false) => {
    let content;
    let fileName = defaultFileName;
    if (isRawString || typeof fileDataOrContent === 'string') content = fileDataOrContent;
    else if (fileDataOrContent instanceof File) { content = await fileDataOrContent.text(); fileName = fileDataOrContent.name; }
    else { setModelRunError('Could not prepare file for download.'); return; }

    const url = URL.createObjectURL(new Blob([content], { type: contentType }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunModel = async (customExecutionTime) => {
    if (!hydrographFile && !hydrographFileContent) { setModelRunError('Hydrograph data is mandatory.'); return; }
    setLoadingModel(true);
    setLastRunSeconds(Number(customExecutionTime || modelExecutionTime) || null);
    setModelRunError('');
    setRawPltData(null);
    setSelectedPlotPoint(null);
    setProgress(0);
    setStatusMessage('Preparing model run...');

    const formData = new FormData();
    formData.append('hydrographFile', hydrographFile || new Blob([hydrographFileContent], { type: 'text/plain' }), 'Hydrograph.txt');
    if (tideFile || tideFileContent) formData.append('tideFile', tideFile || new Blob([tideFileContent], { type: 'text/plain' }), 'tide.txt');
    formData.append('executionTime', customExecutionTime || modelExecutionTime || '60');
    formData.append('modelName', MODEL_NAME);

    try {
      // upload counts for the first 20% of the bar; the model run itself has no live progress
      const onUploadProgress = (event) => {
        if (event.total) setProgress(Math.min(Math.round((event.loaded * 100) / event.total) * 0.2, 20));
      };
      setStatusMessage('Uploading files and running the model...');
      const response = await apiRunModel(formData, onUploadProgress);
      setProgress(90);
      setStatusMessage('Processing results...');

      if (response.success && response.pltData) {
        setRawPltData(response.pltData);
        setProgress(100);
        setStatusMessage('Model run successfully. Plotting results.');
        if (user) fetchSimulationHistory();
      } else {
        throw new Error(response.message || 'Failed to get PLT data from backend.');
      }
    } catch (err) {
      const errorMessage = err.message || 'An unknown error occurred.';
      setModelRunError(`Failed to run model: ${errorMessage}`);
      setProgress(100);
      setStatusMessage(`Error: ${errorMessage.substring(0, 100)}`);
    } finally {
      setLoadingModel(false);
    }
  };

  const handleLoadHistoryItem = (historyItem) => {
    setHydrographFileContent(historyItem.hydrographInput);
    setTideFileContent(historyItem.tideInput || '');
    setHydrographFile(null);
    setTideFile(null);
    setRawPltData(historyItem.pltOutputData);
    setStatusMessage(`Loaded history from ${new Date(historyItem.runAt).toLocaleString()}. Inputs ready.`);
    setProgress(-1);
    setModelRunError('');
    setSelectedPlotPoint(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (id) => {
    try {
      await apiDeleteHistoryItem(id);
      setSimulationHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      setHistoryError(err.message || 'Could not delete the saved run.');
    }
  };

  const showError = modelRunError && !loadingModel;

  return (
    <div>
      <PageHeader
        eyebrow="Model"
        title="Flood Model"
        description="Simulate flood extent and depth from heavy rainfall, river overflow or dam breaks using computational fluid dynamics."
      >
        <p className="max-w-2xl text-sm text-slate-300">
          <strong className="font-semibold text-white">Inputs:</strong> hydrograph file (water flow over time) and an optional tide file.{' '}
          <strong className="font-semibold text-white">Output:</strong> PLT file showing maximum water surface elevation (HMAX).
        </p>
      </PageHeader>

      <div className="container-page space-y-8 py-8 sm:space-y-10 sm:py-10">
        {!user && (
          <div className="alert-info flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p><strong>Tip:</strong> log in to run the model and keep your last 3 runs.</p>
            <Link to="/login" state={{ from: { pathname: '/models/flood-model' } }} className="btn-primary self-start"><LogIn size={16} /> Log in</Link>
          </div>
        )}

        {/* Workspace: inputs (left) + results (right). Stacks below the lg breakpoint. */}
        <section className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-4">
            <div className="lg:sticky lg:top-20">
              <FileUpload
                onFilesSelected={handleFilesSelected}
                onRunModel={handleRunModel}
                loading={loadingModel}
                error={modelRunError}
                hydrographFileForDownload={hydrographFile || hydrographFileContent}
                tideFileForDownload={tideFile || tideFileContent}
                pltDataForDownload={rawPltData}
                onDownloadFile={handleDownloadFile}
                initialHydrographName={hydrographFile ? hydrographFile.name : hydrographFileContent ? 'hydrograph_from_history.txt' : ''}
                initialTideName={tideFile ? tideFile.name : tideFileContent ? 'tide_from_history.txt' : ''}
              />
            </div>
          </div>

          <div className="min-w-0 space-y-6 lg:col-span-8">
            {(loadingModel || progress >= 0) && <ProgressBar progress={progress} statusMessage={statusMessage} />}

            {parsed && !loadingModel && <PlotDisplay parsed={parsed} onPointClick={setSelectedPlotPoint} />}

            {selectedPlotPoint && (
              <div className="alert-info">
                <h4 className="mb-2 flex items-center gap-2 font-semibold"><MapPin size={18} /> Selected point</h4>
                <dl className="grid grid-cols-3 gap-3 text-sm">
                  <div><dt className="text-xs text-brand-700">X (m)</dt><dd className="font-semibold tabular-nums">{selectedPlotPoint.x.toFixed(2)}</dd></div>
                  <div><dt className="text-xs text-brand-700">Y (m)</dt><dd className="font-semibold tabular-nums">{selectedPlotPoint.y.toFixed(2)}</dd></div>
                  <div><dt className="text-xs text-brand-700">HMAX (m)</dt><dd className="font-semibold tabular-nums">{selectedPlotPoint.hmax.toFixed(3)}</dd></div>
                </dl>
              </div>
            )}

            {parsed && !parsed.error && !loadingModel && <ResultInsights parsed={parsed} modelName={MODEL_NAME} executionTime={lastRunSeconds} />}

            {!rawPltData && !loadingModel && !showError && (
              <div className="panel flex min-h-[18rem] flex-col items-center justify-center text-center sm:min-h-[28rem]">
                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500"><Droplets size={32} /></span>
                <h3 className="text-lg font-bold text-slate-800">Simulation output</h3>
                <p className="mt-1 max-w-xs text-sm text-slate-500">Upload a hydrograph and run the model. Your flood map will appear here.</p>
              </div>
            )}

            {showError && !rawPltData && (
              <div className="alert-error flex min-h-[14rem] flex-col items-center justify-center text-center" role="alert">
                <h3 className="mb-2 text-lg font-semibold">Model run failed</h3>
                <p className="max-w-md break-words">{modelRunError}</p>
              </div>
            )}
          </div>
        </section>

        {user && (
          <SimulationHistoryDisplay
            historyItems={simulationHistory}
            isLoading={loadingHistory}
            error={historyError}
            onLoadHistory={handleLoadHistoryItem}
            onDeleteHistory={handleDeleteHistory}
            onDownload={(content, name) => handleDownloadFile(content, name, 'text/plain', true)}
          />
        )}

        <section className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <FeedbackForm isLoading={loadingModel} modelName={MODEL_NAME} onFeedbackSubmitted={fetchFeedback} />
          <FeedbackListDisplay feedbackItems={feedbackList} isLoading={loadingFeedback} error={feedbackError} />
        </section>
      </div>
    </div>
  );
};

export default FloodModel;
