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
                // Bind to file input via DataTransfer
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
        <main className="page-container">
            <section className="create-post-card">
                <div className="card-header">
                    <h2>Create New Post</h2>
                    <p className="card-subtitle">Share your favorite moments with captions & tags</p>
                </div>

                {error && (
                    <div className="alert-banner error" role="alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <form className="create-post-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="captionInput">Caption</label>
                            <span style={{ fontSize: "12px", color: caption.length > MAX_CAPTION_LENGTH ? "#ef4444" : "var(--text)" }}>
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
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Photo Upload</label>
                        <div
                            className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                                borderColor: isDragging ? "var(--accent)" : undefined,
                                background: isDragging ? "var(--accent-bg)" : undefined,
                            }}
                        >
                            {preview ? (
                                <div className="image-preview-wrapper">
                                    <img src={preview} alt="Upload preview" className="preview-img" />
                                    <button
                                        type="button"
                                        className="remove-preview-btn"
                                        onClick={() => {
                                            setPreview(null);
                                            const fileInput = document.getElementById("postImageInput");
                                            if (fileInput) fileInput.value = "";
                                            showToast("Photo removed", "info", 1500);
                                        }}
                                        aria-label="Remove image"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="postImageInput" className="dropzone-label">
                                    <div className="dropzone-icon">🖼️</div>
                                    <div className="dropzone-text">
                                        <strong>Click or drag & drop photo here</strong>
                                        <span>Supports JPG, PNG, WEBP (Max 10MB)</span>
                                    </div>
                                </label>
                            )}
                            <input
                                id="postImageInput"
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleFileChange}
                                required={!preview}
                                className="visually-hidden-input"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <Link to="/feed" className="btn btn-secondary">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting || !caption.trim() || (!preview && !document.getElementById("postImageInput")?.files?.length)}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner"></span>
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
