import React, { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const CommentsSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [author, setAuthor] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const { showToast, confirmModal } = useToast();

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:3000/posts/${postId}/comments`);
            setComments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchComments();
        }
    }, [open, postId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            const payload = {
                text: newComment.trim(),
                author: author.trim() || undefined,
            };

            const res = await axios.post(`http://localhost:3000/posts/${postId}/comments`, payload);
            if (res.status === 201) {
                setComments((prev) => [...prev, res.data]);
                setNewComment("");
                showToast("Comment added! 💬", "success", 1500);
            }
        } catch (err) {
            console.error("Error adding comment:", err);
            showToast("Failed to add comment.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const confirmed = await confirmModal({
            title: "Delete Comment",
            message: "Do you want to delete this comment?",
            confirmText: "Delete",
            cancelText: "Keep",
            type: "danger",
        });

        if (!confirmed) return;

        try {
            setDeletingId(commentId);
            await axios.delete(`http://localhost:3000/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            showToast("Comment deleted", "info", 1500);
        } catch (err) {
            console.error("Error deleting comment:", err);
            showToast("Failed to delete comment", "error");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            {/* Toggle Comments Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors cursor-pointer"
            >
                <span>💬</span>
                <span>
                    {open
                        ? "Hide Comments"
                        : comments.length > 0
                        ? `View ${comments.length} comments`
                        : "Write a comment..."}
                </span>
            </button>

            {/* Expandable Comments Drawer */}
            {open && (
                <div className="mt-3 space-y-3">
                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Your Name (optional)"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-1/3 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-400"
                            />
                            <input
                                type="text"
                                placeholder="Add a thoughtful comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-400"
                                required
                            />
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                                {submitting ? "..." : "Post"}
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    {loading ? (
                        <div className="text-center py-2 text-xs text-slate-400">Loading comments...</div>
                    ) : comments.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-1">No comments yet. Start the conversation!</p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {comments.map((c) => (
                                <div
                                    key={c.id}
                                    className="group flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-xs"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                {c.Author || "Community Member"}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {c.CreatedAt
                                                    ? new Date(c.CreatedAt).toLocaleTimeString([], {
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                      })
                                                    : ""}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 mt-0.5 m-0 leading-relaxed">
                                            {c.Text}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteComment(c.id)}
                                        disabled={deletingId === c.id}
                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1 text-[11px] cursor-pointer"
                                        title="Delete comment"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentsSection;
