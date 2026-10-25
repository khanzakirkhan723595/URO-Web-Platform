// src/pages/About.jsx
import { Layers, Database, Activity, Award, Building2, Zap, Map, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const focus = [
  { icon: Layers, text: 'Development of inland flood simulation models for urban environments' },
  { icon: Database, text: 'Storm surge modelling for coastal flood prediction' },
  { icon: Activity, text: 'Compound flooding analysis through tightly coupled river-ocean models' },
  { icon: Award, text: 'Real-time flood forecasting and early warning systems' },
];

const types = [
  { icon: Building2, title: 'Inland flooding', text: 'Our models analyse complex urban drainage systems and infrastructure to predict flooding from intense rainfall in urban and rural watersheds.' },
  { icon: Zap, title: 'Coastal flooding', text: 'We develop advanced models to simulate storm surges and coastal flooding from cyclones and extreme weather events.' },
  { icon: Map, title: 'Compound flooding', text: 'Our integrated models capture the complex interactions between riverine flows and storm surges in coastal regions.' },
];

const highlights = [
  'Development of novel coupling methods for inland-coastal flood models',
  'High-performance computing approaches for real-time flood forecasting',
  'Integration of climate change projections in flood risk assessments',
  'Urban drainage network modelling with uncertainty quantification',
  'Flood model validation through extensive field measurements and case studies',
];

const papers = [
  'Sridharan, B., Chaitanya, R. K., Sudheer, K. P., & Kuiry, S. N. (2022). Improved accuracy of storm surge simulations by incorporating changing along-track parameters. International Journal of Climatology.',
  'Sridharan, B., Bates, P. D., Sen, D., & Kuiry, S. N. (2021). Local-inertial shallow water model on unstructured triangular grids. Advances in Water Resources, 152, 103930.',
  'Devi, N. N., Sridharan, B., & Kuiry, S. N. (2019). Impact of urban sprawl on future flooding in Chennai city, India. Journal of Hydrology, 574, 486-496.',
];

const About = () => (
  <div>
    <PageHeader
      eyebrow="About"
      title="About URO Flood Lab"
      description="The Urban River Ocean Flood Dynamics Laboratory specialises in integrated modelling systems to understand, predict and mitigate flood risks in urban and coastal environments."
    />

    <section className="section-padding">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="panel sm:p-8">
          <h2 className="heading-secondary">Our mission</h2>
          <p className="mb-4 leading-relaxed text-slate-600">
            URO Flood Lab is dedicated to advancing the science of flood prediction through innovative modelling approaches that integrate river, urban and oceanic systems. We aim to provide practical solutions for flood risk management and enhance community resilience against flood hazards.
          </p>
          <p className="leading-relaxed text-slate-600">
            Through cutting-edge research and development, we create tools that help communities predict, prepare for and respond to flooding events, ultimately saving lives and reducing property damage.
          </p>
        </div>
        <div className="panel sm:p-8">
          <h2 className="heading-secondary">Research focus</h2>
          <ul className="space-y-4">
            {focus.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon size={18} /></span>
                <span className="text-slate-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section className="bg-white section-padding">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow mb-2">Our history</p>
        <h2 className="heading-primary">Built at IIT Palakkad</h2>
        <div className="space-y-4 leading-relaxed text-slate-600">
          <p>The URO Flood Lab was established at the Department of Civil Engineering, IIT Palakkad, with a vision to address the growing challenges of urban and coastal flooding in India and worldwide.</p>
          <p>Building on years of research in flood modelling and hazard assessment, our team has developed the Integrated River &amp; Ocean Modelling System (earlier known as IROMS), which has been applied to analyse major flooding events in cities like Chennai, Kerala&apos;s Kuttanad region, and other coastal urban areas.</p>
          <p>Our laboratory continues to evolve its modelling capabilities, incorporating the latest advancements in computational methods, data acquisition and climate science to improve the accuracy and reliability of flood predictions.</p>
        </div>
      </div>
    </section>

    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <h2 className="heading-primary mb-8 text-center">Flooding types we study</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {types.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon size={28} /></span>
              <h3 className="mb-2 text-lg font-bold text-brand-900">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-white section-padding">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow mb-2">Research</p>
          <h2 className="heading-primary">Research highlights</h2>
          <ul className="space-y-4">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" /><span className="text-slate-700">{h}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-2">Publications</p>
          <h2 className="heading-primary">Selected journal papers</h2>
          <ul className="space-y-4">
            {papers.map((p) => <li key={p} className="border-l-4 border-brand-200 pl-4 text-sm leading-relaxed text-slate-600">{p}</li>)}
          </ul>
        </div>
      </div>
    </section>
  </div>
);

export default About;
