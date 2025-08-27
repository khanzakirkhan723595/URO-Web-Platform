// src/components/FeedbackListDisplay.jsx
import React from 'react';
import { MessageCircle, UserCircle, ShieldCheck, CornerDownRight } from 'lucide-react';

const FeedbackListItem = ({ feedback }) => {
  const userRating = feedback.rating || 0;
  return (
    <div className="bg-slate-50 p-4 rounded-lg shadow border border-slate-200 transition-shadow hover:shadow-md">
      <div className="flex items-start space-x-3">
        <UserCircle size={36} className="text-slate-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-slate-700">
              {feedback.user?.name || 'Anonymous User'}
            </p>
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`text-lg ${i < userRating ? 'text-yellow-400' : 'text-slate-300'}`}>
                  &#9733; {/* Star character */}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-1.5">
            {new Date(feedback.createdAt).toLocaleString()}
          </p>
          {feedback.comment ? (
            <p className="text-sm text-slate-600 leading-relaxed">{feedback.comment}</p>
          ) : (
            <p className="text-sm text-slate-500 italic">No comment provided.</p>
          )}
        </div>
      </div>

      {feedback.adminReply && (
        <div className="mt-3 pl-8 pr-2 py-2 bg-blue-50 border-l-4 border-blue-400 rounded-r-md relative">
           <CornerDownRight size={18} className="absolute left-2 top-3 text-blue-500 transform -scale-x-100" />
          <div className="flex items-center space-x-2 mb-1">
            <ShieldCheck size={18} className="text-blue-600" />
            <p className="text-xs font-semibold text-blue-700">
              Reply from {feedback.repliedBy?.name || 'Admin'}
            </p>
          </div>
          <p className="text-xs text-slate-500 mb-1">
            {new Date(feedback.repliedAt).toLocaleString()}
          </p>
          <p className="text-sm text-blue-700 leading-relaxed">{feedback.adminReply}</p>
        </div>
      )}
    </div>
  );
};

const FeedbackListDisplay = ({ feedbackItems, isLoading, error }) => {
  if (isLoading) {
    return <div className="text-center py-4 text-slate-500">Loading feedback...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600 bg-red-50 p-3 rounded-md">Error loading feedback: {error}</div>;
  }

  if (!feedbackItems || feedbackItems.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <MessageCircle size={40} className="mx-auto mb-2 text-slate-400" />
        No feedback submitted for this model yet. Be the first!
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">
        Community Feedback ({feedbackItems.length})
      </h3>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"> 
        {/* Added custom-scrollbar class if you want to style it via CSS */}
        {feedbackItems.map((feedback) => (
          <FeedbackListItem key={feedback._id} feedback={feedback} />
        ))}
      </div>
    </div>
  );
};

export default FeedbackListDisplay;
