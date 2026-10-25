// src/pages/AssistantPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Sparkles, Loader2, Bot, User as UserIcon, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AiText from '../components/AiText';
import { aiChat } from '../services/api';
import { useAiEnabled } from '../hooks/useAiEnabled';

const SUGGESTIONS = [
  'What should my Hydrograph.txt contain?',
  'What does HMAX mean in the output?',
  'How long should I set the simulation duration?',
  'How do I read the flood map colours?',
];

const AssistantPage = () => {
  const aiEnabled = useAiEnabled();
  const location = useLocation();
  const context = location.state?.context || null; // result stats passed from the model page
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, loading]);

  const send = async (text) => {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user', content }];
    setMessages(next); setInput(''); setError(''); setLoading(true);
    try {
      const res = await aiChat({ messages: next.slice(-10), context });
      setMessages([...next, { role: 'assistant', content: res.data.reply }]);
    } catch (e) {
      setError(e.message || 'The assistant could not answer right now.');
    } finally { setLoading(false); }
  };

  const onSubmit = (e) => { e.preventDefault(); send(input); };
  const onKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } };

  return (
    <div>
      <PageHeader eyebrow="AI" title="Flood Lab assistant" description="Ask about preparing input files, choosing a duration, or understanding your results." />
      <div className="container-page py-6 sm:py-10">
        {!aiEnabled && (
          <div className="alert-warn mb-6">
            The AI assistant is not enabled on this server. The administrator needs to set <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code> in the backend <code className="rounded bg-amber-100 px-1">.env</code> file.
          </div>
        )}
        {context && <div className="alert-info mb-4 text-sm">Using the statistics from your latest simulation (max depth {context.maxHmax} m, {context.floodedPercent}% wet area) as context.</div>}

        <div className="panel flex h-[70vh] min-h-[28rem] flex-col p-0 sm:p-0">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Sparkles size={26} /></span>
                <p className="font-semibold text-slate-800">How can I help with your flood modelling?</p>
                <div className="mt-5 flex max-w-xl flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" disabled={!aiEnabled} onClick={() => send(s)} className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:border-brand-400 hover:text-brand-700 disabled:opacity-50 sm:text-sm">{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-navy-800 text-brand-300'}`}>
                  {m.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                </span>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-brand-600 text-sm text-white' : 'border border-slate-200 bg-slate-50'}`}>
                  {m.role === 'user' ? <p className="whitespace-pre-wrap break-words">{m.content}</p> : <AiText text={m.content} />}
                </div>
              </div>
            ))}

            {loading && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Thinking...</div>}
            {error && <p className="alert-error" role="alert">{error}</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={onSubmit} className="border-t border-slate-200 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <label htmlFor="chat-input" className="sr-only">Your question</label>
              <textarea id="chat-input" rows={1} maxLength={1500} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown}
                placeholder="Ask a question... (Enter to send, Shift+Enter for a new line)" disabled={!aiEnabled || loading}
                className="input-field max-h-32 min-h-[2.75rem] resize-none" />
              {messages.length > 0 && <button type="button" onClick={() => { setMessages([]); setError(''); }} className="btn-secondary h-11 px-3" aria-label="Clear conversation" title="Clear"><Trash2 size={16} /></button>}
              <button type="submit" disabled={!aiEnabled || loading || !input.trim()} className="btn-primary h-11 px-4" aria-label="Send"><Send size={16} /></button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">AI answers can contain mistakes. Do not use them as official flood warnings or for safety-critical decisions.</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
