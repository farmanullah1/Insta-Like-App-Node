import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const MAX_CAPTION_LENGTH = 300;
const MAX_FILE_SIZE_MB = 10;

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [caption, setCaption] = useState("");
    const [currentImage, setCurrentImage] = useState("");
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:3000/posts/${id}`);
                const post = res.data;
                setCaption(post.Caption || "");
                setCurrentImage(post.Image_Url || `http://localhost:3000/posts/${post.id}/image`);
            } catch (err) {
                console.error("Error fetching post:", err);
                setError("Could not load post details.");
                showToast("Failed to load post details", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                showToast("Please choose a valid image file.", "error");
                return;
            }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                showToast(`Image too large! Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`, "warning");
                return;
            }
            setPreview(URL.createObjectURL(file));
            showToast("New image chosen! Ready to update. 📷", "info", 2000);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!caption.trim()) {
            showToast("Caption cannot be empty.", "warning");
            return;
        }

        const formElement = e.target;
        const formData = new FormData(formElement);

        try {
            setSaving(true);
            const res = await axios.put(`http://localhost:3000/posts/${id}`, formData);

            if (res.status === 200) {
                showToast("Post updated successfully! ✨", "success");
                navigate("/feed");
            } else {
                throw new Error("Failed to update post");
            }
        } catch (err) {
            console.error("Error updating post:", err);
            const msg = err.response?.data?.error || err.message || "Failed to update post.";
            setError(msg);
            showToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="max-w-xl mx-auto w-full px-4 py-16 text-center text-slate-500">
                <div className="w-9 h-9 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm">Loading post details...</p>
            </main>
        );
    }

    return (
        <main className="max-w-xl mx-auto w-full px-4 py-8 pb-20 flex-1">
            <section className="bg-white dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xs">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight m-0">
                        Edit Post #{id}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Update your caption or replace the photo
                    </p>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm mb-5 flex items-center gap-2">
                        <span>⚠️</span>
                        <p className="m-0">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Caption Field */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label htmlFor="captionInput" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                Caption
                            </label>
                            <span className={`text-xs font-medium ${caption.length > MAX_CAPTION_LENGTH ? "text-red-500" : "text-slate-400"}`}>
                                {caption.length}/{MAX_CAPTION_LENGTH}
                            </span>
                        </div>
                        <textarea
                            id="captionInput"
                            name="caption"
                            rows="3"
                            maxLength={MAX_CAPTION_LENGTH}
                            placeholder="Write an engaging caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all placeholder:text-slate-400 resize-y"
                            required
                        />
                    </div>

                    {/* Image Preview & Replacement */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Post Photo
                        </label>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                            <div className="relative w-full max-h-96 flex items-center justify-center bg-black">
                                <img
                                    src={preview || currentImage}
                                    alt="Current or new preview"
                                    className="w-full max-h-96 object-contain block"
                                />
                                {preview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreview(null);
                                            const fileInput = document.getElementById("editImageInput");
                                            if (fileInput) fileInput.value = "";
                                            showToast("Reverted to previous photo", "info", 1500);
                                        }}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
                                        title="Revert to original photo"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <div className="p-3.5 text-center bg-white dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/60">
                                <label
                                    htmlFor="editImageInput"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 cursor-pointer transition-colors"
                                >
                                    📷 Replace Photo (Optional)
                                </label>
                                <input
                                    id="editImageInput"
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            to="/feed"
                            className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving || !caption.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {saving ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                                    Saving Changes...
                                </>
                            ) : (
                                "Update Post"
                            )}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default EditPost;
