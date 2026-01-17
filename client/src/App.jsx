import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { WeatherProvider } from './context/WeatherContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import SettingsModal from './components/SettingsModal';
import { useSettings, SettingsProvider } from './context/SettingsContext';
import { translations } from './constants/translations';
import { AuthProvider } from './context/AuthContext';

const AppContent = () => {
  const { theme, backgroundImage } = useTheme();
  const { settings } = useSettings();
  const t = translations[settings.language || 'en'] || translations.en;

  return (
    <div
      className={`min-h-screen relative ${theme.text}`}
      data-theme={theme.name}
      data-bg={backgroundImage}
    >
      <SettingsModal />
      {/* BACKGROUND LAYER */}
      <div
        className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
      >
        {backgroundImage ? (
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${backgroundImage})`
              }}
            />
            {/* VIGNETTE & OVERLAY */}
            <div className={`absolute inset-0 ${theme.overlayColor} backdrop-brightness-75`} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
          </div>
        ) : (
          <div className={`absolute inset-0 ${theme.gradient}`} />
        )}
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <HeroSection />
        </main>

        {/* FOOTER */}
        <footer className="p-6 text-center space-y-2">
          <a
            href="https://ramasamyt.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 text-sm font-semibold tracking-wide hover:text-blue-400 transition-colors block"
          >
            {t.createdBy}
          </a>
          <p className="text-white/30 text-[10px] font-medium tracking-widest uppercase">
            {t.poweredBy}
          </p>
        </footer>
      </div>
    </div>
  );
};



function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ThemeProvider>
          <WeatherProvider>
            <AppContent />
          </WeatherProvider>
        </ThemeProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
