// src/pages/AdminPage.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { LayoutDashboard, MessageSquare, Users, Inbox, Sparkles, Loader2, Search, Eye, Globe, UserCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AiText from '../components/AiText';
import { StarDisplay } from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useAiEnabled } from '../hooks/useAiEnabled';
import {
  getAdminDashboardStats, getAllFeedbackAdmin, replyToFeedbackAdmin, updateFeedbackStatusAdmin,
  getAllUsersAdmin, updateUserRoleAdmin, getContactMessagesAdmin, updateContactStatusAdmin, aiSummarizeFeedback,
} from '../services/api';

// Complete class names (not built dynamically) so Tailwind can find them.
const TONES = {
  blue: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
};

const StatCard = ({ title, value, icon: Icon, tone = 'blue' }) => (
  <div className="panel flex items-center gap-4">
    <span className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}><Icon size={22} /></span>
    <div className="min-w-0">
      <p className="truncate text-sm text-slate-500">{title}</p>
      <p className="font-display text-2xl font-extrabold tabular-nums text-slate-900">{value ?? 'N/A'}</p>
    </div>
  </div>
);

const STATUS_TONE = { new: 'bg-blue-100 text-blue-800', seen: 'bg-slate-100 text-slate-700', replied: 'bg-emerald-100 text-emerald-800', archived: 'bg-slate-200 text-slate-600', read: 'bg-slate-100 text-slate-700' };

const FeedbackItem = ({ item, onReply, onStatus }) => {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState(item.adminReply || '');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try { await onReply(item._id, text.trim()); setReplying(false); } finally { setBusy(false); }
  };

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{item.user?.name || 'Unknown'} <span className="font-normal text-slate-500">· {item.user?.email}</span></p>
          <p className="text-xs text-slate-500">{item.modelName} · {new Date(item.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3"><StarDisplay value={item.rating} /><span className={`badge ${STATUS_TONE[item.status]}`}>{item.status}</span></div>
      </div>
      {item.comment && <p className="mt-3 break-words text-sm text-slate-700">{item.comment}</p>}
      {item.adminReply && !replying && <div className="mt-3 rounded-lg border-l-4 border-brand-500 bg-brand-50 p-3 text-sm"><p className="text-xs font-semibold text-brand-800">Your reply</p><p className="break-words text-slate-700">{item.adminReply}</p></div>}

      {replying ? (
        <div className="mt-3 space-y-2">
          <label htmlFor={`reply-${item._id}`} className="sr-only">Reply</label>
          <textarea id={`reply-${item._id}`} rows={3} maxLength={2000} className="input-field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply that will be shown publicly..." />
          <div className="flex gap-2">
            <button type="button" disabled={busy || !text.trim()} onClick={send} className="btn-primary px-3 py-2 text-xs">{busy ? 'Sending...' : 'Send reply'}</button>
            <button type="button" onClick={() => setReplying(false)} className="btn-secondary px-3 py-2 text-xs">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setReplying(true)} className="btn-secondary px-3 py-1.5 text-xs">{item.adminReply ? 'Edit reply' : 'Reply'}</button>
          <label className="sr-only" htmlFor={`st-${item._id}`}>Status</label>
          <select id={`st-${item._id}`} value={item.status} onChange={(e) => onStatus(item._id, e.target.value)} className="input-field w-auto py-1.5 text-xs">
            {['new', 'seen', 'replied', 'archived'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
    </li>
  );
};

const AdminPage = () => {
  const { user } = useAuth();
  const aiEnabled = useAiEnabled();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [fbFilter, setFbFilter] = useState('all');
  const [aiSummary, setAiSummary] = useState('');
  const [aiBusy, setAiBusy] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [s, f, u, m] = await Promise.all([getAdminDashboardStats(), getAllFeedbackAdmin(), getAllUsersAdmin(), getContactMessagesAdmin()]);
      setStats(s.data); setFeedbacks(f.data.feedbacks); setUsers(u.data.users); setMessages(m.data.messages);
    } catch (e) {
      setError(e.message || 'Could not load admin data.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const replaceFeedback = (fb) => setFeedbacks((prev) => prev.map((x) => (x._id === fb._id ? fb : x)));

  const handleReply = async (id, text) => {
    try { const r = await replyToFeedbackAdmin(id, text); replaceFeedback(r.data.feedback); } catch (e) { setError(e.message); throw e; }
  };
  const handleStatus = async (id, status) => {
    try { const r = await updateFeedbackStatusAdmin(id, status); replaceFeedback(r.data.feedback); } catch (e) { setError(e.message); }
  };
  const handleRole = async (u, role) => {
    try { const r = await updateUserRoleAdmin(u._id, role); setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, ...r.data.user } : x))); } catch (e) { setError(e.message); }
  };
  const handleMessageStatus = async (id, status) => {
    try { const r = await updateContactStatusAdmin(id, status); setMessages((prev) => prev.map((m) => (m._id === id ? r.data.message : m))); } catch (e) { setError(e.message); }
  };
  const summarize = async () => {
    setAiBusy(true); setAiSummary(''); setError('');
    try { const r = await aiSummarizeFeedback(); setAiSummary(r.data.summary); } catch (e) { setError(e.message); } finally { setAiBusy(false); }
  };

  const shownFeedback = useMemo(() => (fbFilter === 'all' ? feedbacks : feedbacks.filter((f) => f.status === fbFilter)), [feedbacks, fbFilter]);
  const shownUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    return q ? users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) : users;
  }, [users, userQuery]);
  const unreadMessages = messages.filter((m) => m.status === 'new').length;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, count: feedbacks.filter((f) => f.status === 'new').length },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: Inbox, count: unreadMessages },
  ];

  return (
    <div>
      <PageHeader eyebrow="Administration" title="Admin panel" description={`Signed in as ${user?.name}.`} />
      <div className="container-page py-8">
        <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
          <div className="flex w-max gap-2 border-b border-slate-200 sm:w-full">
            {TABS.map(({ id, label, icon: Icon, count }) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${tab === id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Icon size={16} /> {label}
                {count > 0 && <span className="badge bg-brand-600 text-white">{count}</span>}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="alert-error mb-6" role="alert">{error}</p>}
        {loading ? <div className="space-y-4" aria-busy="true">{[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200/60" />)}</div> : (
          <>
            {tab === 'overview' && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard title="Total page views" value={stats?.totalPageHits?.toLocaleString()} icon={Eye} tone="blue" />
                <StatCard title="Unique visitors (IPs)" value={stats?.totalUniqueIPs?.toLocaleString()} icon={Globe} tone="violet" />
                <StatCard title="Registered users" value={stats?.totalRegisteredUsers?.toLocaleString()} icon={UserCheck} tone="green" />
                <StatCard title="Feedback items" value={stats?.totalFeedbackItems} icon={MessageSquare} tone="amber" />
                <StatCard title="New feedback" value={stats?.newFeedbackItems} icon={MessageSquare} tone="blue" />
                <StatCard title="Unread messages" value={stats?.newMessages} icon={Inbox} tone="green" />
              </div>
            )}

            {tab === 'feedback' && (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <label htmlFor="fb-filter" className="text-sm font-medium text-slate-600">Show</label>
                    <select id="fb-filter" value={fbFilter} onChange={(e) => setFbFilter(e.target.value)} className="input-field w-auto py-2 text-sm">
                      {['all', 'new', 'seen', 'replied', 'archived'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {aiEnabled && (
                    <button type="button" onClick={summarize} disabled={aiBusy} className="btn-primary self-start">
                      {aiBusy ? <><Loader2 size={16} className="animate-spin" /> Analysing...</> : <><Sparkles size={16} /> AI summary of feedback</>}
                    </button>
                  )}
                </div>
                {aiSummary && <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5"><p className="mb-2 flex items-center gap-2 font-semibold text-brand-900"><Sparkles size={16} /> AI feedback summary</p><AiText text={aiSummary} /></div>}
                {shownFeedback.length === 0 ? <p className="panel text-center text-slate-500">No feedback in this view.</p> : (
                  <ul className="space-y-4">{shownFeedback.map((f) => <FeedbackItem key={f._id} item={f} onReply={handleReply} onStatus={handleStatus} />)}</ul>
                )}
              </div>
            )}

            {tab === 'users' && (
              <div className="space-y-4">
                <div className="relative max-w-sm">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <label htmlFor="user-search" className="sr-only">Search users</label>
                  <input id="user-search" className="input-field pl-9" placeholder="Search name or email" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
                </div>
                <div className="table-wrap bg-white">
                  <table className="table-clean">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th className="text-right">Action</th></tr></thead>
                    <tbody>
                      {shownUsers.map((u) => (
                        <tr key={u._id}>
                          <td className="font-medium text-slate-900">{u.name}</td>
                          <td className="text-slate-600">{u.email}</td>
                          <td><span className={`badge ${u.role === 'admin' ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-700'}`}>{u.role}</span></td>
                          <td className="whitespace-nowrap text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="text-right">
                            {u._id === user?._id ? <span className="text-xs text-slate-400">You</span> : (
                              <button type="button" onClick={() => handleRole(u, u.role === 'admin' ? 'user' : 'admin')} className="btn-secondary px-3 py-1.5 text-xs">{u.role === 'admin' ? 'Make user' : 'Make admin'}</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {shownUsers.length === 0 && <p className="text-center text-sm text-slate-500">No users match your search.</p>}
              </div>
            )}

            {tab === 'messages' && (
              messages.length === 0 ? <p className="panel text-center text-slate-500">No contact messages yet.</p> : (
                <ul className="space-y-4">
                  {messages.map((m) => (
                    <li key={m._id} className={`rounded-2xl border bg-white p-4 shadow-soft sm:p-5 ${m.status === 'new' ? 'border-brand-300' : 'border-slate-200'}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{m.name} {m.organization && <span className="font-normal text-slate-500">· {m.organization}</span>}</p>
                          <a href={`mailto:${m.email}`} className="break-all text-sm text-brand-700 hover:underline">{m.email}</a>
                        </div>
                        <div className="text-right"><span className={`badge ${STATUS_TONE[m.status]}`}>{m.status}</span><p className="mt-1 text-xs text-slate-400">{new Date(m.createdAt).toLocaleString()}</p></div>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-700">{m.message}</p>
                      <div className="mt-4 flex gap-2">
                        {m.status !== 'read' && <button type="button" onClick={() => handleMessageStatus(m._id, 'read')} className="btn-secondary px-3 py-1.5 text-xs">Mark as read</button>}
                        {m.status !== 'archived' && <button type="button" onClick={() => handleMessageStatus(m._id, 'archived')} className="btn-secondary px-3 py-1.5 text-xs">Archive</button>}
                      </div>
                    </li>
                  ))}
                </ul>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
