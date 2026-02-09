import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async (token) => {
        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const userData = await res.json();
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            } else if (res.status === 401 || res.status === 404) {
                // Token invalid or User deleted/doesn't exist in this DB
                logout();
            }
        } catch (err) {
            console.error('Failed to sync user data', err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                    }
                    // Always try to fetch fresh data to ensure UI is in sync
                    refreshUser(token);
                }
            } catch (e) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
