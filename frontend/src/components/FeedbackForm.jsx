// src/components/FeedbackForm.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUserFeedbackForModel, submitOrUpdateFeedback } from '../services/api';
import StarRating from './StarRating';
import { Loader2, MessageSquarePlus } from 'lucide-react';

const FeedbackForm = ({ isLoading = false, modelName = 'General', onFeedbackSubmitted }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasExisting, setHasExisting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [submitting, setSubmitting] = useState(false);

  // Load the user's previous feedback (if any) so the form switches to "update" mode
  const loadOwnFeedback = useCallback(async () => {
    if (!user) { setRating(0); setComment(''); setHasExisting(false); return; }
    try {
      const res = await getCurrentUserFeedbackForModel(modelName);
      const fb = res.data?.feedback;
      setHasExisting(Boolean(fb));
      setRating(fb?.rating || 0);
      setComment(fb?.comment || '');
    } catch {
      /* silently ignore: the form still works for a new submission */
    }
  }, [user, modelName]);

  useEffect(() => { loadOwnFeedback(); }, [loadOwnFeedback]);

  // Hide the status message after 5 seconds (and clean up the timer)
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return setMessage({ type: 'error', text: 'Please choose a star rating.' });
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await submitOrUpdateFeedback({ modelName, rating, comment: comment.trim() });
      setHasExisting(true);
      setMessage({ type: 'success', text: res.message || 'Thank you for your feedback!' });
      onFeedbackSubmitted?.();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Could not submit feedback.' });
    } finally {
      setSubmitting(false);
    }
  };

  const guest = !user;

  return (
    <section className="panel" aria-labelledby="feedback-title">
      <h3 id="feedback-title" className="mb-1 flex items-center gap-2 text-lg font-bold text-slate-900">
        <MessageSquarePlus size={20} className="text-brand-600" /> {hasExisting ? 'Update your feedback' : 'Share your feedback'}
      </h3>
      <p className="mb-4 text-sm text-slate-500">Help us improve the {modelName.replace(/([A-Z])/g, ' $1').trim()}.</p>

      {guest && (
        <div className="alert-warn mb-4 text-sm">
          Please <Link to="/login" state={{ from: location }} className="font-semibold underline">log in</Link> or <Link to="/signup" className="font-semibold underline">sign up</Link> to leave feedback.
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-4 ${guest ? 'pointer-events-none opacity-50' : ''}`} aria-disabled={guest}>
        <div>
          <span className="label">Your rating</span>
          <StarRating value={rating} onChange={setRating} disabled={guest || submitting} />
        </div>
        <div>
          <label htmlFor="feedback-comment" className="label">Comment <span className="font-normal text-slate-400">(optional)</span></label>
          <textarea
            id="feedback-comment" rows={4} maxLength={1000} className="input-field resize-y" placeholder="What worked well? What could be better?"
            value={comment} onChange={(e) => setComment(e.target.value)} disabled={guest || submitting}
          />
          <p className="mt-1 text-right text-xs text-slate-400">{comment.length}/1000</p>
        </div>
        {message && <div className={message.type === 'success' ? 'alert-success' : 'alert-error'} role="status">{message.text}</div>}
        <button type="submit" disabled={guest || submitting || isLoading} className="btn-primary w-full sm:w-auto">
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : hasExisting ? 'Update feedback' : 'Submit feedback'}
        </button>
      </form>
    </section>
  );
};

export default FeedbackForm;
