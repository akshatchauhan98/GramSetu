import { createContext, useContext, useEffect, useState } from 'react'
import { translations } from '../data/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  // Read persisted language or default to 'en'
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('gramsetu_lang') || 'en'
  })

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'hi') {
      setLanguageState(lang)
      localStorage.setItem('gramsetu_lang', lang)
    }
  }

  // Translation helper function
  const t = (keyPath, fallback = '') => {
    const keys = keyPath.split('.')
    let current = translations[language] || translations.en
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key]
      } else {
        // Fallback to English if missing
        let fb = translations.en
        for (const k of keys) {
          if (fb && fb[k] !== undefined) fb = fb[k]
          else return fallback || keyPath
        }
        return fb
      }
    }
    return current
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
