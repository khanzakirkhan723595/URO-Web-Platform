// -----------------------------------------------------------------------------
// File: frontend/src/components/PointInfoModal.jsx
// -----------------------------------------------------------------------------
import React from 'react';
import { X } from 'lucide-react';

const PointInfoModal = ({ point, onClose }) => {
  if (!point) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Point Data</h3>
        <div className="space-y-2 text-gray-700">
          <p><span className="font-medium">X:</span> {point.x.toFixed(4)}</p>
          <p><span className="font-medium">Y:</span> {point.y.toFixed(4)}</p>
          <p><span className="font-medium">HMAX:</span> {point.hmax.toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
};

export default PointInfoModal;
