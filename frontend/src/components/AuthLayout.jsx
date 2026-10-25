// src/components/AuthLayout.jsx
// Split-screen layout shared by the login and signup pages.
import { Link } from 'react-router-dom';
import { Waves, ShieldCheck, LineChart } from 'lucide-react';

const points = [
  { icon: Waves, text: 'Run 2D flood simulations from your browser' },
  { icon: LineChart, text: 'Visualise results instantly on an interactive map' },
  { icon: ShieldCheck, text: 'Your last runs are saved securely to your account' },
];

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
    {/* Brand panel: desktop only */}
    <aside className="page-hero hidden flex-col justify-between p-12 lg:flex">
      <Link to="/" className="relative flex w-fit items-center gap-3">
        <img src="/logo.png" alt="" className="h-11 w-11 rounded-xl bg-white/95 p-1 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <span className="font-display text-xl font-extrabold">URO Flood Lab</span>
      </Link>
      <div className="relative">
        <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">Flood science, ready when you are.</h2>
        <ul className="mt-8 space-y-5">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-4 text-slate-200">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-300"><Icon size={20} /></span>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-sm text-slate-400">&copy; {new Date().getFullYear()} URO Flood Lab</p>
    </aside>

    {/* Form panel */}
    <div className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
      <div className="w-full max-w-md">
        <div className="panel sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>}
      </div>
    </div>
  </div>
);

export default AuthLayout;
