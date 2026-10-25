// src/pages/TeamPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Mail } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const SRIDHARAN_URL = 'https://sites.google.com/view/sridharan-b/home';

const teamMembers = {
  faculty: [
    {
      id: 1, name: 'Dr. B. Sridharan', role: 'Assistant Professor', image: '/Team/Faculty/B_Sridhran.png',
      bio: 'Dr. B. Sridharan works in computational and experimental hydraulics with a focus on free surface flow modelling. His research covers urban flooding, dam breaks, levee breaches, storm surges, and coastal and estuarine dynamics.',
      expertise: ['Hydrological Modelling', 'Climate Change Impacts', 'Urban Flooding'], profileLink: SRIDHARAN_URL,
    },
  ],
  students: [
    { id: 4, name: 'Zakir', role: 'B.Tech (Civil Engineering)', image: '/Team/WebDevelopers/Zakir.jpg', bio: 'Helped create the URO Flood Lab website.', expertise: ['React.js', 'Node.js', 'JavaScript'] },
    { id: 5, name: 'Sandeep Kumar', role: 'B.Tech (Electrical Engineering)', image: '/Team/WebDevelopers/Sandeep.jpg', bio: 'Helped create the URO Flood Lab website.', expertise: ['React.js', 'Node.js', 'JavaScript'] },
  ],
};

const LABELS = { faculty: 'Faculty', students: 'Students & developers' };

const Photo = ({ src, alt, className }) => (
  <img src={src} alt={alt} loading="lazy" className={className}
    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; e.currentTarget.className = `${className} object-contain bg-slate-100 p-8`; }} />
);

const Tags = ({ items }) => (
  <ul className="flex flex-wrap gap-2">
    {items.map((t) => <li key={t} className="badge bg-brand-50 text-brand-800">{t}</li>)}
  </ul>
);

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState('faculty');
  const members = teamMembers[activeTab];

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Our team"
        description="Experts in hydrology, oceanography, computer science and environmental engineering working on flood prediction and management."
      />

      <div className="container-page py-8 sm:py-12">
        <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200" role="tablist" aria-label="Team categories">
          {Object.keys(teamMembers).map((cat) => (
            <button key={cat} type="button" role="tab" aria-selected={activeTab === cat} onClick={() => setActiveTab(cat)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition sm:text-base ${activeTab === cat ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              {LABELS[cat]}
              <span className="badge bg-slate-100 text-slate-600">{teamMembers[cat].length}</span>
            </button>
          ))}
        </div>

        {activeTab === 'faculty' ? (
          <div className="space-y-6">
            {members.map((m) => (
              <article key={m.id} className="card flex flex-col md:flex-row">
                <Photo src={m.image} alt={m.name} className="h-64 w-full object-cover object-top md:h-auto md:w-72 lg:w-80" />
                <div className="flex-1 p-5 sm:p-8">
                  <h2 className="text-2xl font-bold text-brand-900">{m.name}</h2>
                  <p className="mb-3 font-medium text-brand-600">{m.role}</p>
                  <p className="mb-5 leading-relaxed text-slate-600">{m.bio}</p>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Areas of expertise</h3>
                  <Tags items={m.expertise} />
                  <div className="mt-6 flex flex-wrap gap-3">
                    {m.profileLink && <a href={m.profileLink} target="_blank" rel="noopener noreferrer" className="btn-secondary"><ExternalLink size={16} /> Academic profile</a>}
                    <Link to="/contact" className="btn-ghost"><Mail size={16} /> Contact the lab</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <article key={m.id} className="card flex flex-col">
                <Photo src={m.image} alt={m.name} className="aspect-square w-full object-cover object-top" />
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-bold text-brand-900">{m.name}</h2>
                  <p className="mb-2 text-sm font-medium text-brand-600">{m.role}</p>
                  <p className="mb-4 flex-1 text-sm text-slate-600">{m.bio}</p>
                  <Tags items={m.expertise} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
