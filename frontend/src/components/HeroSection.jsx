// src/components/HeroSection.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';

const stats = [
  { value: '2D', label: 'Hydrodynamic modelling' },
  { value: '3', label: 'Integrated model suites' },
  { value: 'Web', label: 'Run models in the browser' },
];

const HeroSection = () => (
  <section className="relative isolate overflow-hidden bg-navy-950 text-white">
    {/* Background image (optimised WebP) with a navy gradient so text always stays readable */}
    <img
      src="/Home/hero1.webp"
      alt=""
      fetchPriority="high"
      className="absolute inset-0 -z-20 h-full w-full object-cover"
    />
    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/40" />
    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />

    <div className="container-page flex min-h-[28rem] flex-col justify-center py-16 sm:min-h-[32rem] sm:py-20 lg:min-h-[36rem] lg:py-28">
      <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-200 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-300" /> Urban · River · Ocean
      </p>
      <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
        Flood science you can <span className="text-brand-300">run in your browser</span>
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg lg:text-xl">
        URO Flood Lab develops advanced simulation models to predict and manage urban, riverine and coastal flooding, available to researchers, engineers and planners.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/models/flood-model" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-950 shadow-lg transition hover:bg-brand-50 active:scale-[0.98]">
          <PlayCircle size={18} /> Run the flood model
        </Link>
        <a href="#models" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">
          Explore our models <ArrowRight size={16} />
        </a>
      </div>

      <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-6">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="font-display text-2xl font-extrabold text-white sm:text-3xl">{s.value}</dt>
            <dd className="mt-1 text-xs leading-snug text-slate-300 sm:text-sm">{s.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

export default HeroSection;
