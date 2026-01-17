import { useWeather } from '../context/WeatherContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import MapComponent from './MapComponent';
import ChatBot from './ChatBot';
import { Droplets, Wind, Gauge, Leaf, Eye, Sun, Cloud, CloudRain, MapPin, Calendar, Clock } from 'lucide-react';
import { translations } from '../constants/translations';

const HeroSection = () => {
    const { weather, forecast, aqi, loading, error } = useWeather();
    const { theme } = useTheme();
    const { settings } = useSettings();

    const t = translations[settings.language || 'en'] || translations.en;

    // Unit Conversion Helpers
    const formatTemp = (tempC) => {
        if (settings.tempUnit === 'F') {
            return Math.round((tempC * 9 / 5) + 32);
        }
        return Math.round(tempC);
    };

    const formatWindValue = (windMs) => {
        if (settings.windUnit === 'km/h') return (windMs * 3.6).toFixed(1);
        if (settings.windUnit === 'mph') return (windMs * 2.237).toFixed(1);
        return windMs.toFixed(1);
    };

    const formatPressure = (pressureHpa) => {
        if (settings.pressureUnit === 'mmHg') return (pressureHpa * 0.750062).toFixed(0);
        if (settings.pressureUnit === 'inHg') return (pressureHpa * 0.02953).toFixed(2);
        return pressureHpa;
    };

    if (loading) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-white/60 text-lg font-light">{t.loading}</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <Cloud size={64} className="text-white/40 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">{t.unavailable}</h3>
                <p className="text-white/60">{error}</p>
            </div>
        </div>
    );

    if (!weather || !forecast) return null;

    const hourlyForecast = forecast.list.slice(0, 24); // 24 hours
    const dailyForecast = forecast.list.filter((_, index) => index % 8 === 0).slice(0, 7); // 7 days

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12 pb-16 space-y-8">

            {/* MAIN WEATHER CARD - Apple Weather Inspired */}
            <div className="text-center space-y-6 py-12 md:py-20">

                {/* Location */}
                <div className="flex items-center justify-center gap-2 text-white/80">
                    <MapPin size={20} className="opacity-60" />
                    <h1 className="text-3xl md:text-4xl font-medium tracking-tight">{weather.name}</h1>
                </div>

                {/* Massive Temperature */}
                <div className="relative">
                    <h2 className="text-[6rem] sm:text-[8rem] md:text-[12rem] font-thin leading-none tracking-tighter">
                        {formatTemp(weather.main.temp)}°
                    </h2>
                    {/* Condition Description */}
                    <p className="text-2xl md:text-3xl font-light text-white/90 capitalize mt-4">
                        {weather.weather[0].description}
                    </p>
                </div>

                {/* High / Low */}
                <div className="flex items-center justify-center gap-6 text-lg md:text-xl text-white/70">
                    <span>H: {formatTemp(weather.main.temp_max)}°</span>
                    <span className="w-1 h-1 bg-white/40 rounded-full" />
                    <span>L: {formatTemp(weather.main.temp_min)}°</span>
                </div>

                {/* Additional Context Badges */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                    <Badge icon={Sun} label={t.feelsLike} value={`${formatTemp(weather.main.feels_like)}°`} />
                    <Badge icon={Droplets} label={t.humidity} value={`${weather.main.humidity}%`} />
                    <Badge icon={Wind} label={t.windSpeed} value={`${formatWindValue(weather.wind.speed)} ${settings.windUnit}`} />
                </div>
            </div>

            {/* HOURLY FORECAST - Timeline Style */}
            <section className="glass-panel rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-white/70">
                    <Clock size={18} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">{t.hourlyForecast}</h3>
                </div>
                <div className="relative overflow-x-auto glass-scrollbar pb-2 -mx-2 px-2">
                    <ul className="flex gap-4 min-w-max">
                        {hourlyForecast.map((hour, idx) => (
                            <HourlyCard
                                key={idx}
                                time={new Date(hour.dt * 1000)}
                                temp={formatTemp(hour.main.temp)}
                                icon={hour.weather[0].icon}
                                pop={hour.pop}
                                t={t}
                                isNow={idx === 0}
                            />
                        ))}
                    </ul>
                </div>
            </section>

            {/* DAILY FORECAST - Horizontal Scrolling Cards */}
            <section className="glass-panel rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-white/70">
                    <Calendar size={18} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">{t.sevenDayForecast}</h3>
                </div>
                <div className="relative overflow-x-auto glass-scrollbar pb-2 -mx-2 px-2">
                    <div className="flex gap-4 min-w-max">
                        {dailyForecast.map((day, idx) => {
                            const dayName = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
                            const isToday = new Date().toDateString() === new Date(day.dt * 1000).toDateString();

                            return (
                                <li
                                    key={idx}
                                    className="flex flex-col items-center gap-3 p-4 glass-card min-w-[100px] group"
                                >
                                    <span className="text-sm font-semibold text-white">
                                        {isToday ? t.today : dayName}
                                    </span>
                                    <img
                                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                                        alt={day.weather[0].description}
                                        className="w-16 h-16 drop-shadow-lg"
                                    />
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-2xl font-bold text-white">{formatTemp(day.main.temp_max)}°</span>
                                        <span className="text-sm text-white/50">{formatTemp(day.main.temp_min)}°</span>
                                    </div>
                                    {day.pop > 0.2 && (
                                        <div className="flex items-center gap-1 text-xs text-blue-300">
                                            <Droplets size={12} />
                                            <span>{Math.round(day.pop * 100)}%</span>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* METRICS GRID + MAP */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Metrics Grid */}
                <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <MetricCard
                        icon={Droplets}
                        label={t.humidity}
                        value={`${weather.main.humidity}%`}
                        context={weather.main.humidity > 70 ? t.highStatus : weather.main.humidity > 40 ? t.moderateStatus : t.lowStatus}
                    />
                    <MetricCard
                        icon={Wind}
                        label={t.windUnit}
                        value={`${formatWindValue(weather.wind.speed)} ${settings.windUnit}`}
                        context={weather.wind.speed > 10 ? t.strongStatus : t.calmStatus}
                    />
                    <MetricCard
                        icon={Gauge}
                        label={t.pressureUnit}
                        value={`${formatPressure(weather.main.pressure)} ${settings.pressureUnit}`}
                        context={t.standardStatus}
                    />
                    <MetricCard
                        icon={Eye}
                        label={t.visibility}
                        value={weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : 'N/A'}
                        context={t.clearStatus}
                    />
                    <MetricCard
                        icon={Sun}
                        label={t.uvIndex}
                        value="5"
                        context={t.moderateStatus}
                    />
                    <MetricCard
                        icon={Leaf}
                        label={t.airQuality}
                        value={aqi || 'N/A'}
                        context={t.goodStatus}
                    />
                </div>

                {/* Map */}
                <div className="glass-panel rounded-3xl p-2 h-[350px] xl:h-auto min-h-[350px]">
                    <div className="w-full h-full rounded-2xl overflow-hidden">
                        <MapComponent />
                    </div>
                </div>
            </div>

            <ChatBot />

        </div>
    );
};

// Hourly Card Component
const HourlyCard = ({ time, temp, icon, pop, t, isNow }) => {
    const hour = time.getHours();

    return (
        <li className={`flex flex-col items-center gap-2 p-3 rounded-2xl min-w-[70px] ${isNow ? 'bg-white/20 border border-white/30' : 'hover:bg-white/10'
            } transition-all`}>
            <span className="text-xs font-medium text-white/60">
                {isNow ? t.now : `${hour}:00`}
            </span>
            <img
                src={`https://openweathermap.org/img/wn/${icon}.png`}
                alt="weather"
                className="w-10 h-10"
            />
            <span className="text-lg font-bold text-white">{temp}°</span>
            {pop > 0.2 && (
                <div className="flex items-center gap-1 text-[10px] text-blue-300">
                    <Droplets size={10} />
                    <span>{Math.round(pop * 100)}%</span>
                </div>
            )}
        </li>
    );
};

// Daily Card Component
const DailyCard = ({ date, icon, description, high, low, pop }) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = new Date().toDateString() === date.toDateString();

    return (
        <li className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 transition-all group">
            <div className="w-16 text-left">
                <span className="text-sm font-medium text-white">{isToday ? t.today : dayName}</span>
            </div>
            <img
                src={`https://openweathermap.org/img/wn/${icon}.png`}
                alt={description}
                className="w-16 h-16 drop-shadow-lg"
            />
            <div className="flex-1 flex items-center gap-4">
                <span className="text-sm text-white/60 capitalize hidden sm:block flex-1">{description}</span>
                {pop > 0.2 && (
                    <div className="flex items-center gap-1 text-xs text-blue-300">
                        <Droplets size={12} />
                        <span>{Math.round(pop * 100)}%</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3 text-sm">
                <span className="text-white/50">{low}°</span>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full" />
                <span className="text-white font-medium">{high}°</span>
            </div>
        </li>
    );
};

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value, context }) => (
    <dl className="glass-panel rounded-3xl p-6 space-y-3 hover:bg-white/15 transition-all group">
        <dt className="flex items-center justify-between text-white/50">
            <Icon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
        </dt>
        <dd className="space-y-1 margin-0">
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-xs text-white/40">{context}</p>
        </dd>
    </dl>
);

// Badge Component
const Badge = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
        <Icon size={14} className="text-white/60" />
        <span className="text-sm text-white/80">{label}:</span>
        <span className="text-sm font-semibold text-white">{value}</span>
    </div>
);

export default HeroSection;
