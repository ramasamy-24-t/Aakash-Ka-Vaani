import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import { useSettings } from '../context/SettingsContext';
// leaflet CSS is imported centrally in src/main.jsx
import { useWeather } from '../context/WeatherContext';
import L from 'leaflet';
import { translations } from '../constants/translations';

// Custom "Weather Station" Pulse Icon
const pulseIcon = L.divIcon({
    className: 'custom-pulse-icon',
    html: `
        <div class="relative flex h-6 w-6">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-6 w-6 bg-blue-500 border-2 border-white shadow-lg"></span>
        </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 10, {
            duration: 2,
            easeLinearity: 0.25
        });
    }, [center, map]);
    return null;
}

const MapEvents = ({ setActiveOverlays }) => {
    const map = useMap();
    useEffect(() => {
        map.on('overlayadd', (e) => {
            setActiveOverlays(prev => [...new Set([...prev, e.name])]);
        });
        map.on('overlayremove', (e) => {
            setActiveOverlays(prev => prev.filter(name => name !== e.name));
        });
    }, [map, setActiveOverlays]);
    return null;
};

const Legend = ({ activeOverlays, weather, t }) => {
    // Priority: Wind > Temp > Precipitation > Pressure > Clouds
    const currentLegend = activeOverlays.includes('Wind Speed') ? 'Wind Speed' :
        activeOverlays.includes('Temperature') ? 'Temperature' :
            activeOverlays.includes('Precipitation') ? 'Precipitation' :
                activeOverlays.includes('Pressure') ? 'Pressure' :
                    activeOverlays.includes('Clouds') ? 'Clouds' : null;

    if (!currentLegend) return null;

    const legendConfig = {
        Temperature: {
            label: `${t.tempUnit} (°C)`,
            gradient: 'bg-gradient-to-r from-purple-800 via-blue-500 via-green-400 via-yellow-400 to-red-600',
            steps: [
                { val: '-40', color: '#6b21a8' },
                { val: '-20', color: '#3b82f6' },
                { val: '0', color: '#4ade80' },
                { val: '20', color: '#facc15' },
                { val: '40', color: '#dc2626' }
            ]
        },
        Precipitation: {
            label: `${t.precipitation} (mm)`,
            gradient: 'bg-gradient-to-r from-transparent via-blue-300 via-blue-600 to-blue-900',
            steps: [
                { val: '0', color: 'rgba(255,255,255,0.2)' },
                { val: '10', color: '#93c5fd' },
                { val: '25', color: '#2563eb' },
                { val: '50', color: '#1e3a8a' }
            ]
        },
        Clouds: {
            label: `${t.clouds} (%)`,
            gradient: 'bg-gradient-to-r from-transparent via-gray-400 to-white',
            steps: [
                { val: '0', color: 'rgba(255,255,255,0.2)' },
                { val: '25', color: '#9ca3af' },
                { val: '50', color: '#d1d5db' },
                { val: '75', color: '#f3f4f6' },
                { val: '100', color: '#ffffff' }
            ]
        },
        'Wind Speed': {
            label: `${t.windSpeed} (m/s)`,
            gradient: 'bg-gradient-to-r from-slate-200 via-cyan-400 via-blue-600 via-purple-700 to-red-900',
            steps: [
                { val: '0', color: '#e2e8f0' },
                { val: '10', color: '#22d3ee' },
                { val: '20', color: '#2563eb' },
                { val: '40', color: '#7e22ce' },
                { val: '60', color: '#7f1d1d' }
            ]
        },
        Pressure: {
            label: `${t.pressure} (hPa)`,
            gradient: 'bg-gradient-to-r from-blue-900 via-cyan-700 via-yellow-500 via-orange-500 to-red-600',
            steps: [
                { val: '950', color: '#1e3a8a' },
                { val: '980', color: '#0e7490' },
                { val: '1013', color: '#eab308' },
                { val: '1030', color: '#f97316' },
                { val: '1050', color: '#dc2626' }
            ]
        }
    };

    const config = legendConfig[currentLegend];
    const { main, wind, clouds, rain } = weather;

    // Calculate position for current value indicator
    let indicatorPosition = null;
    let currentValue = null;

    if (currentLegend === 'Temperature' && main?.temp !== undefined) {
        currentValue = Math.round(main.temp);
        const min = -40, max = 40;
        indicatorPosition = Math.min(Math.max(((currentValue - min) / (max - min)) * 100, 0), 100);
    } else if (currentLegend === 'Precipitation') {
        // Use 1h rain if available, defaulting to 0
        currentValue = rain?.['1h'] || 0;
        const min = 0, max = 50;
        indicatorPosition = Math.min(Math.max(((currentValue - min) / (max - min)) * 100, 0), 100);
    } else if (currentLegend === 'Clouds' && clouds?.all !== undefined) {
        currentValue = clouds.all;
        const min = 0, max = 100;
        indicatorPosition = Math.min(Math.max(((currentValue - min) / (max - min)) * 100, 0), 100);
    } else if (currentLegend === 'Wind Speed' && wind?.speed !== undefined) {
        currentValue = wind.speed;
        const min = 0, max = 60;
        indicatorPosition = Math.min(Math.max(((currentValue - min) / (max - min)) * 100, 0), 100);
    } else if (currentLegend === 'Pressure' && main?.pressure !== undefined) {
        currentValue = main.pressure;
        const min = 950, max = 1050;
        indicatorPosition = Math.min(Math.max(((currentValue - min) / (max - min)) * 100, 0), 100);
    }

    return (
        <div style={{ position: 'absolute', left: 24, bottom: 24, zIndex: 999, pointerEvents: 'none' }}>
        <div className="glass-panel p-4 rounded-3xl flex flex-col gap-3 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/10 bg-black/80 backdrop-blur-2xl min-w-[220px]">
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.2em] text-center mb-1">{config.label}</span>

                <div className="flex flex-col gap-3">
                    {/* Gradient Bar with Current Indicator */}
                    <div className="relative w-full h-3.5 px-1 bg-black/20 rounded-full border border-white/5 shadow-inner">
                        <div className={`w-full h-full rounded-full ${config.gradient}`}></div>

                        {/* Current Value Dot */}
                        {indicatorPosition !== null && (
                            <div
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                                style={{ left: `${indicatorPosition}%` }}
                            >
                                <div className="w-4 h-4 bg-white rounded-full border-2 border-slate-900 shadow-xl flex items-center justify-center animate-in zoom-in duration-500">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                                <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[9px] font-black px-1 py-0.5 rounded-md shadow-lg whitespace-nowrap">
                                    {t.you}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Value Markers (Colored Circles) */}
                    <div className="flex justify-between items-start px-1 mt-1">
                        {config.steps.map((step, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                                <div
                                    className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-lg"
                                    style={{ backgroundColor: step.color }}
                                ></div>
                                <span className="text-[9px] font-black text-white/40">{step.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MapComponent = () => {
    const { weather, mapToken } = useWeather();
    const { settings } = useSettings();
    const t = translations[settings.language || 'en'] || translations.en;
    const [activeOverlays, setActiveOverlays] = React.useState([settings.mapLayer.charAt(0).toUpperCase() + settings.mapLayer.slice(1)]);

    if (!weather) return null;

    const { coord, name, main } = weather;
    const position = [coord.lat, coord.lon];
    const temp = Math.round(main.temp);

    return (
        <div className="h-full w-full rounded-[20px] overflow-hidden relative z-0 bg-[#071024] app-container-shadow">
            {/* Custom Styles for Map Controls */}
            <style>
                {`
                    .leaflet-control-layers {
                        background: rgba(7, 16, 36, 0.8) !important;
                        color: white !important;
                        border: 1px solid rgba(255,255,255,0.1) !important;
                        backdrop-filter: blur(12px);
                        border-radius: 12px !important;
                        padding: 6px !important;
                    }
                    .leaflet-control-layers-list {
                        font-family: inherit !important;
                        font-weight: 500 !important;
                    }
                    .leaflet-bar a {
                        background-color: rgba(7, 16, 36, 0.8) !important;
                        color: white !important;
                        border-bottom: 1px solid rgba(255,255,255,0.1) !important;
                        backdrop-filter: blur(12px);
                    }
                    .leaflet-bar a:hover {
                        background-color: rgba(255,255,255,0.1) !important;
                    }
                    .leaflet-popup-content-wrapper {
                        background: rgba(7, 16, 36, 0.85) !important;
                        backdrop-filter: blur(20px) !important;
                        color: white !important;
                        border-radius: 16px !important;
                        border: 1px solid rgba(255,255,255,0.1) !important;
                    }
                    .leaflet-popup-tip {
                        background: rgba(7, 16, 36, 0.85) !important;
                    }
                `}
            </style>

            <MapContainer
                center={position}
                zoom={10}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
                <MapEvents setActiveOverlays={setActiveOverlays} />

                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked={settings.mapStyle === 'dark'} name="Dark Matter">
                        <TileLayer
                            attribution='&copy; CARTO'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer checked={settings.mapStyle === 'streets'} name="Streets">
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer checked={settings.mapStyle === 'satellite'} name="Satellite">
                        <TileLayer
                            attribution='Tiles &copy; Esri'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>

                    {mapToken && (
                        <>
                            <LayersControl.Overlay checked={settings.mapLayer === 'temperature'} name="Temperature">
                                <TileLayer
                                    url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${mapToken}`}
                                />
                            </LayersControl.Overlay>

                            <LayersControl.Overlay checked={settings.mapLayer === 'clouds'} name="Clouds">
                                <TileLayer
                                    url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${mapToken}`}
                                />
                            </LayersControl.Overlay>

                            <LayersControl.Overlay checked={settings.mapLayer === 'precipitation'} name="Precipitation">
                                <TileLayer
                                    url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${mapToken}`}
                                />
                            </LayersControl.Overlay>

                            <LayersControl.Overlay checked={settings.mapLayer === 'wind'} name="Wind Speed">
                                <TileLayer
                                    url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${mapToken}`}
                                />
                            </LayersControl.Overlay>
                        </>
                    )}
                </LayersControl>

                <Marker position={position} icon={pulseIcon}>
                    <Popup>
                        <div className="text-center p-1">
                            <h3 className="font-bold text-white text-sm">{name}</h3>
                            <p className="font-bold text-xl logo-gradient">{temp}°</p>
                        </div>
                    </Popup>
                </Marker>
                <ChangeView center={position} />
            </MapContainer>

            {/* Render legend outside of Leaflet internals so it is always on top */}
            <Legend activeOverlays={activeOverlays} weather={weather} t={t} />
        </div>
    );
};

export default MapComponent;
