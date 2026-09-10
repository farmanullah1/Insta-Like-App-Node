import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
    const location = useLocation();

    return (
        <header className="app-navbar">
            <div className="nav-container">
                <Link to="/feed" className="brand-logo">
                    <span className="brand-icon">📸</span>
                    <span className="brand-name">InstaLike</span>
                </Link>

                <nav className="nav-links">
                    <Link
                        to="/feed"
                        className={`nav-btn ${location.pathname === "/feed" ? "active" : ""}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        <span>Feed</span>
                    </Link>

                    <Link
                        to="/create-post"
                        className={`nav-btn post-action-btn ${location.pathname === "/create-post" ? "active" : ""}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2"/>
                            <path d="M8 12h8"/>
                            <path d="M12 8v8"/>
                        </svg>
                        <span>Create Post</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
