import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import Feed from "./pages/Feed";
import { ToastProvider } from "./context/ToastContext";
import "./App.css";

export const App = () => {
  return (
    <ToastProvider>
      <Router>
        <div className="app-layout">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/edit-post/:id" element={<EditPost />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;