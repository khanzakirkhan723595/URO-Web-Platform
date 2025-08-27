// -----------------------------------------------------------------------------
// File: frontend/src/components/ColorScaleLegend.jsx
// -----------------------------------------------------------------------------
import React from 'react';

const ColorScaleLegend = ({ minHmax, maxHmax, getColor }) => {
  if (minHmax === Infinity || maxHmax === -Infinity) return null;

  const numSteps = 5;
  const steps = [];
  for (let i = 0; i <= numSteps; i++) {
    const value = minHmax + (maxHmax - minHmax) * (i / numSteps);
    steps.push({ value, color: getColor(value) });
  }

  return (
    <div className="p-2 bg-white shadow rounded-md mt-4">
      <p className="text-sm font-medium text-gray-700 mb-1 text-center">HMAX Legend</p>
      <div className="flex justify-between items-center px-2">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div
              className="w-6 h-4 rounded-sm mx-auto"
              style={{ backgroundColor: step.color }}
            ></div>
            <span className="text-xs text-gray-600">{step.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="h-2 mt-1 flex rounded-full overflow-hidden">
        {steps.slice(0, -1).map((step, index) => (
             <div key={`grad-${index}`} className="h-full flex-1" style={{background: `linear-gradient(to right, ${step.color}, ${steps[index+1].color})`}}></div>
        ))}
      </div>
    </div>
  );
};

export default ColorScaleLegend;
