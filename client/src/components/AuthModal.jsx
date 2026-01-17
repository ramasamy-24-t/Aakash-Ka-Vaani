import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
    const { login, register, error } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const success = isLogin
            ? await login(formData.email, formData.password)
            : await register(formData.name, formData.email, formData.password);

        setLoading(false);
        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center min-h-screen w-full p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-3xl animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 mx-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Join Us'}
                    </h2>
                    <p className="text-white/60 text-sm md:text-base">
                        {isLogin ? 'Enter your details to access your account' : 'Start your journey with us today'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 md:py-3 pl-11 md:pl-12 pr-4 text-white placeholder-white/30 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 md:py-3 pl-11 md:pl-12 pr-4 text-white placeholder-white/30 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 md:py-3 pl-11 md:pl-12 pr-4 text-white placeholder-white/30 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <p className="text-yellow-200/80 text-xs text-center">
                                ⚠️ Note: We currently do not have a 'Forgot Password' feature. Please memorize your credentials significantly.
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 md:py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-2 text-sm md:text-base"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-white/40 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
