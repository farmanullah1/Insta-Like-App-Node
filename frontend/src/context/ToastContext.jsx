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
            <aside className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100%-3rem)] pointer-events-none" aria-live="polite">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border shadow-lg transition-all duration-200 ${
                            toast.type === "success"
                                ? "border-emerald-500/60 text-slate-800 dark:text-slate-100"
                                : toast.type === "error"
                                ? "border-rose-500/60 text-slate-800 dark:text-slate-100"
                                : toast.type === "warning"
                                ? "border-amber-500/60 text-slate-800 dark:text-slate-100"
                                : "border-purple-500/60 text-slate-800 dark:text-slate-100"
                        }`}
                        role="alert"
                    >
                        <span className="text-base flex-shrink-0">
                            {toast.type === "success" && "✅"}
                            {toast.type === "error" && "❌"}
                            {toast.type === "info" && "ℹ️"}
                            {toast.type === "warning" && "⚠️"}
                        </span>
                        <p className="m-0 text-xs sm:text-sm font-medium flex-1 leading-snug">
                            {toast.message}
                        </p>
                        <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm p-0.5 cursor-pointer"
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
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
                    onClick={modal.onCancel}
                >
                    <div
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl scale-100"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <span className="text-2xl">
                                {modal.type === "danger" ? "⚠️" : "💬"}
                            </span>
                            <h3 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
                                {modal.title}
                            </h3>
                        </div>
                        <div className="mb-5">
                            <p className="text-sm text-slate-600 dark:text-slate-300 m-0 leading-relaxed">
                                {modal.message}
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                onClick={modal.onCancel}
                            >
                                {modal.cancelText}
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm ${
                                    modal.type === "danger"
                                        ? "bg-rose-600 hover:bg-rose-700"
                                        : "bg-purple-600 hover:bg-purple-700"
                                }`}
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
