import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likedPosts, setLikedPosts] = useState({});
    const [deletingId, setDeletingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'most_liked'
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

            // Backend request
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

    // Filter posts by search term
    const filtered = posts.filter((post) =>
        (post.Caption || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort posts
    const sortedPosts = [...filtered].sort((a, b) => {
        if (sortBy === "most_liked") {
            return (b.Likes || 0) - (a.Likes || 0);
        }
        if (sortBy === "oldest") {
            return (a.id || 0) - (b.id || 0);
        }
        // default newest
        return (b.id || 0) - (a.id || 0);
    });

    return (
        <main className="page-container">
            <div className="feed-header">
                <div>
                    <h2>Community Feed</h2>
                    <span className="feed-stats-badge">
                        {posts.length} {posts.length === 1 ? "post" : "posts"} shared
                    </span>
                </div>
                <Link to="/create-post" className="btn btn-primary btn-sm">
                    + New Post
                </Link>
            </div>

            {/* Search and Sort Filter Bar */}
            <div className="feed-search-box">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search posts by caption..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="feed-search-input"
                />
                {searchTerm && (
                    <button
                        type="button"
                        className="clear-search-btn"
                        onClick={() => setSearchTerm("")}
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="feed-filter-bar">
                <span className="feed-stats-badge">
                    Showing {sortedPosts.length} of {posts.length} results
                </span>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                    <span>Sort:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="feed-sort-select"
                    >
                        <option value="newest">🕒 Latest First</option>
                        <option value="most_liked">🔥 Most Liked</option>
                        <option value="oldest">📅 Oldest First</option>
                    </select>
                </label>
            </div>

            {loading && (
                <div className="feed-status-container">
                    <div className="feed-spinner"></div>
                    <p>Loading your feed moments...</p>
                </div>
            )}

            {error && !loading && (
                <div className="alert-banner error" role="alert">
                    <span>⚠️</span>
                    <div>
                        <strong>Connection Error:</strong>
                        <p>{error} Ensure your backend is running at http://localhost:3000.</p>
                        <button onClick={fetchPosts} className="btn btn-secondary btn-sm" style={{ marginTop: "8px" }}>
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {!loading && !error && posts.length === 0 && (
                <div className="empty-state-card">
                    <div className="empty-icon">📷</div>
                    <h3>No Posts Yet</h3>
                    <p>Be the first one to share a moment with the community!</p>
                    <Link to="/create-post" className="btn btn-primary">
                        Create Your First Post
                    </Link>
                </div>
            )}

            {!loading && !error && posts.length > 0 && sortedPosts.length === 0 && (
                <div className="empty-state-card">
                    <div className="empty-icon">🔎</div>
                    <h3>No Matching Posts</h3>
                    <p>No posts found containing "{searchTerm}".</p>
                    <button onClick={() => setSearchTerm("")} className="btn btn-secondary btn-sm">
                        Clear Search
                    </button>
                </div>
            )}

            {!loading && !error && sortedPosts.length > 0 && (
                <section className="feed-stream" aria-label="Posts stream">
                    {sortedPosts.map((post) => {
                        const imgSrc = post.Image_Url || `http://localhost:3000/posts/${post.id}/image`;
                        const isLiked = Boolean(likedPosts[post.id]);
                        const isDeleting = deletingId === post.id;

                        // Format timestamp nicely if present
                        const formattedDate = post.CreatedAt
                            ? new Date(post.CreatedAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })
                            : "Recently shared";

                        return (
                            <article key={post.id} className="post-card">
                                <div className="post-card-header">
                                    <div className="post-avatar">
                                        {(post.Caption || "P").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="post-meta">
                                        <span className="post-author">User #{post.id}</span>
                                        <span className="post-timestamp">{formattedDate}</span>
                                    </div>

                                    {/* Action Buttons (Edit & Delete) */}
                                    <div className="post-header-actions">
                                        <Link
                                            to={`/edit-post/${post.id}`}
                                            className="icon-action-btn edit"
                                            title="Edit post caption or photo"
                                        >
                                            ✏️ Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(post.id)}
                                            disabled={isDeleting}
                                            className="icon-action-btn delete"
                                            title="Delete post"
                                        >
                                            {isDeleting ? "..." : "🗑️ Delete"}
                                        </button>
                                    </div>
                                </div>

                                {/* Post Image with Double-Tap to Like */}
                                <div
                                    className="post-image-container post-image-wrapper"
                                    onDoubleClick={() => handleLike(post.id, true)}
                                    title="Double click photo to like!"
                                >
                                    <img
                                        src={imgSrc}
                                        alt={post.Caption || "Post image"}
                                        loading="lazy"
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

                                <div className="post-card-body">
                                    <div className="post-actions-bar">
                                        <div className="left-actions" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <button
                                                type="button"
                                                onClick={() => handleLike(post.id)}
                                                className={`like-btn ${isLiked ? "liked" : ""}`}
                                                aria-label="Like post"
                                            >
                                                <span>{isLiked ? "❤️" : "🤍"}</span>
                                                <strong>{post.Likes || 0}</strong>
                                                <span>{post.Likes === 1 ? "like" : "likes"}</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleShare(post)}
                                                className="share-btn"
                                                title="Copy share link"
                                            >
                                                📤 Share
                                            </button>
                                        </div>

                                        <a
                                            href={imgSrc}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="open-cdn-link"
                                            title="Open full resolution in ImageKit"
                                        >
                                            🔗 View Original
                                        </a>
                                    </div>

                                    <p className="post-caption-text">
                                        <strong>User #{post.id}</strong> {post.Caption}
                                    </p>
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
