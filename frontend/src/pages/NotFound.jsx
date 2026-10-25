// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { Home, Waves } from 'lucide-react';

const NotFound = () => (
  <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
    <div className="max-w-lg text-center">
      <p className="font-display text-7xl font-extrabold text-brand-600 sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you are looking for may have been moved, renamed, or is temporarily unavailable.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/" className="btn-primary"><Home size={16} /> Return home</Link>
        <Link to="/models/flood-model" className="btn-secondary"><Waves size={16} /> Open the flood model</Link>
      </div>
    </div>
  </div>
);

export default NotFound;
