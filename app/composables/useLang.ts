
export const useLanguage = () => {
    const i18n = useI18n()


    const lang = useState('en');
    lang.value = i18n.locale;
    const setLanguage = (lang) => {
      i18n.setLocale(lang);
      console.log(`Setting language to ${lang}`)
      try {
          localStorage.setItem('user-lang', lang)
      }
        catch(e) {
            console.log(e)
        }

    }
    const getLanguage:string = () => {
        lang.value = localStorage.getItem('user-lang') || 'km';
        return lang;
    }
    // toggle language
    const toggleLanguage = () => {
      lang.value = lang.value === 'en' ? 'km' : 'en';
      setLanguage(lang.value)
    }

  
    return { setLanguage, getLanguage, toggleLanguage, lang }
  }
  