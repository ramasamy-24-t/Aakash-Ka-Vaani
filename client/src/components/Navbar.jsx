import React, { useState, useEffect, useRef } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Settings, User, X, LogOut } from 'lucide-react';
import { translations } from '../constants/translations';
import AuthModal from './AuthModal';

const QUICK_CITIES = [
    { name: 'Mumbai', icon: ' ' },
    { name: 'Delhi', icon: ' ' },
    { name: 'Bangalore', icon: ' ' },
    { name: 'Chennai', icon: ' ' },
];

const Navbar = () => {
    const { setCity, weather, quickCities } = useWeather();
    const { toggleModal, settings } = useSettings();
    const { user, logout } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const t = translations[settings.language || 'en'] || translations.en;
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 20);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setCity(searchInput.trim());
            setSearchInput('');
        }
    };

    const handleQuickCity = (cityName) => {
        setCity(cityName);
    };

    // Dynamic brand color based on weather
    const getBrandColor = () => {
        if (!weather || !weather.weather[0]) return 'text-white';
        const condition = weather.weather[0].main.toLowerCase();
        const id = weather.weather[0].id;

        if (id === 800) return 'text-yellow-400'; // Clear
        if (id >= 801 && id <= 804) return 'text-sky-300'; // Clouds
        if (id >= 200 && id <= 531) return 'text-blue-400'; // Rain/Storm
        if (id >= 600 && id <= 622) return 'text-blue-100'; // Snow

        return 'text-white';
    };

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-black/40 backdrop-blur-2xl shadow-2xl border-b border-white/10' : 'bg-black/20 backdrop-blur-md'
            }`}>
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4">

                {/* Main Content Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Top Row: Logo + Mobile Actions */}
                    <div className="flex items-center justify-between">
                        {/* Brand Logo */}
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight whitespace-nowrap group cursor-pointer" onClick={() => window.location.reload()}>
                            <span className={`transition-colors duration-700 ${getBrandColor()}`}>Aakash</span>
                            <span className="font-light opacity-80 ml-1 text-white/90 group-hover:opacity-100 transition-opacity">KaVaani</span>
                        </h1>

                        {/* Mobile Actions (Icons only) */}
                        <div className="flex items-center gap-3 md:hidden">
                            <button
                                onClick={toggleModal}
                                title={t.settings}
                                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 transition-all"
                            >
                                <Settings size={18} />
                            </button>
                            <button
                                onClick={() => user ? logout() : setIsAuthModalOpen(true)}
                                title={user ? "Logout" : "Login"}
                                className="p-2 rounded-full bg-white/90 text-slate-900 shadow-lg hover:scale-110 transition-all"
                            >
                                {user ? <LogOut size={18} strokeWidth={2.5} /> : <User size={18} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>

                    {/* Search Bar - Responsive Grid Position */}
                    <div className="order-last md:order-none w-full md:max-w-xl lg:max-w-2xl">
                        <form onSubmit={handleSearch} className="relative" role="search">
                            <div className="relative">
                                <button
                                    type="submit"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-50 p-1"
                                    aria-label="Submit search"
                                >
                                    <Search size={20} />
                                </button>
                                <input
                                    type="text"
                                    placeholder={t.searchPlaceholder}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    aria-label="Search for location mumbai, delhi, etc."
                                    className="w-full glass-input text-white placeholder-white/40 rounded-3xl px-6 py-4 pl-16 pr-4 text-lg md:text-xl focus:ring-2 focus:ring-white/10 transition-all shadow-inner"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleModal}
                            title={t.settings}
                            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 hover:text-white hover:scale-105 transition-all"
                        >
                            <Settings size={20} />
                        </button>
                        <button
                            onClick={() => user ? logout() : setIsAuthModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/95 text-slate-950 text-sm font-bold hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20"
                        >
                            {user ? <LogOut size={18} strokeWidth={2.5} /> : <User size={18} strokeWidth={2.5} />}
                            <span>{user ? 'Logout' : t.login}</span>
                        </button>
                    </div>
                </div>

                {/* Glassmorphic Divider for Mobile */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3 md:hidden" />

                {/* Quick City Shortcuts */}
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1 mt-4">
                    {/* Current Location Chip */}
                    {weather && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-white text-[11px] md:text-xs font-semibold whitespace-nowrap shrink-0 animate-in fade-in zoom-in duration-500">
                            <MapPin size={12} className="text-blue-300 animate-pulse" />
                            <span>{weather.name}</span>
                            <span className="text-blue-100 bg-blue-500/30 px-1.5 py-0.5 rounded-lg">{Math.round(weather.main.temp)}°</span>
                        </div>
                    )}

                    {/* Quick Cities */}
                    {quickCities.map((cityName, idx) => (
                        <button
                            key={cityName}
                            onClick={() => handleQuickCity(cityName)}
                            className={`city-chip flex items-center gap-2 text-[12px] md:text-sm font-medium whitespace-nowrap shrink-0 ${weather && weather.name === cityName ? 'selected' : ''}`}
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <span>{cityName}</span>
                        </button>
                    ))}
                </div>

            </div>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </nav>
    );
};

export default Navbar;
