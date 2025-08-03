// Export all stores for easy importing
export { useTranslationStore } from './translation'
export { useLanguageStore } from './language'
export { useFileStore } from './files'
export { useUIStore } from './ui'

// Re-export Pinia for convenience
export { createPinia, defineStore, storeToRefs } from 'pinia'

// Store composition utilities
import { useTranslationStore } from './translation'
import { useLanguageStore } from './language'
import { useFileStore } from './files'
import { useUIStore } from './ui'

/**
 * Composable that provides access to all stores
 * Useful for components that need multiple stores
 */
export function useStores() {
  const translationStore = useTranslationStore()
  const languageStore = useLanguageStore()
  const fileStore = useFileStore()
  const uiStore = useUIStore()

  return {
    translation: translationStore,
    language: languageStore,
    files: fileStore,
    ui: uiStore
  }
}

/**
 * Utility to reset all stores to their initial state
 * Useful for testing or when starting fresh
 */
export function resetAllStores() {
  const { translation, language, files, ui } = useStores()
  
  translation.clearAllData()
  language.resetToDefaults()
  files.clearAllFiles()
  ui.resetUIState()
}

/**
 * Utility to get a snapshot of all store states
 * Useful for debugging or state persistence
 */
export function getAllStoreSnapshots() {
  const { translation, language, files, ui } = useStores()
  
  return {
    translation: {
      hasData: translation.hasData,
      hasCSVData: translation.hasCSVData,
      hasJSONData: translation.hasJSONData,
      hasMultiLanguageData: translation.hasMultiLanguageData,
      totalEntries: translation.totalEntries
    },
    language: {
      selectedLanguages: language.selectedLanguages,
      primaryLanguage: language.primaryLanguage,
      languageOptions: language.languageOptions,
      hasMultipleLanguages: language.hasMultipleLanguages
    },
    files: {
      fileCount: files.fileCount,
      totalSize: files.totalSize,
      availableLanguageCodes: files.availableLanguageCodes,
      isUploading: files.isUploading
    },
    ui: ui.getUISnapshot()
  }
}
