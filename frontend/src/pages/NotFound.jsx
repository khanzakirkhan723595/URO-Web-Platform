import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="section-padding min-h-[60vh] flex items-center justify-center">
      <div className="max-w-xl text-center">
        <h1 className="text-6xl font-bold text-blue-900 mb-6">404</h1>
        <div className="mb-8">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-24 w-24 mx-auto text-blue-800 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h2 className="heading-secondary mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-8">
          <h3 className="font-semibold text-blue-800 mb-2">Looking for our flood models?</h3>
          <p className="text-gray-600 mb-4">
            You might be interested in one of these pages:
          </p>
          <ul className="space-y-2 mb-4">
            <li>
              <Link to="/models/inland-flood" className="text-blue-600 hover:text-blue-800 hover:underline">
                Inland Flood Simulation
              </Link>
            </li>
            <li>
              <Link to="/models/storm-surge" className="text-blue-600 hover:text-blue-800 hover:underline">
                Storm Surge Model
              </Link>
            </li>
            <li>
              <Link to="/models/coupled-model" className="text-blue-600 hover:text-blue-800 hover:underline">
                Tightly Coupled Model
              </Link>
            </li>
          </ul>
        </div>
        
        <Link to="/" className="btn-primary inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;