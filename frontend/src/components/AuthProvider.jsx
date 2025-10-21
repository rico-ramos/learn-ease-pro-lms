import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
    })

    // propagate changes across tabs/components
    useEffect(() => {
        function onStorage(e) {
            if (e.key === 'user') {
                try { setUser(JSON.parse(e.newValue || 'null')) } catch { setUser(null) }
            }
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    const login = (nextUser, token) => {
        localStorage.setItem('user', JSON.stringify(nextUser))
        if (token) localStorage.setItem('token', token)
        setUser(nextUser)
        // custom event for same-tab listeners (not necessary with context, but harmless)
        window.dispatchEvent(new Event('auth:changed'))
    }

    const logout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setUser(null)
        window.dispatchEvent(new Event('auth:changed'))
    }

    const value = useMemo(() => ({ user, login, logout, loading: false }), [user])
    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuthCtx() {
    const ctx = useContext(AuthCtx)
    if (!ctx) throw new Error('useAuthCtx must be used inside <AuthProvider>')
    return ctx
}
