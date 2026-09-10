import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [activeTag, setActiveTag] = useState("all");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:3000/posts");
                setPosts(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error fetching explore posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const tags = [
        { id: "all", label: "✨ All Posts" },
        { id: "popular", label: "🔥 Trending" },
        { id: "recent", label: "🕒 Fresh" },
    ];

    const filteredPosts = [...posts].sort((a, b) => {
        if (activeTag === "popular") {
            return (b.Likes || 0) - (a.Likes || 0);
        }
        return (b.id || 0) - (a.id || 0);
    });

    return (
        <main className="max-w-4xl mx-auto w-full px-4 py-8 pb-24 flex-1">
            {/* Header */}
            <div className="mb-6 text-center sm:text-left">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight m-0">
                    Explore Gallery
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Discover visual moments and photography from across the network
                </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                {tags.map((tag) => (
                    <button
                        key={tag.id}
                        type="button"
                        onClick={() => setActiveTag(tag.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            activeTag === tag.id
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs scale-105"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                    >
                        {tag.label}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="py-20 text-center text-slate-400">
                    <div className="w-9 h-9 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm">Curating gallery...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredPosts.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="text-4xl mb-2">📸</div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        No Explore Posts Yet
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Start sharing photos to populate the gallery.</p>
                    <Link
                        to="/create-post"
                        className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700"
                    >
                        Share a Photo
                    </Link>
                </div>
            )}

            {/* Instagram Style Square 3-Column Grid */}
            {!loading && filteredPosts.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {filteredPosts.map((post) => {
                        const imgSrc = post.Image_Url || `http://localhost:3000/posts/${post.id}/image`;
                        return (
                            <div
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                className="group relative aspect-square bg-slate-900 rounded-xl overflow-hidden cursor-pointer shadow-xs"
                            >
                                <img
                                    src={imgSrc}
                                    alt={post.Caption || "Explore image"}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                                    <div className="flex justify-end">
                                        <span className="text-xs font-semibold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
                                            ❤️ {post.Likes || 0}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium line-clamp-2 m-0 drop-shadow-xs">
                                        {post.Caption}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Lightbox / Post Detail Modal */}
            {selectedPost && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setSelectedPost(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col sm:flex-row max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sm:w-3/5 bg-black flex items-center justify-center max-h-96 sm:max-h-full">
                            <img
                                src={selectedPost.Image_Url || `http://localhost:3000/posts/${selectedPost.id}/image`}
                                alt={selectedPost.Caption}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="sm:w-2/5 p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                                            {(selectedPost.Caption || "P").charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                            User #{selectedPost.id}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPost(null)}
                                        className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed m-0">
                                    {selectedPost.Caption}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4 flex items-center justify-between">
                                <span className="text-xs font-semibold text-rose-500">
                                    ❤️ {selectedPost.Likes || 0} likes
                                </span>
                                <Link
                                    to="/feed"
                                    className="text-xs font-semibold text-purple-600 hover:underline"
                                    onClick={() => setSelectedPost(null)}
                                >
                                    View in Feed →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Explore;
