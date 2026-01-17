import React, { useState, useEffect } from 'react';
import { Search, Wind, Droplets, MapPin, AlertCircle, CloudSun, Navigation } from 'lucide-react';

/**
 * Robust helper to retrieve the API base URL.
 * In production, VITE_API_BASE_URL should be your backend's deployed URL.
 */
const getApiBase = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {
    // Environment doesn't support import.meta
  }
  return "http://localhost:5000";
};

const API_BASE = getApiBase();

const App = () => {
  const [city, setCity] = useState('New York');
  const [searchInput, setSearchInput] = useState('New York');
  const [data, setData] = useState({ weather: null, air: null, loading: false, error: null });

  const fetchData = async (searchCity) => {
    if (!searchCity) return;
    
    setData(prev => ({ ...prev, loading: true, error: null }));
    try {
      // 1. Fetch Weather from our Backend
      const wRes = await fetch(`${API_BASE}/api/weather?city=${encodeURIComponent(searchCity)}`);
      const wJson = await wRes.json();
      
      if (!wRes.ok) throw new Error(wJson.error || "City not found");

      // 2. Fetch Air Quality using coordinates from weather data
      const aRes = await fetch(`${API_BASE}/api/air?lat=${wJson.coord.lat}&lon=${wJson.coord.lon}`);
      const aJson = await aRes.json();

      setData({ 
        weather: wJson, 
        air: aJson.data || null, 
        loading: false, 
        error: null 
      });
    } catch (err) {
      setData(prev => ({ ...prev, loading: false, error: err.message }));
    }
  };

  useEffect(() => { 
    fetchData(city); 
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCity(searchInput);
    fetchData(searchInput);
  };

  const getAqiStatus = (aqi) => {
    if (aqi <= 50) return { label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-50' };
    if (aqi <= 100) return { label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-50' };
    if (aqi <= 150) return { label: 'Unhealthy (SG)', color: 'bg-orange-500', text: 'text-orange-50' };
    return { label: 'Unhealthy', color: 'bg-rose-500', text: 'text-rose-50' };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header & Search */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <CloudSun className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800">SkyGlass</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Secure Met-Link</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <input 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="Search global cities..."
            />
            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <button type="submit" className="hidden">Search</button>
          </form>
        </header>

        {data.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <p className="text-sm font-semibold">{data.error}</p>
          </div>
        )}

        {data.loading ? (
          <div className="h-80 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Establishing Uplink...</p>
          </div>
        ) : data.weather && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Weather Detail Card */}
            <div className="md:col-span-8 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <CloudSun size={240} />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <MapPin size={12} /> {data.weather.name}, {data.weather.sys.country}
                  </div>
                  <div className="flex items-start">
                    <span className="text-8xl font-black tracking-tighter text-slate-800">{Math.round(data.weather.main.temp)}</span>
                    <span className="text-3xl font-light text-slate-400 mt-4 ml-1">°C</span>
                  </div>
                  <p className="text-xl text-slate-500 font-medium capitalize flex items-center gap-2">
                    {data.weather.weather[0].description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Wind size={14} className="text-blue-500" /> Wind
                    </p>
                    <p className="text-xl font-bold text-slate-700">{data.weather.wind.speed} <span className="text-xs font-normal text-slate-400">m/s</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Droplets size={14} className="text-blue-400" /> Humidity
                    </p>
                    <p className="text-xl font-bold text-slate-700">{data.weather.main.humidity}<span className="text-xs font-normal text-slate-400">%</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Navigation size={14} className="text-indigo-400" /> Pressure
                    </p>
                    <p className="text-xl font-bold text-slate-700">{data.weather.main.pressure}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AQI Summary Card */}
            <div className="md:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-8">Atmospheric Purity</h3>
                {data.air ? (
                  <div className="space-y-8 text-center">
                    <div className="relative inline-block">
                      <div className="text-7xl font-black tracking-tighter text-slate-800">{data.air.current.pollution.aqius}</div>
                      <span className="absolute -top-1 -right-4 text-[10px] font-bold text-slate-300 uppercase">AQI</span>
                    </div>
                    
                    <div className={`py-2 px-6 rounded-2xl font-black text-[11px] tracking-[0.1em] inline-block shadow-lg shadow-current/10 ${getAqiStatus(data.air.current.pollution.aqius).color} ${getAqiStatus(data.air.current.pollution.aqius).text}`}>
                      {getAqiStatus(data.air.current.pollution.aqius).label.toUpperCase()}
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed px-4">
                      Primary pollutant detected is <span className="font-bold text-slate-600 underline decoration-blue-200">{data.air.current.pollution.mainus}</span>.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-20">
                    <Wind size={48} className="mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Station Offline</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Powered by IQAir Global</p>
              </div>
            </div>

            {/* Map Interaction Section */}
            <div className="md:col-span-12 bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden h-64 relative group">
              <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-3 opacity-30 group-hover:opacity-50 transition-opacity">
                   <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="text-slate-400" />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-widest">Geo-Coordinates: {data.weather.coord.lat}, {data.weather.coord.lon}</p>
                   <p className="text-[9px] font-medium text-slate-400">Interactive Map View Ready for Deployment</p>
                </div>
              </div>
            </div>

          </div>
        )}

        <footer className="text-center py-10">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
            Distributed Environmental Intelligence • v1.0.2
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;