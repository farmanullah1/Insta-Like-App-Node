import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [modal, setModal] = useState(null);

    const showToast = useCallback((message, type = "success", duration = 3500) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Custom confirmation modal returning a Promise<boolean>
    const confirmModal = useCallback(({ title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
        return new Promise((resolve) => {
            setModal({
                title,
                message,
                confirmText,
                cancelText,
                type,
                onConfirm: () => {
                    setModal(null);
                    resolve(true);
                },
                onCancel: () => {
                    setModal(null);
                    resolve(false);
                },
            });
        });
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, confirmModal }}>
            {children}

            {/* Floating Toasts Stack */}
            <aside className="toast-container" aria-live="polite" aria-label="Notifications">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast-item toast-${toast.type}`}
                        role="alert"
                    >
                        <span className="toast-icon">
                            {toast.type === "success" && "✅"}
                            {toast.type === "error" && "❌"}
                            {toast.type === "info" && "ℹ️"}
                            {toast.type === "warning" && "⚠️"}
                        </span>
                        <p className="toast-message">{toast.message}</p>
                        <button
                            type="button"
                            className="toast-close-btn"
                            onClick={() => removeToast(toast.id)}
                            aria-label="Close notification"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </aside>

            {/* Interactive Confirm Modal */}
            {modal && (
                <div className="modal-backdrop" onClick={modal.onCancel}>
                    <div
                        className="modal-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <span className="modal-icon">
                                {modal.type === "danger" ? "⚠️" : "💬"}
                            </span>
                            <h3 id="modal-title">{modal.title}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{modal.message}</p>
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={modal.onCancel}
                            >
                                {modal.cancelText}
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm ${modal.type === "danger" ? "btn-danger" : "btn-primary"}`}
                                onClick={modal.onConfirm}
                                autoFocus
                            >
                                {modal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export default ToastContext;
