import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get("http://localhost:3000/posts");
            // res.data is the array of posts from SQL Server
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

    return (
        <main className="page-container">
            <div className="feed-header">
                <h2>Community Feed</h2>
                <Link to="/create-post" className="btn btn-primary btn-sm">
                    + New Post
                </Link>
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

            {!loading && !error && posts.length > 0 && (
                <section className="feed-stream" aria-label="Posts stream">
                    {posts.map((post) => {
                        const imgSrc = post.Image_Url || `http://localhost:3000/posts/${post.id}/image`;

                        return (
                            <article key={post.id} className="post-card">
                                <div className="post-card-header">
                                    <div className="post-avatar">
                                        {(post.Caption || "P").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="post-meta">
                                        <span className="post-author">User #{post.id}</span>
                                        <span className="post-timestamp">Shared via InstaLike</span>
                                    </div>
                                </div>

                                <div className="post-image-container">
                                    <img
                                        src={imgSrc}
                                        alt={post.Caption || "Post image"}
                                        loading="lazy"
                                        onError={(e) => {
                                            // Fallback if ImageKit URL ever fails
                                            if (e.target.src !== `http://localhost:3000/posts/${post.id}/image`) {
                                                e.target.src = `http://localhost:3000/posts/${post.id}/image`;
                                            }
                                        }}
                                    />
                                </div>

                                <div className="post-card-body">
                                    <div className="post-actions-bar">
                                        <button type="button" className="like-btn" aria-label="Like post">
                                            ❤️ <span>Like</span>
                                        </button>
                                        <a
                                            href={imgSrc}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="open-cdn-link"
                                            title="Open full resolution"
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
