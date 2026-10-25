// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCog, ShieldCheck, Trash2, Loader2, History, MessageSquare, CalendarDays, LogIn, Play, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMySummary, updateProfile, updatePassword, deleteAccount } from '../services/api';
import PageHeader from '../components/PageHeader';
import PasswordInput from '../components/PasswordInput';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Edit profile', icon: UserCog },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'danger', label: 'Delete account', icon: Trash2 },
];

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || 'U';
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-');

const StatTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
    <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={18} /></span>
    <p className="font-display text-2xl font-extrabold tabular-nums text-slate-900">{value}</p>
    <p className="text-xs text-slate-500">{label}</p>
  </div>
);

const Overview = ({ user }) => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    getMySummary()
      .then((r) => !ignore && setSummary(r.data))
      .catch((e) => !ignore && setError(e.message || 'Could not load your activity.'));
    return () => { ignore = true; };
  }, []);

  return (
    <div className="space-y-6">
      {error && <p className="alert-error" role="alert">{error}</p>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={History} label="Saved runs" value={summary ? summary.savedRuns : '...'} />
        <StatTile icon={MessageSquare} label="Feedback given" value={summary ? summary.feedbackCount : '...'} />
        <StatTile icon={CalendarDays} label="Member since" value={summary ? fmtDate(summary.memberSince) : '...'} />
        <StatTile icon={LogIn} label="Last login" value={summary ? fmtDate(summary.lastLogin) : '...'} />
      </div>

      <div className="panel">
        <h3 className="mb-3 text-base font-bold text-slate-900">Latest run</h3>
        {!summary ? <div className="h-12 animate-pulse rounded-xl bg-slate-100" /> : summary.lastRun ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{summary.lastRun.modelName}</span> on {new Date(summary.lastRun.runAt).toLocaleString()} · {summary.lastRun.executionTimeRequested} s simulated
            </p>
            <Link to="/models/flood-model" className="btn-secondary self-start">Open flood model</Link>
          </div>
        ) : <p className="text-sm text-slate-500">You have not run any simulations yet.</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/models/flood-model" className="card flex items-center gap-4 p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white"><Play size={20} /></span><span><span className="block font-semibold text-slate-900">Run a simulation</span><span className="text-sm text-slate-500">Upload a hydrograph and see the flood map.</span></span></Link>
        <Link to="/assistant" className="card flex items-center gap-4 p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-800 text-brand-300"><Sparkles size={20} /></span><span><span className="block font-semibold text-slate-900">Ask the AI assistant</span><span className="text-sm text-slate-500">Get help preparing inputs or reading results.</span></span></Link>
      </div>
      {user.role === 'admin' && <p className="alert-info text-sm">You are an administrator. <Link to="/admin" className="font-semibold underline">Open the admin panel</Link>.</p>}
    </div>
  );
};

const EditProfile = ({ user, setUser }) => {
  const [name, setName] = useState(user.name || '');
  const [organization, setOrganization] = useState(user.organization || '');
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const dirty = name.trim() !== user.name || organization.trim() !== (user.organization || '');

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setStatus(null);
    try {
      const res = await updateProfile({ name, organization });
      setUser(res.data.user);
      setStatus({ ok: true, text: 'Profile updated.' });
    } catch (err) {
      setStatus({ ok: false, text: err.message || 'Could not update your profile.' });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="panel max-w-xl space-y-5">
      <h3 className="text-lg font-bold text-slate-900">Edit profile</h3>
      <div><label htmlFor="p-name" className="label">Full name</label><input id="p-name" className="input-field" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div><label htmlFor="p-org" className="label">Organization <span className="font-normal text-slate-400">(optional)</span></label><input id="p-org" className="input-field" maxLength={120} placeholder="University, company or agency" value={organization} onChange={(e) => setOrganization(e.target.value)} /></div>
      <div><label htmlFor="p-email" className="label">Email</label><input id="p-email" className="input-field" value={user.email} disabled /><p className="mt-1 text-xs text-slate-500">Your email is your login and cannot be changed here.</p></div>
      {status && <p className={status.ok ? 'alert-success' : 'alert-error'} role="status">{status.text}</p>}
      <button type="submit" disabled={saving || !dirty} className="btn-primary">{saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save changes'}</button>
    </form>
  );
};

const Security = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setStatus({ ok: false, text: 'New passwords do not match.' });
    setSaving(true); setStatus(null);
    try {
      await updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      setStatus({ ok: true, text: 'Password changed successfully.' });
    } catch (err) {
      setStatus({ ok: false, text: err.message || 'Could not change your password.' });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="panel max-w-xl space-y-5">
      <h3 className="text-lg font-bold text-slate-900">Change password</h3>
      <PasswordInput id="cur-pw" label="Current password" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} />
      <PasswordInput id="new-pw" label="New password" autoComplete="new-password" hint="8 to 72 characters." value={form.newPassword} onChange={set('newPassword')} />
      <PasswordInput id="conf-pw" label="Confirm new password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
      {status && <p className={status.ok ? 'alert-success' : 'alert-error'} role="status">{status.text}</p>}
      <button type="submit" disabled={saving} className="btn-primary">{saving ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Update password'}</button>
    </form>
  );
};

const DangerZone = ({ logout }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const remove = async (e) => {
    e.preventDefault();
    if (!window.confirm('This permanently deletes your account, saved runs and feedback. Continue?')) return;
    setBusy(true); setError('');
    try {
      await deleteAccount(password);
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not delete your account.');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={remove} className="max-w-xl space-y-5 rounded-2xl border border-red-200 bg-red-50/50 p-4 sm:p-6">
      <h3 className="text-lg font-bold text-red-800">Delete account</h3>
      <p className="text-sm text-red-900/80">This permanently removes your account, saved simulation runs and feedback. This action cannot be undone.</p>
      <PasswordInput id="del-pw" label="Confirm with your password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="alert-error" role="alert">{error}</p>}
      <button type="submit" disabled={busy || !password} className="btn-danger">{busy ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : 'Delete my account'}</button>
    </form>
  );
};

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  if (!user) return null; // ProtectedRoute guarantees a user; this keeps hooks order safe

  return (
    <div>
      <PageHeader eyebrow="Account" title="My profile">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 font-display text-2xl font-extrabold text-white shadow-lift">{initials(user.name)}</span>
          <div className="min-w-0">
            <p className="truncate text-xl font-bold text-white">{user.name}</p>
            <p className="truncate text-sm text-slate-300">{user.email}</p>
            <span className="badge mt-1.5 bg-white/15 text-brand-100">{user.role === 'admin' ? 'Administrator' : 'Researcher'}</span>
          </div>
        </div>
      </PageHeader>

      <div className="container-page py-8 sm:py-10">
        {/* Tabs: horizontally scrollable on phones */}
        <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Profile sections">
          <div className="flex w-max gap-2 border-b border-slate-200 sm:w-full">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${tab === id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'overview' && <Overview user={user} />}
        {tab === 'profile' && <EditProfile user={user} setUser={setUser} />}
        {tab === 'security' && <Security />}
        {tab === 'danger' && <DangerZone logout={logout} />}
      </div>
    </div>
  );
};

export default ProfilePage;
