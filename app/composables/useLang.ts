
export const useLanguage = () => {
    const i18n = useI18n()
    
    const lang = useState<'en' | 'km'>('current-lang', () => i18n.locale.value as 'en' | 'km');
    
    const setLanguage = (newLang: 'en' | 'km') => {
      i18n.setLocale(newLang);
      lang.value = newLang;
      console.log(`Setting language to ${newLang}`)
      try {
          localStorage.setItem('user-lang', newLang)
      } catch(e) {
          console.log(e)
      }
    }
    
    const getLanguage = (): 'en' | 'km' => {
        const savedLang = localStorage.getItem('user-lang') || 'en';
        const validLang = (savedLang === 'en' || savedLang === 'km') ? savedLang : 'en';
        lang.value = validLang;
        return validLang;
    }
    
    // toggle language
    const toggleLanguage = () => {
      const newLang = lang.value === 'en' ? 'km' : 'en';
      setLanguage(newLang);
    }

    // Initialize language from localStorage on first use
    const initializeLanguage = () => {
      const savedLang = getLanguage();
      setLanguage(savedLang);
    }
  
    return { setLanguage, getLanguage, toggleLanguage, initializeLanguage, lang }
}
  