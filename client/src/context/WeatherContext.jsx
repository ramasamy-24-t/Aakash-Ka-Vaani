import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useTheme } from './ThemeContext';
import { useSettings } from './SettingsContext';

const WeatherContext = createContext();

export const useWeather = () => useContext(WeatherContext);

export const WeatherProvider = ({ children }) => {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [aqi, setAqi] = useState(null);
    const [mapToken, setMapToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [city, setCity] = useState(localStorage.getItem('lastCity') || '');
    const [quickCities, setQuickCities] = useState(() => {
        try {
            const saved = localStorage.getItem('quickCities');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Failed to parse quickCities", e);
            return [];
        }
    });

    const { updateTheme } = useTheme();
    const { settings } = useSettings();

    const fetchWeather = async (params) => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = typeof params === 'string' ? { city: params } : params;
            // Use relative path - relies on Vite proxy in dev and Vercel rewrites in prod
            const res = await axios.get(`/api/report`, {
                params: queryParams
            });

            const { weather, forecast, aqi, mapToken } = res.data;

            setWeather(weather);
            setForecast(forecast);
            setAqi(aqi);
            setMapToken(mapToken);

            if (weather && weather.weather && weather.weather[0]) {
                updateTheme(weather.weather[0].id, weather.main.temp, weather.weather[0].icon);

                // Track history if it was a city search
                if (weather.name) {
                    setCity(weather.name);
                    localStorage.setItem('lastCity', weather.name);

                    setQuickCities(prev => {
                        const filtered = prev.filter(c => c.toLowerCase() !== weather.name.toLowerCase());
                        const updated = [weather.name, ...filtered].slice(0, 5);
                        localStorage.setItem('quickCities', JSON.stringify(updated));
                        return updated;
                    });
                }
            }

        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setError('City not found. Please try another location.');
            } else if (err.response && err.response.status === 429) {
                setError('Too many requests. Please try again later.');
            } else {
                setError('Unable to fetch weather data. Check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const lastCity = localStorage.getItem('lastCity');
        const homeCity = settings?.homeCity;

        if (homeCity) {
            fetchWeather(homeCity);
        } else if (lastCity) {
            fetchWeather(lastCity);
        } else if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    fetchWeather('London'); // Default fallback
                }
            );
        } else {
            fetchWeather('London'); // Default fallback
        }
    }, []);

    const value = {
        weather,
        forecast,
        aqi,
        mapToken,
        loading,
        error,
        city,
        quickCities,
        setCity: (newCity) => fetchWeather(newCity),
        fetchWeather
    };

    return (
        <WeatherContext.Provider value={value}>
            {children}
        </WeatherContext.Provider>
    );
};
