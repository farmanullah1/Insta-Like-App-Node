import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import CommentsSection from "../components/CommentsSection";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likedPosts, setLikedPosts] = useState({});
    const [deletingId, setDeletingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [heartBurstId, setHeartBurstId] = useState(null);

    const { showToast, confirmModal } = useToast();

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get("http://localhost:3000/posts");
            setPosts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message || "Failed to load feed posts.");
            showToast("Failed to connect to backend feed", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const triggerHeartBurst = (postId) => {
        setHeartBurstId(postId);
        setTimeout(() => {
            setHeartBurstId(null);
        }, 750);
    };

    const handleLike = async (postId, triggeredByDoubleClick = false) => {
        if (triggeredByDoubleClick) {
            triggerHeartBurst(postId);
        }

        try {
            // Optimistic update
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId ? { ...p, Likes: (p.Likes || 0) + 1 } : p
                )
            );
            setLikedPosts((prev) => ({ ...prev, [postId]: true }));

            const res = await axios.patch(`http://localhost:3000/posts/${postId}/like`);
            if (res.data?.Likes !== undefined) {
                setPosts((prev) =>
                    prev.map((p) =>
                        p.id === postId ? { ...p, Likes: res.data.Likes } : p
                    )
                );
            }
            if (!triggeredByDoubleClick) {
                showToast("Post liked! ❤️", "success", 2000);
            }
        } catch (err) {
            console.error("Error liking post:", err);
            showToast("Could not like post right now", "error");
        }
    };

    const handleDelete = async (postId) => {
        const confirmed = await confirmModal({
            title: "Delete Post",
            message: "Are you sure you want to delete this post? This action will permanently remove it.",
            confirmText: "Delete",
            cancelText: "Keep",
            type: "danger",
        });

        if (!confirmed) return;

        try {
            setDeletingId(postId);
            await axios.delete(`http://localhost:3000/posts/${postId}`);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            showToast("Post deleted successfully", "info");
        } catch (err) {
            console.error("Error deleting post:", err);
            showToast(err.response?.data?.error || "Failed to delete post.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const handleShare = (post) => {
        const postUrl = window.location.href;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(postUrl);
            showToast("Post link copied to clipboard! 📋", "info");
        } else {
            showToast("Link ready to share!", "info");
        }
    };

    const filtered = posts.filter((post) =>
        (post.Caption || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedPosts = [...filtered].sort((a, b) => {
        if (sortBy === "most_liked") {
            return (b.Likes || 0) - (a.Likes || 0);
        }
        if (sortBy === "oldest") {
            return (a.id || 0) - (b.id || 0);
        }
        return (b.id || 0) - (a.id || 0);
    });

    return (
        <main className="max-w-xl mx-auto w-full px-4 py-6 pb-20 flex-1">
            {/* Header & Quick Action */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight m-0">
                        Community Feed
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {posts.length} {posts.length === 1 ? "moment" : "moments"} shared so far
                    </p>
                </div>
                <Link
                    to="/create-post"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm hover:opacity-95 transition-all duration-150 active:scale-95"
                >
                    + New Post
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3.5">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                    🔍
                </span>
                <input
                    type="text"
                    placeholder="Search posts by caption..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700/60 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all placeholder:text-slate-400"
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm p-1"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Filter and Stats Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-5 px-1 flex-wrap gap-2">
                <span>
                    Showing {sortedPosts.length} of {posts.length} {posts.length === 1 ? "post" : "posts"}
                </span>
                <div className="flex items-center gap-2">
                    <span>Sort:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-1 px-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                    >
                        <option value="newest">🕒 Latest First</option>
                        <option value="most_liked">🔥 Most Liked</option>
                        <option value="oldest">📅 Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div className="py-20 text-center text-slate-500 dark:text-slate-400">
                    <div className="w-9 h-9 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm">Loading your feed moments...</p>
                </div>
            )}

            {/* Error Banner */}
            {error && !loading && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm mb-6 flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div className="flex-1">
                        <strong className="block font-semibold">Connection Error:</strong>
                        <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                            {error}. Ensure backend is active at http://localhost:3000.
                        </p>
                        <button
                            onClick={fetchPosts}
                            className="mt-2.5 px-3 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 shadow-xs"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && posts.length === 0 && (
                <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/40 shadow-xs">
                    <div className="text-5xl mb-3">📷</div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                        No Posts Yet
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
                        Be the first one to capture and share a moment with the community!
                    </p>
                    <Link
                        to="/create-post"
                        className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:opacity-95 transition-all"
                    >
                        Create Your First Post
                    </Link>
                </div>
            )}

            {/* No Search Results State */}
            {!loading && !error && posts.length > 0 && sortedPosts.length === 0 && (
                <div className="p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/40">
                    <div className="text-4xl mb-2">🔎</div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        No Matching Posts
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        No posts found matching "{searchTerm}".
                    </p>
                    <button
                        onClick={() => setSearchTerm("")}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200"
                    >
                        Clear Search
                    </button>
                </div>
            )}

            {/* Post Feed Cards */}
            {!loading && !error && sortedPosts.length > 0 && (
                <section className="flex flex-col gap-6" aria-label="Posts stream">
                    {sortedPosts.map((post) => {
                        const imgSrc = post.Image_Url || `http://localhost:3000/posts/${post.id}/image`;
                        const isLiked = Boolean(likedPosts[post.id]);
                        const isDeleting = deletingId === post.id;

                        const formattedDate = post.CreatedAt
                            ? new Date(post.CreatedAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })
                            : "Recently shared";

                        return (
                            <article
                                key={post.id}
                                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200"
                            >
                                {/* Post Author Header */}
                                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                                            {(post.Caption || "P").charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                User #{post.id}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                {formattedDate}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons (Edit / Delete) */}
                                    <div className="flex items-center gap-1.5">
                                        <Link
                                            to={`/edit-post/${post.id}`}
                                            className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                                            title="Edit post"
                                        >
                                            ✏️ Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(post.id)}
                                            disabled={isDeleting}
                                            className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
                                            title="Delete post"
                                        >
                                            {isDeleting ? "..." : "🗑️ Delete"}
                                        </button>
                                    </div>
                                </div>

                                {/* Post Image with Double-Tap to Like */}
                                <div
                                    className="relative w-full bg-slate-950 flex items-center justify-center min-h-[260px] max-h-[520px] overflow-hidden cursor-pointer select-none"
                                    onDoubleClick={() => handleLike(post.id, true)}
                                    title="Double click photo to like!"
                                >
                                    <img
                                        src={imgSrc}
                                        alt={post.Caption || "Post image"}
                                        loading="lazy"
                                        className="w-full h-full object-cover max-h-[520px]"
                                        onError={(e) => {
                                            if (e.target.src !== `http://localhost:3000/posts/${post.id}/image`) {
                                                e.target.src = `http://localhost:3000/posts/${post.id}/image`;
                                            }
                                        }}
                                    />
                                    {heartBurstId === post.id && (
                                        <div className="like-burst">❤️</div>
                                    )}
                                </div>

                                {/* Post Footer / Actions */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleLike(post.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                    isLiked
                                                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                                                        : "bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-700"
                                                }`}
                                                aria-label="Like post"
                                            >
                                                <span>{isLiked ? "❤️" : "🤍"}</span>
                                                <strong>{post.Likes || 0}</strong>
                                                <span>{post.Likes === 1 ? "like" : "likes"}</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleShare(post)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                                                title="Copy share link"
                                            >
                                                📤 Share
                                            </button>
                                        </div>

                                        <a
                                            href={imgSrc}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
                                            title="Open full resolution in ImageKit"
                                        >
                                            🔗 View Original
                                        </a>
                                    </div>

                                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">
                                        <strong className="font-semibold text-slate-900 dark:text-white mr-1.5">
                                            User #{post.id}
                                        </strong>
                                        {post.Caption}
                                    </p>

                                    {/* Comments Section (Full CRUD) */}
                                    <CommentsSection postId={post.id} />
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}
        </main>
    );
};

export default Feed;
