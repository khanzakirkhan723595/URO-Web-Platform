// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, LogOut, ShieldCheck, ChevronDown, Menu, X, Waves, Wind, Layers, UserCircle, Sparkles } from 'lucide-react';

const MODELS = [
  { to: '/models/flood-model', label: 'Flood Model', desc: 'Inland 2D flood simulation', icon: Waves },
  { to: '/models/storm-surge', label: 'Storm Surge Model', desc: 'Coastal inundation (coming soon)', icon: Wind },
  { to: '/models/coupled-model', label: 'Tightly Coupled Model', desc: 'Inland + coastal (coming soon)', icon: Layers },
];

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Team' },
  { to: '/contact', label: 'Contact' },
];

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || 'U';

const desktopLink = ({ isActive }) =>
  `relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loadingAuth } = useAuth();

  const modelsRef = useRef(null);
  const userRef = useRef(null);

  const isModelPage = location.pathname.startsWith('/models/');

  // Close everything when the route changes
  useEffect(() => {
    setMenuOpen(false);
    setModelsOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  // Shadow once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Click outside / Escape closes the dropdowns
  useEffect(() => {
    const onDown = (e) => {
      if (modelsRef.current && !modelsRef.current.contains(e.target)) setModelsOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setModelsOpen(false); setUserOpen(false); setMenuOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Lock page scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    setUserOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/85 backdrop-blur-lg transition-shadow ${
        scrolled ? 'border-slate-200 shadow-soft' : 'border-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label="Main navigation">
        {/* Brand */}
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <img
            src="/logo.png"
            alt=""
            className="h-9 w-9 flex-shrink-0 rounded-lg object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="truncate font-display text-lg font-extrabold tracking-tight text-brand-950">
            URO <span className="text-brand-600">Flood Lab</span>
          </span>
        </Link>

        {/* Desktop links (from lg up: enough room for all items) */}
        <div className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={desktopLink}>Home</NavLink>
          <NavLink to="/about" className={desktopLink}>About</NavLink>

          <div className="relative" ref={modelsRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={modelsOpen}
              onClick={() => setModelsOpen((o) => !o)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isModelPage ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Models
              <ChevronDown size={16} className={`transition-transform ${modelsOpen ? 'rotate-180' : ''}`} />
            </button>
            {modelsOpen && (
              <div role="menu" className="absolute left-0 top-full mt-2 w-80 animate-fade-up rounded-2xl border border-slate-200 bg-white p-2 shadow-lift">
                {MODELS.map(({ to, label, desc, icon: Icon }) => (
                  <Link key={to} to={to} role="menuitem" className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50">
                    <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Icon size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">{label}</span>
                      <span className="block text-xs text-slate-500">{desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/team" className={desktopLink}>Team</NavLink>
          <NavLink to="/contact" className={desktopLink}>Contact</NavLink>
          {user && <NavLink to="/assistant" className={desktopLink}><span className="inline-flex items-center gap-1.5"><Sparkles size={14} /> AI Assistant</span></NavLink>}
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-2 lg:flex">
          {loadingAuth ? (
            <span className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
          ) : user ? (
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => setUserOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={userOpen}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 transition hover:border-slate-300 hover:shadow-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{initials(user.name)}</span>
                <span className="max-w-[9rem] truncate text-sm font-medium text-slate-700">{user.name}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
              </button>
              {userOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-60 animate-fade-up rounded-2xl border border-slate-200 bg-white p-2 shadow-lift">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                    {user.role === 'admin' && <span className="badge mt-1 bg-brand-100 text-brand-800">Administrator</span>}
                  </div>
                  <Link to="/profile" role="menuitem" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <UserCircle size={16} className="text-brand-600" /> My profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <ShieldCheck size={16} className="text-brand-600" /> Admin panel
                    </Link>
                  )}
                  <button type="button" role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-red-50 hover:text-red-700">
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost"><LogIn size={16} /> Log in</Link>
              <Link to="/signup" className="btn-primary"><UserPlus size={16} /> Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 lg:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div id="mobile-menu" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-200 bg-white lg:hidden">
          <div className="container-page space-y-1 py-4">
            {LINKS.slice(0, 2).map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `block rounded-xl px-4 py-3 text-base font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`}>{label}</NavLink>
            ))}

            <button
              type="button"
              onClick={() => setModelsOpen((o) => !o)}
              aria-expanded={modelsOpen}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium ${isModelPage ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              Models <ChevronDown size={18} className={`transition-transform ${modelsOpen ? 'rotate-180' : ''}`} />
            </button>
            {modelsOpen && (
              <div className="ml-4 space-y-1 border-l-2 border-brand-100 pl-3">
                {MODELS.map(({ to, label }) => (
                  <NavLink key={to} to={to} className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm ${isActive ? 'font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>{label}</NavLink>
                ))}
              </div>
            )}

            {LINKS.slice(2).map(({ to, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `block rounded-xl px-4 py-3 text-base font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`}>{label}</NavLink>
            ))}

            <div className="mt-3 border-t border-slate-200 pt-4">
              {loadingAuth ? null : user ? (
                <>
                  <div className="mb-3 flex items-center gap-3 px-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{initials(user.name)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/profile" className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
                    <UserCircle size={18} className="text-brand-600" /> My profile
                  </Link>
                  <Link to="/assistant" className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
                    <Sparkles size={18} className="text-brand-600" /> AI Assistant
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
                      <ShieldCheck size={18} className="text-brand-600" /> Admin panel
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-base font-medium text-red-600 hover:bg-red-50">
                    <LogOut size={18} /> Log out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" className="btn-secondary">Log in</Link>
                  <Link to="/signup" className="btn-primary">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
