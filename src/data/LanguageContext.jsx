import React, { createContext, useContext } from 'react';
import { TRANSLATIONS } from './i18n.js';

export const LanguageContext = createContext('ru');

export function useT(section) {
  const lang = useContext(LanguageContext);
  const fallback = TRANSLATIONS.ru[section] || {};
  const tr = TRANSLATIONS[lang]?.[section] || {};
  return (key) => tr[key] ?? fallback[key] ?? key;
}
