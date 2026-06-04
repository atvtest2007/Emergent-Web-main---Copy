import React, { createContext, useContext, useState, useEffect } from 'react';
import { Auth } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('maxx.auth_token');
            if (token) {
                try {
                    const userData = await Auth.me();
                    setUser(userData);
                } catch (err) {
                    console.error("Auth check failed:", err);
                    localStorage.removeItem('maxx.auth_token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        const data = await Auth.login(username, password);
        localStorage.setItem('maxx.auth_token', data.access_token);
        const userData = await Auth.me();
        setUser(userData);
    };

    const register = async (username, password) => {
        await Auth.register(username, password);
        await login(username, password);
    };

    const logout = () => {
        localStorage.removeItem('maxx.auth_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
