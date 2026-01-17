import React, { createContext, useState, useEffect, useContext } from 'react';
import { useSettings } from './SettingsContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const THEMES = {
    sunny: {
        name: 'sunny',
        gradient: 'bg-gradient-to-br from-[#0061ff] to-[#60efff]',
        baseImage: '/weather-backgrounds/sunny',
        overlayColor: 'bg-blue-900/20',
        text: 'text-white',
        cardBg: 'bg-white/10',
        borderColor: 'border-white/20'
    },
    hot: {
        name: 'hot',
        gradient: 'bg-gradient-to-br from-[#f83600] to-[#f9d423]',
        baseImage: '/weather-backgrounds/sunny', // Reuse sunny assets for hot
        overlayColor: 'bg-orange-900/30',
        text: 'text-white',
        cardBg: 'bg-white/10',
        borderColor: 'border-white/20'
    },
    rainy: {
        name: 'rainy',
        gradient: 'bg-gradient-to-br from-[#203a43] to-[#2c5364]',
        baseImage: '/weather-backgrounds/rainy',
        overlayColor: 'bg-slate-900/30',
        text: 'text-white',
        cardBg: 'bg-black/20',
        borderColor: 'border-white/10'
    },
    cloudy: {
        name: 'cloudy',
        gradient: 'bg-gradient-to-br from-[#bdc3c7] to-[#2c3e50]',
        baseImage: '/weather-backgrounds/cloudy',
        overlayColor: 'bg-gray-800/25',
        text: 'text-white',
        cardBg: 'bg-white/10',
        borderColor: 'border-white/20'
    },
    snow: {
        name: 'snow',
        gradient: 'bg-gradient-to-br from-[#e6dada] to-[#274046]',
        baseImage: null,
        overlayColor: 'bg-slate-700/20',
        text: 'text-slate-900',
        cardBg: 'bg-white/40',
        borderColor: 'border-white/40'
    },
    storm: {
        name: 'storm',
        gradient: 'bg-gradient-to-br from-[#141E30] to-[#243B55]',
        baseImage: null,
        overlayColor: 'bg-black/50',
        text: 'text-white',
        cardBg: 'bg-white/5',
        borderColor: 'border-white/10'
    },
    blue: {
        name: 'blue',
        gradient: 'bg-[#0f172a]',
        baseImage: null,
        overlayColor: 'bg-blue-900/10',
        text: 'text-white',
        cardBg: 'bg-white/5',
        borderColor: 'border-white/10'
    },
    indigo: {
        name: 'indigo',
        gradient: 'bg-[#1e1b4b]',
        baseImage: null,
        overlayColor: 'bg-indigo-900/10',
        text: 'text-white',
        cardBg: 'bg-white/5',
        borderColor: 'border-white/10'
    },
    slate: {
        name: 'slate',
        gradient: 'bg-[#020617]',
        baseImage: null,
        overlayColor: 'bg-slate-900/10',
        text: 'text-white',
        cardBg: 'bg-white/5',
        borderColor: 'border-white/10'
    },
    night: {
        name: 'night',
        gradient: 'bg-gradient-to-br from-[#0f172a] to-[#1e1b4b]',
        baseImage: '/weather-backgrounds/night',
        overlayColor: 'bg-black/40',
        text: 'text-white',
        cardBg: 'bg-white/5',
        borderColor: 'border-white/10'
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(THEMES.sunny);
    const [backgroundImage, setBackgroundImage] = useState('/weather-backgrounds/sunny-1.png');


    const { settings } = useSettings();

    const [lastWeatherData, setLastWeatherData] = useState(null);

    const updateTheme = (conditionCode, temp, iconCode) => {
        setLastWeatherData({ conditionCode, temp, iconCode });

        if (settings?.themeMode === 'manual') return;

        let newThemeKey = 'sunny';
        const code = Number(conditionCode);
        const temperature = Number(temp);
        const isNight = iconCode?.endsWith('n');

        if (isNight && !(code >= 200 && code < 600)) {
            // Night mode if not rainy/stormy
            newThemeKey = 'night';
        } else if (temperature > 32) {
            newThemeKey = 'hot';
        } else if (code >= 200 && code < 300) {
            newThemeKey = 'storm';
        } else if (code >= 300 && code < 600) {
            newThemeKey = 'rainy';
        } else if (code >= 600 && code < 700) {
            newThemeKey = 'snow';
        } else if (code >= 801 && code <= 804) {
            newThemeKey = 'cloudy';
        } else if (code === 800) {
            newThemeKey = 'sunny';
        }

        const selectedTheme = THEMES[newThemeKey] || THEMES.sunny;
        setTheme(selectedTheme);

        // Randomly choose 1 or 2 for the background image if baseImage exists
        if (selectedTheme.baseImage) {
            const randomNum = Math.floor(Math.random() * 2) + 1;
            setBackgroundImage(`${selectedTheme.baseImage}-${randomNum}.png`);
        } else {
            setBackgroundImage(null);
        }
    };


    useEffect(() => {
        if (settings?.themeMode === 'manual' && settings?.themeBackground && settings.themeBackground !== 'default') {
            const manualTheme = THEMES[settings.themeBackground];
            if (manualTheme) {
                setTheme(manualTheme);
                setBackgroundImage(null);
            }
        } else if (settings?.themeMode === 'auto' && lastWeatherData) {
            // Re-apply weather theme when switching back to auto
            updateTheme(lastWeatherData.conditionCode, lastWeatherData.temp, lastWeatherData.iconCode);
        }
    }, [settings?.themeMode, settings?.themeBackground]);

    useEffect(() => {
        updateTheme(800, 25);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, backgroundImage, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
