import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const push = useCallback((msg, kind = 'info', ms = 2500) => {
        const id = Math.random().toString(36).slice(2)
        setToasts(t => [...t, { id, msg, kind }])
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ms)
    }, [])

    return (
        <ToastCtx.Provider value={{ push }}>
            {children}
            <div className="fixed bottom-4 right-4 space-y-2 z-50">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`px-4 py-2 rounded-2xl shadow text-white ${t.kind === 'success' ? 'bg-green-600' :
                                t.kind === 'error' ? 'bg-red-600' :
                                    'bg-gray-900'
                            }`}
                    >
                        {t.msg}
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastCtx)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}

export default ToastProvider
