// src/pages/Home.jsx
import HeroSection from '../components/HeroSection';
import ModelCard from '../components/ModelCard';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Cpu, Globe2, Layers } from 'lucide-react';

const features = [
  { icon: Cpu, title: 'High-performance computing', text: 'Computation runs on dedicated model servers, so you only need a browser and your input files.' },
  { icon: Layers, title: 'Inland to coastal', text: 'Rainfall-runoff, river and storm surge processes, from single models to tightly coupled systems.' },
  { icon: Globe2, title: 'Built for collaboration', text: 'Developed with agencies, engineering firms and research institutions to improve flood resilience.' },
];

const highlights = [
  'Novel coupling methods for inland-coastal flood models',
  'High-performance computing for real-time flood forecasting',
  'Climate change projections in flood risk assessments',
  'Urban drainage network modelling with uncertainty quantification',
];

const Home = () => (
  <div>
    <HeroSection />

    {/* Feature strip */}
    <section className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="panel flex gap-4">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={22} /></span>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Introduction */}
    <section className="section-padding">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow mb-3">Who we are</p>
          <h2 className="heading-primary">Welcome to URO Flood Lab</h2>
          <p className="lead mb-4">
            URO Flood Lab (Urban River Ocean Flood Dynamics Laboratory) develops advanced flood modelling systems for urban environments, focused on understanding and predicting flood events through sophisticated computational models.
          </p>
          <p className="mb-6 leading-relaxed text-slate-600">
            Floods are among the most dangerous and costly natural hazards. They occur when water overflows its usual boundaries (a river, lake or ocean) due to intense rainfall, extreme storm surges, or the combined effect of both.
          </p>
          <Link to="/about" className="inline-flex items-center gap-2 font-semibold text-brand-700 transition hover:gap-3 hover:text-brand-600">
            Learn more about our lab <ArrowRight size={16} />
          </Link>
        </div>
        <div className="overflow-hidden rounded-3xl shadow-lift ring-1 ring-slate-200">
          <img src="/Home/UROlab.webp" alt="Aerial view of a flooded urban area" loading="lazy" className="h-full w-full object-cover" />
        </div>
      </div>
    </section>

    {/* Models */}
    <section id="models" className="section-padding scroll-mt-16 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <p className="eyebrow mb-3 justify-center">Models</p>
          <h2 className="heading-primary">Our flood models</h2>
          <p className="lead">Advanced modelling and simulation tools for researchers, engineers and urban planners to predict and manage flood events.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <ModelCard title="Flood Model" description="High-resolution 2D flood modelling system for urban and rural watersheds." imageSrc="/Home/IFS.png" altText="Flood model visualisation" linkTo="/models/flood-model" status="live" />
          <ModelCard title="Storm Surge Model" description="Powerful coastal inundation simulator for hurricane and storm events." imageSrc="/Home/SSM.png" altText="Storm surge model visualisation" linkTo="/models/storm-surge" status="soon" />
          <ModelCard title="Tightly Coupled Model" description="Combined inland-coastal solution for comprehensive flood analysis." imageSrc="/Home/TCM.png" altText="Coupled model visualisation" linkTo="/models/coupled-model" status="soon" />
        </div>
      </div>
    </section>

    {/* Research */}
    <section className="section-padding">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow mb-3">Research</p>
          <h2 className="heading-primary">Cutting-edge tools to predict and mitigate floods</h2>
          <p className="mb-4 leading-relaxed text-slate-600">
            Our interdisciplinary team combines hydraulic engineering, computational fluid dynamics, urban planning and climate science to create accurate and accessible flood models.
          </p>
          <p className="leading-relaxed text-slate-600">
            We collaborate with government agencies, engineering firms and research institutions to improve flood resilience and adaptation strategies worldwide.
          </p>
        </div>
        <div className="panel">
          <h3 className="mb-4 text-lg font-bold text-brand-900">Research highlights</h3>
          <ul className="space-y-4">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" />
                <span className="text-slate-700">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="px-4 pb-16 sm:px-6 lg:px-8">
      <div className="page-hero mx-auto max-w-7xl rounded-3xl px-6 py-10 text-center sm:px-12 sm:py-14">
        <h2 className="relative text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Ready to run your first simulation?</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-slate-300">Create a free account, upload your hydrograph, and get results in minutes.</p>
        <div className="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/signup" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-950 transition hover:bg-brand-50">Create an account</Link>
          <Link to="/models/flood-model" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Open the flood model</Link>
        </div>
      </div>
    </section>
  </div>
);

export default Home;
