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
            <main className="page-container">
                <div className="feed-status-container">
                    <div className="feed-spinner"></div>
                    <p>Loading post details...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="page-container">
            <section className="create-post-card">
                <div className="card-header">
                    <h2>Edit Post #{id}</h2>
                    <p className="card-subtitle">Update your caption or change the picture</p>
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
                            placeholder="Write an engaging caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Post Photo</label>
                        <div className="upload-dropzone">
                            <div className="image-preview-wrapper">
                                <img
                                    src={preview || currentImage}
                                    alt="Current or new preview"
                                    className="preview-img"
                                />
                                {preview && (
                                    <button
                                        type="button"
                                        className="remove-preview-btn"
                                        onClick={() => {
                                            setPreview(null);
                                            const fileInput = document.getElementById("editImageInput");
                                            if (fileInput) fileInput.value = "";
                                            showToast("Reverted to previous photo", "info", 1500);
                                        }}
                                        title="Revert to original photo"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <div style={{ padding: "14px", textAlign: "center" }}>
                                <label htmlFor="editImageInput" className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                                    📷 Replace Photo (Optional)
                                </label>
                                <input
                                    id="editImageInput"
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="visually-hidden-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <Link to="/feed" className="btn btn-secondary">
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={saving || !caption.trim()}>
                            {saving ? (
                                <>
                                    <span className="spinner"></span>
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
