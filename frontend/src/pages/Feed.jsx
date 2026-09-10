import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likedPosts, setLikedPosts] = useState({});
    const [deletingId, setDeletingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get("http://localhost:3000/posts");
            setPosts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message || "Failed to load feed posts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleLike = async (postId) => {
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
        } catch (err) {
            console.error("Error liking post:", err);
        }
    };

    const handleDelete = async (postId) => {
        const confirmed = window.confirm("Are you sure you want to delete this post? This action cannot be undone.");
        if (!confirmed) return;

        try {
            setDeletingId(postId);
            await axios.delete(`http://localhost:3000/posts/${postId}`);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
        } catch (err) {
            console.error("Error deleting post:", err);
            alert(err.response?.data?.error || "Failed to delete post.");
        } finally {
            setDeletingId(null);
        }
    };

    // Filter posts by search term
    const filteredPosts = posts.filter((post) =>
        (post.Caption || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="page-container">
            <div className="feed-header">
                <h2>Community Feed</h2>
                <Link to="/create-post" className="btn btn-primary btn-sm">
                    + New Post
                </Link>
            </div>

            {/* Search Bar */}
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

            {!loading && !error && posts.length > 0 && filteredPosts.length === 0 && (
                <div className="empty-state-card">
                    <div className="empty-icon">🔎</div>
                    <h3>No Matching Posts</h3>
                    <p>No posts found containing "{searchTerm}".</p>
                    <button onClick={() => setSearchTerm("")} className="btn btn-secondary btn-sm">
                        Clear Search
                    </button>
                </div>
            )}

            {!loading && !error && filteredPosts.length > 0 && (
                <section className="feed-stream" aria-label="Posts stream">
                    {filteredPosts.map((post) => {
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

                                <div className="post-image-container">
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
                                </div>

                                <div className="post-card-body">
                                    <div className="post-actions-bar">
                                        <div className="left-actions">
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
