// -----------------------------------------------------------------------------
// File: frontend/src/components/ProgressBar.jsx
// -----------------------------------------------------------------------------
import React from 'react';

const ProgressBar = ({ progress, statusMessage }) => {
  if (progress === null || progress < 0) return null;

  return (
    // Removed max-w-lg to allow full width. Margin (my-4) also removed, can be handled by parent.
    <div className="w-full p-4 bg-white shadow-md rounded-lg"> 
      <div className="text-sm font-medium text-gray-700 mb-1">{statusMessage || `Processing: ${progress}%`}</div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-indigo-600 h-4 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={statusMessage || `Processing: ${progress}%`}
        ></div>
      </div>
      {progress === 100 && !statusMessage.toLowerCase().includes("error") && (
        <p className="text-green-600 text-sm mt-2 text-center">Processing complete!</p>
      )}
       {progress === 100 && statusMessage.toLowerCase().includes("error") && (
        <p className="text-red-600 text-sm mt-2 text-center">Process finished with an error.</p>
      )}
    </div>
  );
};

export default ProgressBar;
