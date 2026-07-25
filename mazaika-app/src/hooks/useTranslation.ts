import { useState, useEffect } from 'react'
import { translations, Language } from '../i18n/translations'

export function useTranslation() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('mazaika_lang') as Language) || 'UZ'
  })

  useEffect(() => {
    const handleStorageChange = () => {
      const storedLang = localStorage.getItem('mazaika_lang') as Language
      if (storedLang && storedLang !== lang) {
        setLang(storedLang)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen to a custom event for same-tab changes
    window.addEventListener('mazaika_lang_changed', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('mazaika_lang_changed', handleStorageChange)
    }
  }, [lang])

  const changeLanguage = (newLang: Language) => {
    localStorage.setItem('mazaika_lang', newLang)
    setLang(newLang)
    window.dispatchEvent(new Event('mazaika_lang_changed'))
  }

  const t = (key: keyof typeof translations['UZ']): string => {
    return translations[lang][key] || translations['UZ'][key] || key
  }

  return { t, lang, changeLanguage }
}
