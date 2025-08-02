import type { Language } from '@/types'

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English'
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia'
  },
  {
    code: 'zh-CN',
    name: 'Chinese Simplified',
    nativeName: '简体中文'
  },
  {
    code: 'zh-TW',
    name: 'Chinese Traditional',
    nativeName: '繁體中文'
  }
]

export const DEFAULT_LANGUAGE: Language = SUPPORTED_LANGUAGES[0] // English

export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang?.code === code)
}

export const getLanguageName = (code: string): string => {
  const language = getLanguageByCode(code)
  return language ? language.name : code
}

export const getLanguageNativeName = (code: string): string => {
  const language = getLanguageByCode(code)
  return language ? language.nativeName : code
}

export const isValidLanguageCode = (code: string): boolean => {
  return SUPPORTED_LANGUAGES.some(lang => lang?.code === code)
}

export const getLanguageByName = (name: string): Language | undefined => {
  // Normalize the name for comparison
  const normalizedName = name.toLowerCase().trim()

  return SUPPORTED_LANGUAGES.find(lang => {
    // Check exact match first
    if (lang?.name.toLowerCase() === normalizedName) {
      return true
    }

    // Check for common variations
    if (normalizedName === 'english' && lang?.code === 'en') return true
    if (normalizedName === 'indonesian' && lang?.code === 'id') return true
    if (normalizedName === 'bahasa indonesia' && lang?.code === 'id') return true
    if (normalizedName === 'chinese simplified' && lang?.code === 'zh-CN') return true
    if (normalizedName === 'chinese traditional' && lang?.code === 'zh-TW') return true

    return false
  })
}

export const mapLanguageNameToCode = (name: string): string => {
  const language = getLanguageByName(name)
  return language ? language.code : name
}

export const getFileNameFromLanguageCode = (code: string): string => {
  const language = getLanguageByCode(code)
  if (!language) return code

  // Convert language name to file-safe format
  return language.name.replace(/\s+/g, '_')
}
