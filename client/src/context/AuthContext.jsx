import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Load - Check for token
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user", e);
                    localStorage.removeItem('user');
                }
                axios.defaults.headers.common['x-auth-token'] = token;
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    // Register
    const register = async (name, email, password) => {
        setError(null);
        try {
            const res = await axios.post('/api/auth/register', { name, email, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['x-auth-token'] = token;
            setUser(user);
            return true;
        } catch (err) {
            console.error("Registration Error:", err.response || err);
            setError(err.response?.data?.error || 'Registration failed');
            return false;
        }
    };

    // Login
    const login = async (email, password) => {
        setError(null);
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['x-auth-token'] = token;
            setUser(user);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            return false;
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
