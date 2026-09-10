import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Profile = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bio, setBio] = useState(() => localStorage.getItem("user_bio") || "Photographer & Digital Creator ✨ Sharing favorite moments with the InstaLike community.");
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioDraft, setBioDraft] = useState(bio);
    const [username] = useState("creative_user");

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:3000/posts");
                setPosts(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error fetching profile posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, []);

    const handleSaveBio = (e) => {
        e.preventDefault();
        setBio(bioDraft);
        localStorage.setItem("user_bio", bioDraft);
        setIsEditingBio(false);
    };

    const totalLikes = posts.reduce((sum, p) => sum + (p.Likes || 0), 0);

    return (
        <main className="max-w-3xl mx-auto w-full px-4 py-8 pb-24 flex-1">
            {/* Profile Header Card */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar with Gradient Ring */}
                    <div className="relative p-1 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-500 shadow-md">
                        <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold">
                            📸
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 m-0">
                                    @{username}
                                </h2>
                                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                                    Community Creator
                                </span>
                            </div>
                            <Link
                                to="/create-post"
                                className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs hover:opacity-95 self-center sm:self-auto"
                            >
                                + Share Photo
                            </Link>
                        </div>

                        {/* Stats Counts */}
                        <div className="flex items-center justify-center sm:justify-start gap-6 py-2 my-2 border-y border-slate-100 dark:border-slate-700 text-center sm:text-left">
                            <div>
                                <strong className="block text-base font-bold text-slate-900 dark:text-slate-100">
                                    {posts.length}
                                </strong>
                                <span className="text-xs text-slate-500">Posts</span>
                            </div>
                            <div>
                                <strong className="block text-base font-bold text-slate-900 dark:text-slate-100">
                                    {totalLikes}
                                </strong>
                                <span className="text-xs text-slate-500">Likes Earned</span>
                            </div>
                            <div>
                                <strong className="block text-base font-bold text-slate-900 dark:text-slate-100">
                                    1.2k
                                </strong>
                                <span className="text-xs text-slate-500">Followers</span>
                            </div>
                        </div>

                        {/* Bio & Editable Profile Description */}
                        {isEditingBio ? (
                            <form onSubmit={handleSaveBio} className="mt-3 flex flex-col gap-2">
                                <textarea
                                    value={bioDraft}
                                    onChange={(e) => setBioDraft(e.target.value)}
                                    rows="2"
                                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    placeholder="Tell the community about yourself..."
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingBio(false)}
                                        className="px-3 py-1 text-xs rounded-lg text-slate-600 bg-slate-100 dark:bg-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600 text-white"
                                    >
                                        Save Bio
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 flex items-start justify-between gap-2">
                                <p className="m-0 leading-relaxed">{bio}</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBioDraft(bio);
                                        setIsEditingBio(true);
                                    }}
                                    className="text-purple-600 hover:underline flex-shrink-0 text-xs cursor-pointer"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Posts Grid Title */}
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Uploaded Moments
                </h3>
                <span className="text-xs text-slate-400">{posts.length} photos</span>
            </div>

            {/* User Uploads Grid */}
            {loading ? (
                <div className="text-center py-12 text-slate-400 text-xs">Loading profile photos...</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">No uploads yet.</p>
                    <Link to="/create-post" className="text-xs font-semibold text-purple-600 hover:underline">
                        Upload your first moment
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {posts.map((post) => {
                        const imgSrc = post.Image_Url || `http://localhost:3000/posts/${post.id}/image`;
                        return (
                            <div
                                key={post.id}
                                className="group relative aspect-square bg-slate-900 rounded-xl overflow-hidden shadow-xs"
                            >
                                <img
                                    src={imgSrc}
                                    alt={post.Caption || "Profile post"}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                                    <span>❤️ {post.Likes || 0}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
};

export default Profile;
