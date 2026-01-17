import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useWeather } from '../context/WeatherContext';
import { X, Save, RotateCcw, Thermometer, Wind, Gauge, Palette, Map, History, Globe } from 'lucide-react';
import { translations } from '../constants/translations';

const SettingsModal = () => {
    const settingsContext = useSettings();
    const weatherContext = useWeather();

    // Safely destructure with defaults
    const { settings = {}, updateSettings = () => { }, isModalOpen = false, toggleModal = () => { } } = settingsContext || {};
    const { quickCities = [] } = weatherContext || {};

    const [localSettings, setLocalSettings] = useState(settings);
    const [activeSection, setActiveSection] = useState('units');

    const t = translations[settings.language || 'en'] || translations.en;

    // Sync local state when settings change (e.g. from props update)
    React.useEffect(() => {
        if (settings) setLocalSettings(settings);
    }, [settings]);

    if (!isModalOpen) return null;

    const handleSave = () => {
        updateSettings(localSettings);
        toggleModal();
    };

    const clearHistory = () => {
        localStorage.removeItem('quickCities');
        window.location.reload(); // Refresh to clear context state
    };

    const sections = [
        { id: 'units', label: t.units, icon: Thermometer },
        { id: 'visuals', label: t.visuals, icon: Palette },
        { id: 'map', label: t.map, icon: Map },
        { id: 'history', label: t.history, icon: History },
        { id: 'language', label: t.language, icon: Globe },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* BLURRY BACKDROP */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={toggleModal}
            />

            {/* MODAL CONTENT */}
            <div className="relative w-full max-w-4xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[70vh] animate-in zoom-in-95 duration-300">

                {/* SIDEBAR */}
                <div className="w-full md:w-64 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 p-2 md:p-6 flex flex-row md:flex-col gap-2 overflow-x-auto custom-scrollbar shrink-0">
                    <h2 className="text-2xl font-bold text-white mb-6 hidden md:block">{t.settings}</h2>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center justify-center md:justify-start gap-3 px-3 py-2 md:px-4 md:py-3 rounded-2xl transition-all shrink-0 ${activeSection === section.id
                                ? 'bg-white/20 text-white shadow-lg'
                                : 'text-white/60 hover:bg-white/10'
                                }`}
                            title={section.label}
                        >
                            <section.icon size={20} />
                            <span className="hidden md:block font-medium">{section.label}</span>
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h3 className="text-xl font-semibold text-white">
                            {sections.find(s => s.id === activeSection)?.label}
                        </h3>
                        <button onClick={toggleModal} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">

                        {activeSection === 'units' && (
                            <div className="space-y-6 md:space-y-8">
                                <SettingGroup label={t.tempUnit}>
                                    <div className="flex gap-2">
                                        <ToggleButton
                                            active={localSettings.tempUnit === 'C'}
                                            label={t.celsius}
                                            onClick={() => setLocalSettings({ ...localSettings, tempUnit: 'C' })}
                                        />
                                        <ToggleButton
                                            active={localSettings.tempUnit === 'F'}
                                            label={t.fahrenheit}
                                            onClick={() => setLocalSettings({ ...localSettings, tempUnit: 'F' })}
                                        />
                                    </div>
                                </SettingGroup>

                                <SettingGroup label={t.windUnit}>
                                    <div className="flex flex-wrap gap-2">
                                        {['m/s', 'km/h', 'mph'].map(unit => (
                                            <ToggleButton
                                                key={unit}
                                                active={localSettings.windUnit === unit}
                                                label={unit}
                                                onClick={() => setLocalSettings({ ...localSettings, windUnit: unit })}
                                            />
                                        ))}
                                    </div>
                                </SettingGroup>

                                <SettingGroup label={t.pressureUnit}>
                                    <div className="flex flex-wrap gap-2">
                                        {['hPa', 'mmHg', 'inHg'].map(unit => (
                                            <ToggleButton
                                                key={unit}
                                                active={localSettings.pressureUnit === unit}
                                                label={unit}
                                                onClick={() => setLocalSettings({ ...localSettings, pressureUnit: unit })}
                                            />
                                        ))}
                                    </div>
                                </SettingGroup>
                            </div>
                        )}

                        {activeSection === 'visuals' && (
                            <div className="space-y-6 md:space-y-8">
                                <SettingGroup label={t.themeMode}>
                                    <div className="flex gap-2">
                                        <ToggleButton
                                            active={localSettings.themeMode === 'auto'}
                                            label={t.autoMode}
                                            onClick={() => setLocalSettings({ ...localSettings, themeMode: 'auto' })}
                                        />
                                        <ToggleButton
                                            active={localSettings.themeMode === 'manual'}
                                            label={t.manualMode}
                                            onClick={() => setLocalSettings({ ...localSettings, themeMode: 'manual' })}
                                        />
                                    </div>
                                </SettingGroup>

                                {localSettings.themeMode === 'manual' && (
                                    <SettingGroup label={t.manualBackground}>
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {[
                                                { id: 'blue', color: '#0f172a', label: 'Dark Blue' },
                                                { id: 'indigo', color: '#1e1b4b', label: 'Indigo' },
                                                { id: 'slate', color: '#020617', label: 'Slate' }
                                            ].map(bg => (
                                                <button
                                                    key={bg.id}
                                                    onClick={() => setLocalSettings({ ...localSettings, themeBackground: bg.id })}
                                                    className={`group relative w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 transition-all flex items-center justify-center shrink-0 ${localSettings.themeBackground === bg.id
                                                        ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                                        : 'border-white/10 hover:border-white/30'
                                                        }`}
                                                    style={{ backgroundColor: bg.color }}
                                                    title={bg.label}
                                                >
                                                    {localSettings.themeBackground === bg.id && (
                                                        <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-300" />
                                                    )}
                                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/40 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {bg.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </SettingGroup>
                                )}
                            </div>
                        )}

                        {activeSection === 'map' && (
                            <div className="space-y-6 md:space-y-8">
                                <SettingGroup label={t.defaultLayer}>
                                    <div className="flex flex-wrap gap-2">
                                        {['Temperature', 'Clouds', 'Precipitation', 'Wind'].map(layer => (
                                            <ToggleButton
                                                key={layer}
                                                active={localSettings.mapLayer === layer.toLowerCase()}
                                                label={t[layer.toLowerCase()] || layer}
                                                onClick={() => setLocalSettings({ ...localSettings, mapLayer: layer.toLowerCase() })}
                                            />
                                        ))}
                                    </div>
                                </SettingGroup>

                                <SettingGroup label={t.mapStyle}>
                                    <div className="flex flex-wrap gap-2">
                                        {['Streets', 'Satellite', 'Dark'].map(style => (
                                            <ToggleButton
                                                key={style}
                                                active={localSettings.mapStyle === style.toLowerCase()}
                                                label={style}
                                                onClick={() => setLocalSettings({ ...localSettings, mapStyle: style.toLowerCase() })}
                                            />
                                        ))}
                                    </div>
                                </SettingGroup>
                            </div>
                        )}

                        {activeSection === 'history' && (
                            <div className="space-y-6 md:space-y-8">
                                <SettingGroup label={t.history}>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                        <p className="text-sm text-white/60 mb-4">You have {quickCities.length} cities in your history.</p>
                                        <button
                                            onClick={clearHistory}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all text-sm font-semibold"
                                        >
                                            <RotateCcw size={16} />
                                            {t.clearHistory}
                                        </button>
                                    </div>
                                </SettingGroup>

                                <SettingGroup label={t.homeCity}>
                                    <input
                                        type="text"
                                        placeholder={t.searchPlaceholder}
                                        value={localSettings.homeCity}
                                        onChange={(e) => setLocalSettings({ ...localSettings, homeCity: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none"
                                    />
                                </SettingGroup>
                            </div>
                        )}

                        {activeSection === 'language' && (
                            <SettingGroup label={t.language}>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { l: 'English', c: 'en' },
                                        { l: 'Français', c: 'fr' },
                                        { l: 'Español', c: 'es' },
                                        { l: 'தமிழ்', c: 'ta' },
                                        { l: 'हिन्दी', c: 'hi' },
                                        { l: 'മലയാളം', c: 'ml' },
                                        { l: 'తెలుగు', c: 'te' },
                                        { l: 'ಕನ್ನಡ', c: 'kn' },
                                        { l: 'বাংলা', c: 'bn' }
                                    ].map(lang => (
                                        <ToggleButton
                                            key={lang.c}
                                            active={localSettings.language === lang.c}
                                            label={lang.l}
                                            onClick={() => setLocalSettings({ ...localSettings, language: lang.c })}
                                        />
                                    ))}
                                </div>
                            </SettingGroup>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 md:p-6 border-t border-white/10 flex items-center justify-end gap-3 bg-white/5">
                        <button
                            onClick={toggleModal}
                            className="px-4 py-2 md:px-6 md:py-2.5 rounded-2xl text-white/70 hover:text-white font-medium transition-all text-sm md:text-base"
                        >
                            {t.close}
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2 md:px-8 md:py-2.5 rounded-2xl bg-white text-slate-900 font-bold hover:scale-105 active:scale-95 transition-all shadow-xl text-sm md:text-base"
                        >
                            <Save size={18} />
                            {t.saveSettings}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingGroup = ({ label, children }) => (
    <div className="space-y-3 md:space-y-4">
        <h4 className="text-xs md:text-sm font-semibold text-white/40 uppercase tracking-widest">{label}</h4>
        {children}
    </div>
);

const ToggleButton = ({ active, label, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all border shrink-0 ${active
            ? 'bg-white text-slate-900 border-white shadow-lg'
            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
    >
        {label}
    </button>
);

export default SettingsModal;
