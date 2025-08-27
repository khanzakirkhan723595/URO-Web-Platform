// src/components/PlotDisplay.jsx
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import ColorScaleLegend from './ColorScaleLegend'; // Ensure this path is correct

/**
 * Parses the PLT data string.
 * @param {string} pltDataString - The raw string data from the .PLT file.
 * @returns {object} - { data: Array<object>, minHmax: number, maxHmax: number, error?: string }
 */
const parsePltData = (pltDataString) => {
  if (!pltDataString || typeof pltDataString !== 'string') {
    return { data: [], minHmax: Infinity, maxHmax: -Infinity, error: "Invalid PLT data format: not a string or null." };
  }

  const lines = pltDataString.split('\n');
  let variableNames = [];
  let numPointsN = 0;
  let dataStartIndex = -1;
  // Title is now static, so no need to parse it from here.

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toUpperCase().startsWith('VARIABLES =')) {
      try {
        const varString = line.substring(line.indexOf('=') + 1).trim();
        variableNames = varString.replace(/"/g, '').split(',').map(v => v.trim());
      } catch (e) {
        console.error("Error parsing VARIABLES line: ", line, e);
        return { data: [], minHmax: Infinity, maxHmax: -Infinity, error: "Could not parse VARIABLES line. Ensure it's a comma-separated list (e.g., X, Y, HMAX)." };
      }
    }
    if (line.toUpperCase().startsWith('ZONE')) {
      const nMatch = line.match(/N=\s*(\d+)/i);
      if (nMatch) numPointsN = parseInt(nMatch[1], 10);
      dataStartIndex = i + 1;
      break; 
    }
  }
  
  if (variableNames.length === 0 || numPointsN === 0 || dataStartIndex === -1) {
    return { data: [], minHmax: Infinity, maxHmax: -Infinity, error: "PLT header information incomplete or not found (Requires: VARIABLES line, ZONE line with N=value)." };
  }

  const xIndex = variableNames.findIndex(v => v.toLowerCase() === "x");
  const yIndex = variableNames.findIndex(v => v.toLowerCase() === "y");
  const hmaxIndex = variableNames.findIndex(v => v.toLowerCase() === "hmax");

  if (xIndex === -1 || yIndex === -1 || hmaxIndex === -1) {
    return { data: [], minHmax: Infinity, maxHmax: -Infinity, error: `Required variables (x, y, hmax) not found in VARIABLES list. Found: ${variableNames.join(', ')}` };
  }

  const plotData = [];
  let minHmax = Infinity;
  let maxHmax = -Infinity;

  for (let i = 0; i < numPointsN; i++) {
    const lineIndex = dataStartIndex + i;
    if (lineIndex >= lines.length) {
        console.warn(`Reached end of lines before processing all ${numPointsN} points.`);
        break;
    }

    const parts = lines[lineIndex].trim().split(/\s+/).map(parseFloat);
    if (parts.length < Math.max(xIndex, yIndex, hmaxIndex) + 1) {
        console.warn(`Skipping malformed line ${lineIndex + 1}: ${lines[lineIndex]}. Not enough data columns.`);
        continue;
    }

    const x = parts[xIndex];
    const y = parts[yIndex];
    const hmax = parts[hmaxIndex];

    if (!isNaN(x) && !isNaN(y) && !isNaN(hmax)) {
      plotData.push({ x, y, hmax, id: `point-${i}` });
      minHmax = Math.min(minHmax, hmax);
      maxHmax = Math.max(maxHmax, hmax);
    } else {
        console.warn(`Skipping line ${lineIndex + 1} due to NaN values: x=${x}, y=${y}, hmax=${hmax}`);
    }
  }
  
  if (plotData.length === 0) {
    return { data: [], minHmax, maxHmax, error: "No valid data points (x, y, hmax) were extracted from the PLT file." };
  }

  return { data: plotData, minHmax, maxHmax }; // Removed title from here
};

const getColorForHmax = (hmaxValue, minHmax, maxHmax) => {
  if (minHmax === maxHmax) return '#3b82f6';
  const ratio = (hmaxValue - minHmax) / (maxHmax - minHmax);
  let r, g, b;
  if (ratio < 0.5) { 
    r = 0; g = Math.round(255 * (ratio * 2)); b = Math.round(255 * (1 - ratio * 2));
  } else { 
    r = Math.round(255 * ((ratio - 0.5) * 2)); g = Math.round(255 * (1 - (ratio - 0.5) * 2)); b = 0;
  }
  return `rgb(${r},${g},${b})`;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-white shadow-lg rounded-md border border-gray-200">
        <p className="text-sm text-gray-700"><span className="font-semibold">X:</span> {data.x.toFixed(2)} (m)</p>
        <p className="text-sm text-gray-700"><span className="font-semibold">Y:</span> {data.y.toFixed(2)} (m)</p>
        <p className="text-sm text-indigo-600"><span className="font-semibold">HMAX:</span> {data.hmax.toFixed(3)} (m)</p>
      </div>
    );
  }
  return null;
};

const PlotDisplay = ({ pltData, onPointClick }) => { // Added onPointClick prop
  if (!pltData) {
    return (
      <div className="mt-0 p-6 bg-white shadow-xl rounded-lg text-center text-gray-500"> {/* Adjusted mt */}
        <p>Output plot will appear here once the model execution is complete.</p>
      </div>
    );
  }

  const { data, minHmax, maxHmax, error } = parsePltData(pltData);

  if (error) {
    return (
      <div className="mt-0 p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Error Displaying Plot</h3>
        <p>{error}</p>
        <p className="mt-2 text-xs">Received PLT data (first 500 chars):</p>
        <pre className="mt-1 p-2 bg-red-50 text-xs overflow-auto max-h-32 rounded">{typeof pltData === 'string' ? pltData.substring(0,500) : 'Invalid PLT data type'}</pre>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
     return (
      <div className="mt-0 p-6 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">No Data to Display</h3>
        <p>The PLT file was processed, but no valid data points were found to plot.</p>
        <pre className="mt-1 p-2 bg-yellow-50 text-xs overflow-auto max-h-32 rounded">{typeof pltData === 'string' ? pltData.substring(0,500) : 'Invalid PLT data type'}</pre>
      </div>
    );
  }

  return (
    <div className="w-full mt-0 p-6 bg-white shadow-xl rounded-lg">
      {/* Static Title */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">River Flood Simulation Output</h3>
      <ColorScaleLegend minHmax={minHmax} maxHmax={maxHmax} getColor={(val) => getColorForHmax(val, minHmax, maxHmax)} />
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="X Coordinate (m)" // Added (m)
            label={{ value: "X Coordinate (m)", position: 'insideBottomRight', offset: -15, fill: '#4b5563' }} 
            tick={{ fill: '#6b7280', fontSize: 10 }} 
            domain={['auto', 'auto']} 
            allowDataOverflow={true}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Y Coordinate (m)" // Added (m)
            label={{ value: "Y Coordinate (m)", angle: -90, position: 'insideLeft', fill: '#4b5563', dy: 40 }} 
            tick={{ fill: '#6b7280', fontSize: 10 }} 
            domain={['auto', 'auto']}
            allowDataOverflow={true}
          />
          <ZAxis type="number" dataKey="hmax" name="HMAX (m)" range={[0,1]} /> {/* Added (m) to name for legend */}
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Scatter 
            name="Data Points" 
            data={data} 
            // Re-enabled onClick to call the onPointClick prop
            onClick={(dataPointProxy) => {
                if (onPointClick && dataPointProxy && dataPointProxy.payload) {
                    onPointClick(dataPointProxy.payload); // Pass the actual data object
                }
            }}
            isAnimationActive={false}
            >
            {data.map((entry) => (
              <Cell 
                key={entry.id} 
                fill={getColorForHmax(entry.hmax, minHmax, maxHmax)} 
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlotDisplay;
