import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
    const location = useLocation();

    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/feed" className="flex items-center gap-2 group decoration-transparent">
                    <span className="text-2xl transition-transform duration-200 group-hover:scale-110">📸</span>
                    <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                        InstaLike
                    </span>
                </Link>

                <nav className="flex items-center gap-2">
                    <Link
                        to="/feed"
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                            location.pathname === "/feed"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                        }`}
                        title="Feed"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        <span>Feed</span>
                    </Link>

                    <Link
                        to="/create-post"
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                            location.pathname === "/create-post"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20 scale-[1.02]"
                                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-95 shadow-xs"
                        }`}
                        title="Create New Post"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2"/>
                            <path d="M8 12h8"/>
                            <path d="M12 8v8"/>
                        </svg>
                        <span>Create</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
