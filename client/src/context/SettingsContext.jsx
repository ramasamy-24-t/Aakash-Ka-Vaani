import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('appSettings');
            const parsed = saved ? JSON.parse(saved) : null;
            if (parsed && typeof parsed === 'object') {
                return {
                    tempUnit: 'C',
                    windUnit: 'm/s',
                    pressureUnit: 'hPa',
                    themeMode: 'auto',
                    mapLayer: 'temperature',
                    mapStyle: 'streets',
                    language: 'en',
                    homeCity: '',
                    themeBackground: 'default',
                    ...parsed
                };
            }
        } catch (e) {
            console.error("Failed to parse settings", e);
        }
        return {
            tempUnit: 'C',
            windUnit: 'm/s',
            pressureUnit: 'hPa',
            themeMode: 'auto',
            mapLayer: 'temperature',
            mapStyle: 'streets',
            language: 'en',
            homeCity: '',
            themeBackground: 'default'
        };
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('appSettings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const toggleModal = () => setIsModalOpen(prev => !prev);

    const value = {
        settings,
        updateSettings,
        isModalOpen,
        toggleModal,
        setIsModalOpen
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
