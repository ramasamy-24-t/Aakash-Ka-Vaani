import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { Bot, Sparkles, Send, X, MessageSquare, Loader2 } from 'lucide-react';
import axios from 'axios';
import AuthModal from './AuthModal';

const ChatBot = () => {
    const { user } = useAuth();
    const { weather, forecast, aqi } = useWeather();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Reinitialize chat when user logs out
    useEffect(() => {
        if (!user) {
            setMessages([]);
        }
    }, [user]);

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Enforce login on send
        if (!user) {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: "Please log in to continue chatting with me." }]);
                setTimeout(() => setIsAuthModalOpen(true), 1000); // Open modal after a second
            }, 500);
            return;
        }

        try {
            const response = await axios.post('/api/chat', {
                message: input,
                weatherData: {
                    weather,
                    forecast,
                    aqi
                }
            });
            const botMessage = { role: 'assistant', content: response.data.reply };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage = { role: 'assistant', content: "Sorry, I'm having trouble connecting to the weather network right now." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <>
                <section className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="glass-panel rounded-3xl p-1 shadow-2xl border border-blue-500/20">
                        <div className="bg-black/40 rounded-[1.3rem] overflow-hidden min-h-[500px] flex flex-col relative group">

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6">
                                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                    <Bot size={40} className="text-blue-400" />
                                </div>

                                <div className="space-y-2 max-w-lg">
                                    <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                        Umbrella Man <Sparkles size={16} className="text-yellow-400" />
                                    </h3>
                                    <p className="text-white/50">
                                        Hello <span className="text-blue-300 font-medium">{user ? user.name : 'Guest'}</span>! I'm Umbrella Man.
                                        <br />
                                        I know the weather better than the clouds themselves. Ask me anything!
                                    </p>
                                </div>

                                <button
                                    onClick={() => setIsOpen(true)}
                                    className="px-6 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 rounded-xl border border-blue-500/30 transition-all font-medium text-sm flex items-center gap-2"
                                >
                                    <MessageSquare size={16} />
                                    Chat with Umbrella Man
                                </button>
                            </div>

                            {/* Gradient Effects */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
                        </div>
                    </div>
                </section>
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            </>
        );
    }

    return (
        <section className="w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="glass-panel rounded-3xl p-1 shadow-2xl border border-blue-500/20">
                <div className="bg-black/60 backdrop-blur-md rounded-[1.3rem] overflow-hidden h-[600px] flex flex-col relative">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                                <Bot size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    Umbrella Man <Sparkles size={12} className="text-yellow-400" />
                                </h3>
                                <p className="text-xs text-blue-300/70">Online • Budget-friendly & Fast</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {messages.length === 0 && (
                            <div className="text-center text-white/30 mt-20">
                                <Bot size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Hey there! I'm Umbrella Man. Need a forecast or just want to complain about the rain?</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                                        max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed
                                        ${msg.role === 'user'
                                            ? 'bg-blue-600/80 text-white rounded-br-none'
                                            : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5'
                                        }
                                    `}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 rounded-2xl p-3 rounded-bl-none border border-white/5 flex items-center gap-2">
                                    <Loader2 size={16} className="text-blue-400 animate-spin" />
                                    <span className="text-white/50 text-xs">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10 bg-black/20">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about the weather..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ChatBot;
