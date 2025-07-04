import type { UserPreferences } from '~/models/userPreference'

export const useUserPreferences = () => {

  const storage = useStorage<UserPreferences>()
  const PREFERENCES_KEY = LOCAL_STORAGE_KEYS.USER_PREFERENCES

  const savePreferences = (preferences: UserPreferences) => {
    return storage.setItem(PREFERENCES_KEY, preferences)
  }

  const getPreferences = (): UserPreferences | null => {
    return storage.getItem(PREFERENCES_KEY)
  }

  const clearPreferences = () => {
    return storage.removeItem(PREFERENCES_KEY)
  }

  return {
    savePreferences,
    getPreferences,
    clearPreferences
  }
}
