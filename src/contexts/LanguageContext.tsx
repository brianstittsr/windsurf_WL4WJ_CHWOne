'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setCookie, getCookie } from 'cookies-next';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    'common.appName': 'CHWOne',
    'common.dashboard': 'Dashboard',
    'common.login': 'Login',
    'common.logout': 'Logout',
    'common.register': 'Register',
    'common.settings': 'Settings',
    'common.profile': 'Profile',
    'common.language': 'Language',
    'common.english': 'English',
    'common.spanish': 'Spanish',
    'navigation.home': 'Home',
    'navigation.dashboard': 'Dashboard',
    'navigation.region5': 'Region 5',
    'navigation.wl4wj': 'WL4WJ',
    'navigation.admin': 'Admin Panel',
    'navigation.chws': 'CHWs',
    'navigation.projects': 'Projects',
    'navigation.grants': 'Grants',
    'navigation.referrals': 'Referrals',
    'navigation.resources': 'Resources',
    'navigation.forms': 'Forms',
    'navigation.datasets': 'Datasets',
    'navigation.reports': 'Reports',
    'navigation.civicrm': 'CiviCRM',
    'navigation.aiAssistant': 'AI Assistant',
    'navigation.training': 'Training',
    'navigation.myProfile': 'My Profile'
  },
  es: {
    'common.appName': 'CHWOne',
    'common.dashboard': 'Panel de Control',
    'common.login': 'Iniciar Sesión',
    'common.logout': 'Cerrar Sesión',
    'common.register': 'Registrarse',
    'common.settings': 'Configuración',
    'common.profile': 'Perfil',
    'common.language': 'Idioma',
    'common.english': 'Inglés',
    'common.spanish': 'Español',
    'navigation.home': 'Inicio',
    'navigation.dashboard': 'Panel de Control',
    'navigation.region5': 'Región 5',
    'navigation.wl4wj': 'WL4WJ',
    'navigation.admin': 'Panel de Administración',
    'navigation.chws': 'Trabajadores de Salud Comunitaria',
    'navigation.projects': 'Proyectos',
    'navigation.grants': 'Subvenciones',
    'navigation.referrals': 'Referencias',
    'navigation.resources': 'Recursos',
    'navigation.forms': 'Formularios',
    'navigation.datasets': 'Conjuntos de Datos',
    'navigation.reports': 'Informes',
    'navigation.civicrm': 'CiviCRM',
    'navigation.aiAssistant': 'Asistente de IA',
    'navigation.training': 'Capacitación',
    'navigation.myProfile': 'Mi Perfil'
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Initialize language from cookie or browser preference
    if (typeof window !== 'undefined') {
      const savedLanguage = getCookie('NEXT_LOCALE') as Language;
      const browserLanguage = navigator.language.startsWith('es') ? 'es' : 'en';
      const initialLanguage = savedLanguage || browserLanguage;
      
      setLanguageState(initialLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // For cookies-next v4.x, use no options or provide supported options
    setCookie('NEXT_LOCALE', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  // Simple translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
