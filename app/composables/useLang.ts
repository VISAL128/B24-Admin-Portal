export const useLanguage = () => {
  const { locale, setLocale } = useI18n()

  // Use computed to reactively get current language from i18n
  const lang = computed<'en' | 'km'>(() => locale.value as 'en' | 'km')

  const setLanguage = (newLang: 'en' | 'km') => {
    // Use i18n's setLocale which handles persistence automatically
    setLocale(newLang)
    console.log(`Setting language to ${newLang}`)
  }

  const getLanguage = (): 'en' | 'km' => {
    // Return current locale from i18n (no need for localStorage)
    return locale.value as 'en' | 'km'
  }

  // toggle language
  const toggleLanguage = () => {
    const newLang = lang.value === 'en' ? 'km' : 'en'
    setLanguage(newLang)
  }

  // Initialize language - not needed as i18n handles initialization
  const initializeLanguage = () => {
    // i18n automatically initializes with the configured default locale
    console.log(`Language already initialized to: ${locale.value}`)
  }

  return { setLanguage, getLanguage, toggleLanguage, initializeLanguage, lang }
}
