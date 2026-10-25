// src/components/ComingSoon.jsx
import { Link } from 'react-router-dom';
import { Hourglass } from 'lucide-react';

const ComingSoon = ({ title = 'Coming soon' }) => (
  <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
    <div className="panel max-w-xl text-center sm:p-10">
      <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Hourglass size={28} /></span>
      <h1 className="mb-3 text-3xl font-extrabold text-brand-950 sm:text-4xl">{title}</h1>
      <p className="mb-2 text-slate-600">We're developing advanced models to help predict and understand weather patterns and related flood risks.</p>
      <p className="mb-8 text-sm text-slate-500">Our new tools will be launching shortly to support research, planning and real-time decision-making.</p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/models/flood-model" className="btn-primary">Try the Flood Model</Link>
        <Link to="/" className="btn-secondary">Back to home</Link>
      </div>
    </div>
  </div>
);

export default ComingSoon;
