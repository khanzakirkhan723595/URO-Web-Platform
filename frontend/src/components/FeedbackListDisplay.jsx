// src/components/FeedbackListDisplay.jsx
import { MessageSquareText, ShieldCheck } from 'lucide-react';
import { StarDisplay } from './StarRating';

const FeedbackListDisplay = ({ feedbackItems = [], isLoading, error }) => (
  <section className="panel" aria-labelledby="feedback-list-title">
    <h3 id="feedback-list-title" className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
      <MessageSquareText size={20} className="text-brand-600" /> Community feedback
      {!isLoading && !error && <span className="badge bg-slate-100 text-slate-600">{feedbackItems.length}</span>}
    </h3>

    {isLoading ? (
      <div className="space-y-3" aria-busy="true">{[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}</div>
    ) : error ? (
      <p className="alert-error" role="alert">{error}</p>
    ) : feedbackItems.length === 0 ? (
      <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No feedback yet. Be the first to share your thoughts!</p>
    ) : (
      <ul className="max-h-[28rem] space-y-4 overflow-y-auto pr-1">
        {feedbackItems.map((item) => (
          <li key={item._id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{item.user?.name || 'Anonymous'}</p>
              <StarDisplay value={item.rating} />
            </div>
            <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
            {item.comment && <p className="mt-2 break-words text-sm text-slate-700">{item.comment}</p>}
            {item.adminReply && (
              <div className="mt-3 rounded-lg border-l-4 border-brand-500 bg-brand-50 p-3 text-sm">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand-800"><ShieldCheck size={14} /> Reply from URO Flood Lab</p>
                <p className="break-words text-slate-700">{item.adminReply}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default FeedbackListDisplay;
