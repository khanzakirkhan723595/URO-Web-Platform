// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { BarChart2, Users, Mail } from 'lucide-react';

const StatItem = ({ icon: Icon, label, value, loading }) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
    <Icon size={18} className="flex-shrink-0 text-brand-300" />
    <div className="min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-base font-semibold text-white">
        {loading ? <span className="inline-block h-4 w-12 animate-pulse rounded bg-white/10" /> : (value ?? 'N/A').toLocaleString?.() ?? value}
      </p>
    </div>
  </div>
);

const Footer = ({ siteStats, statsLoading }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-slate-300">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/logo.png" alt="" className="h-12 w-12 rounded-xl bg-white/95 p-1 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <span>
                <span className="block font-display text-xl font-extrabold text-white">URO Flood Lab</span>
                <span className="block text-sm text-slate-400">Advancing flood science</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Urban River Ocean Flood Dynamics Lab: developing advanced models for flood prediction and management.
            </p>
          </div>

          {/* Links */}
          <div className="lg:col-span-3">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="transition-colors hover:text-white">Home</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-white">About us</Link></li>
              <li><Link to="/models/flood-model" className="transition-colors hover:text-white">Flood model</Link></li>
              <li><Link to="/team" className="transition-colors hover:text-white">Team</Link></li>
              <li><Link to="/contact" className="inline-flex items-center gap-1.5 transition-colors hover:text-white"><Mail size={14} /> Contact</Link></li>
            </ul>
          </div>

          {/* Stats */}
          <div className="lg:col-span-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Site statistics</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <StatItem icon={Users} label="Unique visitors (30 days)" value={siteStats?.uniqueVisitors} loading={statsLoading} />
              <StatItem icon={BarChart2} label="Total page views" value={siteStats?.totalVisits} loading={statsLoading} />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>&copy; {year} URO Flood Lab. All rights reserved.</p>
          <p>Powered by advanced simulation technologies.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
