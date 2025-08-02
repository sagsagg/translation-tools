import { describe, it, expect } from 'vitest'
import { ConversionEngine } from '@/utils/conversion'
import type { TranslationData, Language, MultiLanguageTranslationData } from '@/types'

describe('ConversionEngine', () => {
  const sampleJSON: TranslationData = {
    'home.title': 'Welcome',
    'home.subtitle': 'Get started with our app',
    'nav.about': 'About Us',
    'nav.contact': 'Contact'
  }

  const englishLang: Language = {
    code: 'en',
    name: 'English',
    nativeName: 'English'
  }

  const chineseLang: Language = {
    code: 'zh-TW',
    name: 'Chinese Traditional',
    nativeName: '繁體中文'
  }

  describe('JSON to CSV conversion', () => {
    it('should convert single JSON to CSV correctly', () => {
      const csvContent = ConversionEngine.jsonToCSV(sampleJSON, englishLang)

      expect(csvContent).toContain('"Key","English"')
      expect(csvContent).toContain('"home.title","Welcome"')
      expect(csvContent).toContain('"nav.about","About Us"')
    })

    it('should handle empty JSON', () => {
      const csvContent = ConversionEngine.jsonToCSV({}, englishLang)

      expect(csvContent).toBe('"Key","English"')
    })

    it('should escape quotes in CSV output', () => {
      const jsonWithQuotes: TranslationData = {
        'test.key': 'Value with "quotes" inside'
      }

      const csvContent = ConversionEngine.jsonToCSV(jsonWithQuotes, englishLang)

      expect(csvContent).toContain('"Value with ""quotes"" inside"')
    })
  })

  describe('Multiple JSON to CSV conversion', () => {
    it('should convert multiple language JSON to CSV', () => {
      const multiLangData: MultiLanguageTranslationData = {
        'en': sampleJSON,
        'zh-TW': {
          'home.title': '歡迎',
          'home.subtitle': '開始使用我們的應用程式',
          'nav.about': '關於我們',
          'nav.contact': '聯絡我們'
        }
      }

      const csvContent = ConversionEngine.multipleJSONToCSV(multiLangData, [englishLang, chineseLang])

      expect(csvContent).toContain('"Key","English","Chinese Traditional"')
      expect(csvContent).toContain('"home.title","Welcome","歡迎"')
      expect(csvContent).toContain('"nav.about","About Us","關於我們"')
    })

    it('should handle missing translations in some languages', () => {
      const multiLangData: MultiLanguageTranslationData = {
        'en': sampleJSON,
        'zh-TW': {
          'home.title': '歡迎',
          // Missing other translations
        }
      }

      const csvContent = ConversionEngine.multipleJSONToCSV(multiLangData, [englishLang, chineseLang])

      expect(csvContent).toContain('"home.title","Welcome","歡迎"')
      expect(csvContent).toContain('"home.subtitle","Get started with our app",""')
    })
  })

  describe('Conversion validation', () => {
    it('should validate conversion options correctly', () => {
      const validOptions = {
        sourceFormat: 'json' as const,
        targetFormat: 'csv' as const,
        languages: [englishLang],
        includeEmptyValues: true
      }

      const result = ConversionEngine.validateConversionOptions(validOptions)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid conversion options', () => {
      const invalidOptions = {
        sourceFormat: 'json' as const,
        targetFormat: 'json' as const, // Same as source
        languages: [],
        includeEmptyValues: true
      }

      const result = ConversionEngine.validateConversionOptions(invalidOptions)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Size estimation', () => {
    it('should estimate output size for JSON to CSV conversion', () => {
      const options = {
        sourceFormat: 'json' as const,
        targetFormat: 'csv' as const,
        languages: [englishLang],
        includeEmptyValues: true
      }

      const estimate = ConversionEngine.estimateOutputSize(sampleJSON, options)

      expect(estimate.estimatedSize).toBeGreaterThan(0)
      expect(['bytes', 'KB', 'MB']).toContain(estimate.unit)
    })
  })

  describe('Conversion preview', () => {
    it('should generate preview for JSON to CSV conversion', () => {
      const options = {
        sourceFormat: 'json' as const,
        targetFormat: 'csv' as const,
        languages: [englishLang],
        includeEmptyValues: true
      }

      const preview = ConversionEngine.getConversionPreview(sampleJSON, options, 3)

      expect(preview).toContain('"Key","English"')
      expect(preview).toContain('home.title')
      expect(preview.split('\n').length).toBeLessThanOrEqual(5) // Header + 3 rows + potential "..."
    })
  })
})
