import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const Profile = () => {
    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState({
        Username: "farman_creative",
        FullName: "Farman Ullah",
        Bio: "Visual creator & photographer ✨ Capturing life, code, and aesthetics with the community.",
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        bio: "",
    });
    const [saving, setSaving] = useState(false);

    const { showToast } = useToast();

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [postsRes, profileRes] = await Promise.all([
                axios.get("http://localhost:3000/posts"),
                axios.get("http://localhost:3000/profile").catch(() => null),
            ]);

            setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
            if (profileRes?.data) {
                setProfile(profileRes.data);
                setFormData({
                    username: profileRes.data.Username || "",
                    fullName: profileRes.data.FullName || "",
                    bio: profileRes.data.Bio || "",
                });
            }
        } catch (err) {
            console.error("Error fetching profile data:", err);
            showToast("Failed to load profile details", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await axios.put("http://localhost:3000/profile", formData);
            if (res.status === 200) {
                setProfile(res.data);
                setIsEditing(false);
                showToast("Profile updated successfully! ✨", "success");
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            showToast("Could not update profile right now", "error");
        } finally {
            setSaving(false);
        }
    };

    const totalLikes = posts.reduce((sum, p) => sum + (p.Likes || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.CommentsCount || 0), 0);

    return (
        <main className="max-w-3xl mx-auto w-full px-4 py-8 pb-24 flex-1">
            {/* Profile Header Card */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar with Gradient Ring */}
                    <div className="relative p-1 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-500 shadow-md">
                        <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold">
                            {(profile.FullName || "F").charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 m-0">
                                    {profile.FullName || "Community Member"}
                                </h2>
                                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                                    @{profile.Username || "user"} • Creator
                                </span>
                            </div>
                            <div className="flex items-center gap-2 self-center sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            username: profile.Username || "",
                                            fullName: profile.FullName || "",
                                            bio: profile.Bio || "",
                                        });
                                        setIsEditing(!isEditing);
                                    }}
                                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                                >
                                    {isEditing ? "Close" : "✏️ Edit Profile"}
                                </button>
                                <Link
                                    to="/create-post"
                                    className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs hover:opacity-95"
                                >
                                    + Share Photo
                                </Link>
                            </div>
                        </div>

                        {/* Real-time Dynamic Stats Calculated from Database */}
                        <div className="flex items-center justify-center sm:justify-start gap-6 py-2 my-2 border-y border-slate-100 dark:border-slate-700 text-center sm:text-left">
                            <div>
                                <strong className="block text-base font-bold text-slate-900 dark:text-slate-100">
                                    {posts.length}
                                </strong>
                                <span className="text-xs text-slate-500">Posts Shared</span>
                            </div>
                            <div>
                                <strong className="block text-base font-bold text-slate-900 dark:text-slate-100">
                                    {totalLikes}
                                </strong>
                                <span className="text-xs text-slate-500">Likes Received</span>
                            </div>
                            <div>
                                <strong className="block text-base font-bold text-slate-900 dark:text-slate-100">
                                    {totalComments}
                                </strong>
                                <span className="text-xs text-slate-500">Total Comments</span>
                            </div>
                        </div>

                        {/* Bio & Form */}
                        {isEditing ? (
                            <form onSubmit={handleSaveProfile} className="mt-3 flex flex-col gap-2.5">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="p-2 text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="p-2 text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows="2"
                                    maxLength="300"
                                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    placeholder="Write your bio..."
                                    required
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-3 py-1 text-xs rounded-lg text-slate-600 bg-slate-100 dark:bg-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save to Database"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                                <p className="m-0 leading-relaxed">{profile.Bio}</p>
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
