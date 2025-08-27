// src/components/FeedbackForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Star, Send, AlertTriangle, Edit } from 'lucide-react'; // Added Edit icon
import { useAuth } from '../context/AuthContext';
import { submitOrUpdateFeedback, getCurrentUserFeedbackForModel } from '../services/api'; // Updated API function
import { Link } from 'react-router-dom';

const FeedbackForm = ({ isLoading, modelName = "General", onFeedbackSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingFeedbackId, setExistingFeedbackId] = useState(null); // To know if we are updating
  const [formMessage, setFormMessage] = useState({ type: '', text: '' }); // For success/error messages
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // For loading existing feedback

  const loadUserFeedback = useCallback(async () => {
    if (user && modelName) {
      setInitialLoading(true);
      setFormMessage({ type: '', text: '' });
      try {
        const response = await getCurrentUserFeedbackForModel(modelName);
        if (response.status === 'success' && response.data.feedback) {
          const userFeedback = response.data.feedback;
          setRating(userFeedback.rating);
          setComment(userFeedback.comment || '');
          setExistingFeedbackId(userFeedback._id); // Mark that we found existing feedback
        } else {
          // No existing feedback, reset form for new submission
          setRating(0);
          setComment('');
          setExistingFeedbackId(null);
        }
      } catch (error) {
        console.warn("Could not load user's existing feedback:", error.message);
        // Don't show error here, allow user to submit new feedback
        setRating(0);
        setComment('');
        setExistingFeedbackId(null);
      } finally {
        setInitialLoading(false);
      }
    } else {
        setInitialLoading(false); // Not logged in or no model name
        setRating(0);
        setComment('');
        setExistingFeedbackId(null);
    }
  }, [user, modelName]);

  useEffect(() => {
    loadUserFeedback();
  }, [loadUserFeedback]); // Runs when user or modelName changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setFormMessage({ type: 'error', text: "Please log in to submit feedback." });
      return;
    }
    if (rating === 0 && !existingFeedbackId) { // Rating is required for new feedback
      setFormMessage({ type: 'error', text: "Please select a rating." });
      return;
    }
     if (rating === 0 && existingFeedbackId) { // If updating, rating must still be > 0
      setFormMessage({ type: 'error', text: "Rating cannot be zero when updating." });
      return;
    }


    setFormMessage({ type: '', text: '' });
    setSubmitting(true);
    try {
      // Backend now handles create or update based on user and modelName
      const response = await submitOrUpdateFeedback({ 
        modelName, 
        rating, 
        comment,
        // No need to send existingFeedbackId, backend logic handles it
      });

      if (response.status === 'success') {
        setFormMessage({ type: 'success', text: response.message || (existingFeedbackId ? 'Feedback updated successfully!' : 'Feedback submitted successfully!') });
        setExistingFeedbackId(response.data.feedback._id); // Update ID in case it was new
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted(); // Refresh the public list
        }
        setTimeout(() => {
            setFormMessage({ type: '', text: '' });
        }, 5000);
      } else {
         setFormMessage({ type: 'error', text: response.message || "An unknown error occurred." });
      }
    } catch (err) {
      setFormMessage({ type: 'error', text: err.message || "Failed to submit feedback. Please try again." });
      console.error("Feedback submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading && user) {
    return (
        <div className="w-full p-6 sm:p-8 bg-white shadow-xl rounded-lg text-center text-slate-500">
            Loading your feedback...
        </div>
    );
  }

  return (
    <div className="w-full p-6 sm:p-8 bg-white shadow-xl rounded-lg"> 
      <h3 className="text-2xl font-semibold text-slate-800 mb-2 text-center">
        {existingFeedbackId ? 'Update Your Feedback' : 'Share Your Feedback'}
      </h3>
       <p className="text-sm text-slate-500 text-center mb-6">
        Your insights help us improve!
      </p>

      {!user && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0"> <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden="true" /> </div>
            <div className="ml-3">
              <p className="text-sm">
                Please <Link to="/login" state={{ from: { pathname: window.location.pathname } }} className="font-medium underline hover:text-yellow-600">Login</Link> or <Link to="/signup" className="font-medium underline hover:text-yellow-600">Sign Up</Link> to share your feedback.
              </p>
            </div>
          </div>
        </div>
      )}

      {formMessage.text && (
        <div className={`p-3 rounded-md mb-4 text-sm ${
            formMessage.type === 'success' ? 'bg-green-50 text-green-700 border-l-4 border-green-400' 
                                         : 'bg-red-50 text-red-700 border-l-4 border-red-400'
        }`}>
          {formMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-6 ${!user ? 'opacity-50 pointer-events-none' : ''}`}>
        <div>
          <label className="block text-md font-medium text-slate-700 mb-2 text-center sm:text-left">
            Your Rating:
          </label>
          <div className="flex justify-center sm:justify-start space-x-1 sm:space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`cursor-pointer h-8 w-8 sm:h-10 sm:w-10 transition-all duration-150 ease-in-out transform hover:scale-110 ${
                  rating >= star 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
                onClick={() => user && setRating(star)}
                aria-label={`Rate ${star} out of 5 stars`}
              />
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="feedbackComment" className="block text-sm font-medium text-slate-700 mb-1">
            Your Comments (Optional):
          </label>
          <textarea
            id="feedbackComment"
            rows="4"
            className="input-field w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike? Any suggestions?"
            disabled={!user || submitting}
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto flex items-center justify-center py-3 px-6 text-base disabled:opacity-70"
          disabled={!user || isLoading || submitting || (rating === 0 && !existingFeedbackId)} // Disable if no rating for new feedback
        >
          {existingFeedbackId ? <Edit size={18} className="mr-2" /> : <Send size={18} className="mr-2" />}
          {submitting ? 'Submitting...' : (existingFeedbackId ? 'Update Feedback' : 'Submit Feedback')}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
