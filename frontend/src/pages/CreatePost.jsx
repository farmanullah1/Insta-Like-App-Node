import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const MAX_CAPTION_LENGTH = 300;
const MAX_FILE_SIZE_MB = 10;

const CreatePost = () => {
    const [submitting, setSubmitting] = useState(false);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState("");
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleFileValidation = (file) => {
        if (!file) {
            setPreview(null);
            return;
        }

        if (!file.type.startsWith("image/")) {
            showToast("Please select a valid image file (JPG, PNG, WEBP).", "error");
            return;
        }

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            showToast(`File is too large! Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`, "warning");
            return;
        }

        setPreview(URL.createObjectURL(file));
        showToast("Photo selected! Looks great! 📸", "info", 2000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFileValidation(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            const input = document.getElementById("postImageInput");
            if (input) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
            }
            handleFileValidation(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!caption.trim()) {
            showToast("Please provide a caption for your post.", "warning");
            return;
        }

        const formElement = e.target;
        const formData = new FormData(formElement);

        try {
            setSubmitting(true);
            const res = await axios.post("http://localhost:3000/posts", formData);

            if (res.status === 200 || res.status === 201) {
                showToast("Post shared with the community! 🎉", "success");
                navigate("/feed");
            } else {
                throw new Error(res.data?.error || "Failed to create post");
            }
        } catch (err) {
            console.error("Error creating post:", err);
            const msg = err.response?.data?.error || err.message || "Failed to upload post";
            setError(msg);
            showToast(msg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="max-w-xl mx-auto w-full px-4 py-8 pb-20 flex-1">
            <section className="bg-white dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xs">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight m-0">
                        Create New Post
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Share your moments and captions with the community
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
                            placeholder="Write an engaging caption... (e.g. Sunset in the mountains #nature)"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all placeholder:text-slate-400 resize-y"
                            required
                        />
                    </div>

                    {/* Image Upload Dropzone */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Photo Upload
                        </label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-150 ${
                                isDragging
                                    ? "border-purple-500 bg-purple-50/60 dark:bg-purple-950/20"
                                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-purple-400"
                            }`}
                        >
                            {preview ? (
                                <div className="relative w-full max-h-96 flex items-center justify-center bg-black">
                                    <img src={preview} alt="Upload preview" className="w-full max-h-96 object-contain block" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreview(null);
                                            const fileInput = document.getElementById("postImageInput");
                                            if (fileInput) fileInput.value = "";
                                            showToast("Photo removed", "info", 1500);
                                        }}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
                                        aria-label="Remove image"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="postImageInput" className="flex flex-col items-center justify-center py-10 px-4 cursor-pointer text-center">
                                    <div className="text-4xl mb-2">🖼️</div>
                                    <strong className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                        Click or drag & drop photo here
                                    </strong>
                                    <span className="text-xs text-slate-400">
                                        Supports JPG, PNG, WEBP (Max {MAX_FILE_SIZE_MB}MB)
                                    </span>
                                </label>
                            )}
                            <input
                                id="postImageInput"
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleFileChange}
                                required={!preview}
                                className="hidden"
                            />
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
                            disabled={submitting || !caption.trim() || (!preview && !document.getElementById("postImageInput")?.files?.length)}
                            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {submitting ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                                    Uploading to ImageKit...
                                </>
                            ) : (
                                "Share Post"
                            )}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default CreatePost;
