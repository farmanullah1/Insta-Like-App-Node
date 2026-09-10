import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const CreatePost = () => {
    const [submitting, setSubmitting] = useState(false);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
            setSubmitting(true);
            const res = await axios.post("http://localhost:3000/posts", formData);

            // Backend returns 201 Created or 200 OK
            if (res.status === 200 || res.status === 201) {
                navigate("/feed");
            } else {
                throw new Error(res.data?.error || "Failed to create post");
            }
        } catch (err) {
            console.error("Error creating post:", err);
            const msg = err.response?.data?.error || err.message || "Failed to upload post";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="page-container">
            <section className="create-post-card">
                <div className="card-header">
                    <h2>Create New Post</h2>
                    <p className="card-subtitle">Share your favorite photos and thoughts</p>
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
                        <label>Photo Upload</label>
                        <div className="upload-dropzone">
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
                                        <strong>Click to browse photo</strong>
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
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
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
