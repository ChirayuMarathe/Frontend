import React, { useState } from "react";
import { BsX, BsStarFill, BsStar, BsChatLeftText, BsCheck2Circle } from "react-icons/bs";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function FeedbackModal({ isOpen, onClose, sessionId }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("chat_feedback").insert({
        user_id: user?.id,
        session_id: sessionId,
        rating,
        feedback,
        created_at: new Date().toISOString(),
      });

      if (error) {
        if (error.code === '42P01') {
          throw new Error("Feedback table not found. Please run the database setup script.");
        }
        if (error.code === '42501') {
          throw new Error("Permission denied. Row-level security is blocking the request.");
        }
        throw error;
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRating(0);
        setFeedback("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0E1117] border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#161B22]/50">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BsChatLeftText className="text-teal-400" />
            Rate your experience
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <BsX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
                <BsCheck2Circle className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Thank you!</h3>
              <p className="text-sm text-gray-400">Your feedback helps us improve Dabby.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-gray-400 font-medium">How was your conversation with Dabby?</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      {star <= rating ? (
                        <BsStarFill className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
                      ) : (
                        <BsStar className="w-8 h-8 text-gray-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Any issues or suggestions?
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what went well or what we can improve..."
                  className="w-full bg-[#161B22] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/50 transition-colors min-h-[120px] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full py-3 bg-teal-500 text-black text-sm font-bold rounded-lg hover:bg-teal-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,184,166,0.2)]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
