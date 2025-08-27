// src/pages/TightlyCoupledModel.jsx
import { useState } from 'react';
// import FileUpload from '../components/FileUpload';
// import ResultsDisplay from '../components/ResultsDisplay';
import ComingSoon from '../components/ComingSoon';

const TightlyCoupledModel = () => {
  const [modelParams, setModelParams] = useState({
    hurricaneCategory: 3,
    rainfallIntensity: 50,
    simulationDuration: 72,
    couplingInterval: 1
  });
  
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    terrain: null,
    bathymetry: null,
    boundary: null
  });

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setModelParams({
      ...modelParams,
      [name]: parseFloat(value)
    });
  };

  const handleFileUpload = (fileType, file) => {
    setUploadedFiles({
      ...uploadedFiles,
      [fileType]: file
    });
  };

  const runModel = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call to run the model
    setTimeout(() => {
      // Mock results data
      setResults({
        visualizationSrc: "/coupled-model-results.jpg",
        visualizationDescription: "Combined flood map showing coastal surge and rainfall-induced flooding. Purple areas indicate compound flooding where both sources contribute.",
        headers: ["Location", "Max Depth (m)", "Surge Contribution (%)", "Rainfall Contribution (%)", "Duration (hr)"],
        data: [
          ["Coastal Zone", "4.3", "85", "15", "9.5"],
          ["River Estuary", "3.8", "60", "40", "12.2"],
          ["Urban Lowland", "2.5", "25", "75", "16.8"],
          ["Inland Area", "1.7", "5", "95", "10.3"]
        ],
        summary: [
          "Compound flooding observed in the river estuary with 60% surge contribution and 40% rainfall contribution",
          "Maximum flood depths of 4.3m in the coastal zone primarily from storm surge",
          "Longest flood duration (16.8 hours) in urban lowlands due to combined drainage constraints",
          "Inland areas primarily affected by rainfall-induced flooding (95% contribution)",
          "River estuary experiences enhanced flooding due to storm surge blocking drainage of rainfall runoff"
        ],
        downloadUrl: "#"
      });
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div>
      <ComingSoon/>
    </div>
    // <div className="section-padding">
    //   <div className="max-w-7xl mx-auto">
    //     <h1 className="heading-primary">Tightly Coupled Flood Model</h1>
    //     <p className="mb-8 text-gray-600">
    //       Our coupled model combines inland flood and storm surge simulations to accurately predict compound flooding in coastal regions. This advanced model accounts for interactions between rainfall-runoff and coastal surge processes.
    //     </p>
        
    //     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    //       <div className="lg:col-span-1">
    //         <div className="bg-white p-6 rounded-lg shadow-md">
    //           <h2 className="text-xl font-bold text-blue-800 mb-4">Model Parameters</h2>
              
    //           <form onSubmit={runModel}>
    //             <div className="mb-4">
    //               <label htmlFor="hurricaneCategory" className="block text-sm font-medium text-gray-700 mb-1">
    //                 Hurricane Category
    //               </label>
    //               <div className="grid grid-cols-5 gap-2">
    //                 {[1, 2, 3, 4, 5].map((category) => (
    //                   <button
    //                     key={category}
    //                     type="button"
    //                     className={`py-2 px-3 text-center border ${
    //                       modelParams.hurricaneCategory === category
    //                         ? 'bg-blue-500 text-white border-blue-500'
    //                         : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
    //                     } rounded-md focus:outline-none`}
    //                     onClick={() => setModelParams({...modelParams, hurricaneCategory: category})}
    //                   >
    //                     {category}
    //                   </button>
    //                 ))}
    //               </div>
    //             </div>
                
    //             <div className="mb-4">
    //               <label htmlFor="rainfallIntensity" className="block text-sm font-medium text-gray-700 mb-1">
    //                 Storm Approach Direction (degrees)
    //               </label>
    //               <input
    //                 type="range"
    //                 id="rainfallIntensity"
    //                 name="rainfallIntensity"
    //                 min="0"
    //                 max="359"
    //                 step="1"
    //                 value={modelParams.rainfallIntensity}
    //                 onChange={handleParamChange}
    //                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    //               />
    //               <div className="flex justify-between text-sm text-gray-500">
    //                 <span>0°</span>
    //                 <span>{modelParams.rainfallIntensity}°</span>
    //                 <span>359°</span>
    //               </div>
    //             </div>
                
    //             <div className="mb-4">
    //               <label htmlFor="simulationDuration" className="block text-sm font-medium text-gray-700 mb-1">
    //                 Storm Forward Speed (km/h)
    //               </label>
    //               <input
    //                 type="range"
    //                 id="simulationDuration"
    //                 name="simulationDuration"
    //                 min="5"
    //                 max="50"
    //                 step="1"
    //                 value={modelParams.simulationDuration}
    //                 onChange={handleParamChange}
    //                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    //               />
    //               <div className="flex justify-between text-sm text-gray-500">
    //                 <span>5</span>
    //                 <span>{modelParams.simulationDuration}</span>
    //                 <span>50</span>
    //               </div>
    //             </div>
                
    //             <div className="mb-4">
    //               <label htmlFor="couplingInterval" className="block text-sm font-medium text-gray-700 mb-1">
    //                 Tidal Stage (0=low, 1=high)
    //               </label>
    //               <input
    //                 type="range"
    //                 id="couplingInterval"
    //                 name="couplingInterval"
    //                 min="0"
    //                 max="1"
    //                 step="0.01"
    //                 value={modelParams.couplingInterval}
    //                 onChange={handleParamChange}
    //                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    //               />
    //               <div className="flex justify-between text-sm text-gray-500">
    //                 <span>Low</span>
    //                 <span>{modelParams.couplingInterval.toFixed(2)}</span>
    //                 <span>High</span>
    //               </div>
    //             </div>
                
    //             <FileUpload
    //               title="Bathymetry Data"
    //               description="Upload bathymetric depth file"
    //               acceptedFormats=".tif, .xyz, .nc"
    //               onFileUpload={(file) => handleFileUpload('bathymetry', file)}
    //             />
                
    //             <FileUpload
    //               title="Coastline Data"
    //               description="Upload coastline/shoreline vector data"
    //               acceptedFormats=".shp, .geojson, .kml"
    //               onFileUpload={(file) => handleFileUpload('coastline', file)}
    //             />
                
    //             <button 
    //               type="submit" 
    //               className="w-full btn-primary mt-6 flex items-center justify-center"
    //               disabled={isLoading || !uploadedFiles.bathymetry}
    //             >
    //               {isLoading ? (
    //                 <>
    //                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    //                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    //                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    //                   </svg>
    //                   Processing...
    //                 </>
    //               ) : (
    //                 'Run Simulation'
    //               )}
    //             </button>
    //           </form>
    //         </div>
    //       </div>
          
    //       <div className="lg:col-span-2">
    //         {results ? (
    //           <ResultsDisplay results={results} />
    //         ) : (
    //           <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
    //             <div className="text-center">
    //               <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    //               </svg>
    //               <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
    //               <p className="mt-1 text-sm text-gray-500">
    //                 Configure storm parameters and run the simulation to see results here.
    //               </p>
    //             </div>
    //           </div>
    //         )}
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default TightlyCoupledModel;
