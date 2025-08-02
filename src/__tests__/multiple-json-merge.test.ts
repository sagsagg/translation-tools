import { describe, it, expect } from 'vitest'
import type { TranslationData, CSVData, CSVRow } from '@/types'

// Mock the mergeJSONFilesToCSV function logic for testing
function mergeJSONFilesToCSV(uploads: { languageCode: string; data: TranslationData }[]): CSVData {
  // Get language names from language codes
  const getLanguageName = (code: string): string => {
    const languageMap: Record<string, string> = {
      'en': 'English',
      'id': 'Indonesian',
      'zh-cn': 'Chinese_Simplified',
      'zh-tw': 'Chinese_Traditional'
    }
    return languageMap[code] || code
  }

  // Get all unique translation keys from all files
  const allKeys = new Set<string>()
  for (const upload of uploads) {
    Object.keys(upload.data).forEach(key => allKeys.add(key))
  }

  // Create language map for easy lookup
  const languageData: Record<string, TranslationData> = {}
  for (const upload of uploads) {
    const languageName = getLanguageName(upload.languageCode)
    languageData[languageName] = upload.data
  }

  // Create headers: Key + language names
  const languageNames = Object.keys(languageData).sort()
  const headers = ['Key', ...languageNames]

  // Create rows
  const rows: CSVRow[] = Array.from(allKeys).sort().map(key => {
    const row: CSVRow = { Key: key }

    // Add translation for each language
    for (const languageName of languageNames) {
      row[languageName] = languageData[languageName][key] || ''
    }

    return row
  })

  return { headers, rows }
}

describe('Multiple JSON File Merging', () => {
  const mockEnglishData: TranslationData = {
    'app.welcome': 'Welcome',
    'app.login': 'Login',
    'nav.home': 'Home'
  }

  const mockChineseSimplifiedData: TranslationData = {
    'app.welcome': '欢迎',
    'app.login': '登录',
    'nav.home': '首页'
  }

  const mockChineseTraditionalData: TranslationData = {
    'app.welcome': '歡迎',
    'app.login': '登錄',
    'nav.home': '首頁'
  }

  const mockUploads = [
    { languageCode: 'en', data: mockEnglishData },
    { languageCode: 'zh-cn', data: mockChineseSimplifiedData },
    { languageCode: 'zh-tw', data: mockChineseTraditionalData }
  ]

  describe('mergeJSONFilesToCSV', () => {
    it('should merge multiple JSON files into CSV structure', () => {
      const result = mergeJSONFilesToCSV(mockUploads)

      expect(result.headers).toEqual(['Key', 'Chinese_Simplified', 'Chinese_Traditional', 'English'])
      expect(result.rows).toHaveLength(3)

      // Check first row
      const firstRow = result.rows.find(row => row.Key === 'app.login')
      expect(firstRow).toBeDefined()
      expect(firstRow?.Key).toBe('app.login')
      expect(firstRow?.English).toBe('Login')
      expect(firstRow?.Chinese_Simplified).toBe('登录')
      expect(firstRow?.Chinese_Traditional).toBe('登錄')
    })

    it('should handle missing translations gracefully', () => {
      const englishData: TranslationData = { 'app.welcome': 'Welcome', 'app.login': 'Login' }
      const chineseData: TranslationData = { 'app.welcome': '欢迎' } // Missing app.login

      const uploadsWithMissing = [
        { languageCode: 'en', data: englishData },
        { languageCode: 'zh-cn', data: chineseData }
      ]

      const result = mergeJSONFilesToCSV(uploadsWithMissing)

      expect(result.headers).toEqual(['Key', 'Chinese_Simplified', 'English'])
      expect(result.rows).toHaveLength(2)

      const loginRow = result.rows.find(row => row.Key === 'app.login')
      expect(loginRow).toBeDefined()
      expect(loginRow?.English).toBe('Login')
      expect(loginRow?.Chinese_Simplified).toBe('') // Empty for missing translation
    })

    it('should sort keys and languages alphabetically', () => {
      const result = mergeJSONFilesToCSV(mockUploads)

      // Keys should be sorted
      const keys = result.rows.map(row => row.Key)
      expect(keys).toEqual(['app.login', 'app.welcome', 'nav.home'])

      // Languages should be sorted (excluding Key column)
      const languages = result.headers.slice(1)
      expect(languages).toEqual(['Chinese_Simplified', 'Chinese_Traditional', 'English'])
    })

    it('should handle single JSON file', () => {
      const singleUpload = [{ languageCode: 'en', data: mockEnglishData }]
      const result = mergeJSONFilesToCSV(singleUpload)

      expect(result.headers).toEqual(['Key', 'English'])
      expect(result.rows).toHaveLength(3)

      const welcomeRow = result.rows.find(row => row.Key === 'app.welcome')
      expect(welcomeRow?.English).toBe('Welcome')
    })

    it('should handle empty uploads array', () => {
      const result = mergeJSONFilesToCSV([])

      expect(result.headers).toEqual(['Key'])
      expect(result.rows).toEqual([])
    })

    it('should handle uploads with empty data', () => {
      const emptyEnglishData: TranslationData = {}
      const emptyChineseData: TranslationData = {}

      const emptyUploads = [
        { languageCode: 'en', data: emptyEnglishData },
        { languageCode: 'zh-cn', data: emptyChineseData }
      ]

      const result = mergeJSONFilesToCSV(emptyUploads)

      expect(result.headers).toEqual(['Key', 'Chinese_Simplified', 'English'])
      expect(result.rows).toEqual([])
    })
  })

  describe('Language Code Mapping', () => {
    it('should map language codes to human-readable names', () => {
      const testEnglishData: TranslationData = { 'test': 'test' }
      const testIndonesianData: TranslationData = { 'test': 'tes' }
      const testChineseSimplifiedData: TranslationData = { 'test': '测试' }
      const testChineseTraditionalData: TranslationData = { 'test': '測試' }

      const uploads = [
        { languageCode: 'en', data: testEnglishData },
        { languageCode: 'id', data: testIndonesianData },
        { languageCode: 'zh-cn', data: testChineseSimplifiedData },
        { languageCode: 'zh-tw', data: testChineseTraditionalData }
      ]

      const result = mergeJSONFilesToCSV(uploads)

      expect(result.headers).toEqual([
        'Key',
        'Chinese_Simplified',
        'Chinese_Traditional',
        'English',
        'Indonesian'
      ])
    })

    it('should handle unknown language codes', () => {
      const unknownLanguageData: TranslationData = { 'test': 'test' }

      const uploads = [
        { languageCode: 'unknown', data: unknownLanguageData }
      ]

      const result = mergeJSONFilesToCSV(uploads)

      expect(result.headers).toEqual(['Key', 'unknown'])
    })
  })

  describe('Data Structure Validation', () => {
    it('should create proper CSVRow structure', () => {
      const result = mergeJSONFilesToCSV(mockUploads)

      // Each row should have Key property and language properties
      for (const row of result.rows) {
        expect(row).toHaveProperty('Key')
        expect(typeof row.Key).toBe('string')
        expect(row.Key.length).toBeGreaterThan(0)

        // Should have all language columns
        expect(row).toHaveProperty('English')
        expect(row).toHaveProperty('Chinese_Simplified')
        expect(row).toHaveProperty('Chinese_Traditional')
      }
    })

    it('should maintain data integrity across languages', () => {
      const result = mergeJSONFilesToCSV(mockUploads)

      // Check that all original data is preserved
      const welcomeRow = result.rows.find(row => row.Key === 'app.welcome')
      expect(welcomeRow?.English).toBe(mockEnglishData['app.welcome'])
      expect(welcomeRow?.Chinese_Simplified).toBe(mockChineseSimplifiedData['app.welcome'])
      expect(welcomeRow?.Chinese_Traditional).toBe(mockChineseTraditionalData['app.welcome'])
    })
  })
})
