// src/pages/Contact.jsx
import { useState, useEffect } from 'react';
import { MapPin, Mail, CheckCircle2, Loader2, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { sendContactMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const collaboration = [
  'Research partnerships with academic institutions',
  'Consulting services for engineering firms',
  'Technical assistance for government agencies',
  'Training and capacity building for flood management',
];

const faqs = [
  ['What types of flooding do your models address?', 'Our models address inland flooding, coastal flooding, and compound flooding that occurs when both happen simultaneously. We have specific models for each type and integrated models for comprehensive analysis.'],
  ['How can your models help with urban planning?', 'Our models can identify flood-prone areas, evaluate the effectiveness of proposed flood mitigation measures, and assess the impact of urban development on flooding patterns, helping planners make informed decisions.'],
  ['Do you provide training on using your models?', 'Yes, we offer training programmes for professionals interested in using our flood modelling tools. These can be customised to meet the specific needs of your organisation.'],
  ['Can you create custom flood models for specific regions?', 'Absolutely. We can develop and calibrate custom models for specific geographic areas based on local topography, hydrology and infrastructure data to provide accurate flood predictions.'],
];

const Contact = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', organization: '', message: '' });
  const [status, setStatus] = useState(null); // { ok, text }
  const [sending, setSending] = useState(false);

  // Pre-fill from the logged-in user once (never overwrites what the visitor already typed)
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, name: f.name || user.name || '', email: f.email || user.email || '', organization: f.organization || user.organization || '' }));
  }, [user]);

  const value = (k) => form[k];
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true); setStatus(null);
    try {
      const res = await sendContactMessage({ name: value('name'), email: value('email'), organization: value('organization'), message: form.message });
      setStatus({ ok: true, text: res.message || 'Thank you! Your message has been sent.' });
      setForm({ name: user?.name || '', email: user?.email || '', organization: user?.organization || '', message: '' });
    } catch (err) {
      setStatus({ ok: false, text: err.message || 'Could not send your message. Please try again.' });
    } finally { setSending(false); }
  };

  return (
    <div>
      <PageHeader eyebrow="Contact" title="Contact us" description="Interested in our flood modelling solutions? We'd love to hear from you and discuss how we can help with your specific needs." />

      <section className="section-padding">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-2">
            <h2 className="heading-primary">Get in touch</h2>
            <p className="mb-6 leading-relaxed text-slate-600">Whether you are a government agency, engineering firm, research institution or academic organisation, we are here to collaborate on flood modelling and mitigation strategies.</p>
            <ul className="mb-8 space-y-5">
              <li className="flex gap-4"><span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><MapPin size={20} /></span><div><p className="font-semibold text-slate-900">Address</p><p className="text-slate-600">Department of Civil Engineering<br />IIT Palakkad, Kerala, India</p></div></li>
              <li className="flex gap-4"><span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Mail size={20} /></span><div><p className="font-semibold text-slate-900">Email</p><a href="mailto:info@urofloodlab.org" className="break-all text-brand-700 hover:underline">info@urofloodlab.org</a></div></li>
            </ul>
            <h3 className="mb-3 text-lg font-bold text-brand-900">Areas of collaboration</h3>
            <ul className="space-y-3">
              {collaboration.map((c) => <li key={c} className="flex items-start gap-3 text-slate-700"><CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" />{c}</li>)}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="panel space-y-5 sm:p-8">
              <h2 className="heading-secondary mb-0">Send us a message</h2>
              {status && <div className={status.ok ? 'alert-success' : 'alert-error'} role="status">{status.text}</div>}
              <div className="grid gap-5 sm:grid-cols-2">
                <div><label htmlFor="name" className="label">Name</label><input id="name" name="name" required maxLength={100} className="input-field" value={value('name')} onChange={onChange} autoComplete="name" /></div>
                <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required className="input-field" value={value('email')} onChange={onChange} autoComplete="email" /></div>
              </div>
              <div><label htmlFor="organization" className="label">Organization <span className="font-normal text-slate-400">(optional)</span></label><input id="organization" name="organization" maxLength={150} className="input-field" value={value('organization')} onChange={onChange} autoComplete="organization" /></div>
              <div>
                <label htmlFor="message" className="label">Message</label>
                <textarea id="message" name="message" rows={6} required minLength={10} maxLength={3000} className="input-field resize-y" value={form.message} onChange={onChange} placeholder="Tell us about your project or question..." />
                <p className="mt-1 text-right text-xs text-slate-400">{form.message.length}/3000</p>
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full py-3 sm:w-auto">{sending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send message</>}</button>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-white section-padding">
        <div className="mx-auto max-w-7xl">
          <h2 className="heading-primary mb-8 text-center">Frequently asked questions</h2>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {faqs.map(([q, a]) => (
              <details key={q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-soft open:border-brand-300">
                <summary className="cursor-pointer list-none font-semibold text-brand-900 marker:content-none">
                  <span className="flex items-start justify-between gap-3">{q}<span className="mt-1 text-brand-500 transition-transform group-open:rotate-45">+</span></span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
