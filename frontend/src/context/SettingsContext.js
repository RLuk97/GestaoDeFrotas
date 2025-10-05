import React, { createContext, useContext, useEffect, useState } from 'react';

const DEFAULTS = {
  showNotifications: true,
  showFutureUpgrade: true,
  itemsPerPage: 5,
  dashboardActivitiesLimit: 5,
  activitiesPageLimit: 50,
  compactMode: false,
  theme: 'system', // 'light' | 'dark' | 'system'
  language: 'pt-BR' // 'pt-BR' | 'en-US'
};

const STORAGE_KEY = 'app_settings';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULTS, ...parsed });
      }
    } catch (_) {
      // ignore
    }
  }, []);

  // Aplicar tema (claro/escuro/sistema) usando classe 'dark' no html
  useEffect(() => {
    const root = document.documentElement;
    let mediaQuery;

    const applyTheme = () => {
      const mode = settings.theme || 'system';
      if (mode === 'dark') {
        root.classList.add('dark');
      } else if (mode === 'light') {
        root.classList.remove('dark');
      } else {
        const preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', !!preferDark);
      }
    };

    applyTheme();

    if (settings.theme === 'system' && window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      try {
        mediaQuery.addEventListener('change', handler);
      } catch (_) {
        // Safari
        mediaQuery.addListener(handler);
      }
      return () => {
        try {
          mediaQuery.removeEventListener('change', handler);
        } catch (_) {
          mediaQuery.removeListener(handler);
        }
      };
    }
  }, [settings.theme]);

  const updateSettings = (partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (_) {
        // ignore
      }
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULTS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
    } catch (_) {
      // ignore
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings deve ser usado dentro de SettingsProvider');
  return ctx;
};

export default SettingsContext;