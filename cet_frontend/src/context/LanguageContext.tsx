'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';
import { translations, Language } from '@/locales/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en' as Language);

  // Load language preference on initialization
  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    const normalizedLang = storedLang?.toLowerCase();
    
    if (normalizedLang === 'en' || normalizedLang === 'sr') {
      setLanguageState(normalizedLang as Language);
    }
  }, []);

  const setLanguage = async (lang: Language) => {
    const normalizedLang = lang.toLowerCase() as Language;
    setLanguageState(normalizedLang);
    localStorage.setItem('language', normalizedLang);
    
    // Send new preference to the backend if the user is logged in
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        await api.patch('/users/me/preferences/language', { language: normalizedLang.toUpperCase() });
      } catch (error) {
        console.error('Failed to update language preference on server:', error);
      }
    }
  };

  const t = (key: string): string => {
    return (translations as any)[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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