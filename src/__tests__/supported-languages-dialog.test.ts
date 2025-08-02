import { describe, it, expect } from 'vitest'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'

describe('SupportedLanguagesDialog Data', () => {
  it('should have valid supported languages data', () => {
    // Check that we have supported languages
    expect(SUPPORTED_LANGUAGES).toBeDefined()
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThan(0)

    // Check that all non-null languages have required properties
    const validLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== null)

    validLanguages.forEach(language => {
      if (language) {
        expect(language.code).toBeDefined()
        expect(language.name).toBeDefined()
        expect(language.nativeName).toBeDefined()
        expect(typeof language.code).toBe('string')
        expect(typeof language.name).toBe('string')
        expect(typeof language.nativeName).toBe('string')
      }
    })
  })

  it('should include only the four supported languages', () => {
    const validLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== null)

    // Check that we have exactly 4 languages
    expect(validLanguages.length).toBe(4)

    // Check for the four supported languages
    const languageCodes = validLanguages.map(lang => lang?.code)

    expect(languageCodes).toContain('en') // English
    expect(languageCodes).toContain('id') // Indonesian
    expect(languageCodes).toContain('zh-CN') // Chinese Simplified
    expect(languageCodes).toContain('zh-TW') // Chinese Traditional

    // Ensure no other languages are included
    expect(languageCodes).not.toContain('es') // Spanish should not be included
    expect(languageCodes).not.toContain('fr') // French should not be included
  })

  it('should have proper language name mappings', () => {
    const validLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== null)

    // Find English language
    const english = validLanguages.find(lang => lang?.code === 'en')
    expect(english?.name).toBe('English')
    expect(english?.nativeName).toBe('English')

    // Find Indonesian language
    const indonesian = validLanguages.find(lang => lang?.code === 'id')
    expect(indonesian?.name).toBe('Indonesian')
    expect(indonesian?.nativeName).toBe('Bahasa Indonesia')

    // Find Chinese Simplified
    const chineseSimplified = validLanguages.find(lang => lang?.code === 'zh-CN')
    expect(chineseSimplified?.name).toBe('Chinese Simplified')
    expect(chineseSimplified?.nativeName).toBe('简体中文')

    // Find Chinese Traditional
    const chineseTraditional = validLanguages.find(lang => lang?.code === 'zh-TW')
    expect(chineseTraditional?.name).toBe('Chinese Traditional')
    expect(chineseTraditional?.nativeName).toBe('繁體中文')
  })
})
