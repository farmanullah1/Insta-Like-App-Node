import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();

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
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const formElement = e.target;
        const formData = new FormData(formElement);

        try {
            setSaving(true);
            const res = await axios.put(`http://localhost:3000/posts/${id}`, formData);

            if (res.status === 200) {
                navigate("/feed");
            } else {
                throw new Error("Failed to update post");
            }
        } catch (err) {
            console.error("Error updating post:", err);
            setError(err.response?.data?.error || err.message || "Failed to update post.");
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
                        <label htmlFor="captionInput">Caption</label>
                        <textarea
                            id="captionInput"
                            name="caption"
                            rows="3"
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
                        <button type="submit" className="btn btn-primary" disabled={saving}>
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
