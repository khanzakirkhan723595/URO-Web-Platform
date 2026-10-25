// src/components/ModelCard.jsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ModelCard = ({ title, description, imageSrc, altText, linkTo, status = 'live' }) => (
  <article className="card group flex h-full flex-col">
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
      <img
        src={imageSrc}
        alt={altText}
        loading="lazy"
        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
      />
      <span className={`badge absolute left-3 top-3 shadow-sm ${status === 'live' ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-700'}`}>
        {status === 'live' ? 'Available' : 'Coming soon'}
      </span>
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <h3 className="mb-2 text-lg font-bold text-brand-900 sm:text-xl">{title}</h3>
      <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>
      <Link to={linkTo} className={status === 'live' ? 'btn-primary w-full sm:w-auto sm:self-start' : 'btn-secondary w-full sm:w-auto sm:self-start'}>
        {status === 'live' ? 'Try the model' : 'Learn more'} <ArrowRight size={16} />
      </Link>
    </div>
  </article>
);

export default ModelCard;
