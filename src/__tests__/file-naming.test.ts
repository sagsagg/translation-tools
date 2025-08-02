import { describe, it, expect } from 'vitest'
import { getFileNameFromLanguageCode, SUPPORTED_LANGUAGES } from '@/constants/languages'

describe('File Naming Convention', () => {
  it('should generate human-readable file names from language codes', () => {
    // Test English
    expect(getFileNameFromLanguageCode('en')).toBe('English')
    
    // Test Indonesian
    expect(getFileNameFromLanguageCode('id')).toBe('Indonesian')
    
    // Test Chinese Simplified
    expect(getFileNameFromLanguageCode('zh-CN')).toBe('Chinese_Simplified')
    
    // Test Chinese Traditional
    expect(getFileNameFromLanguageCode('zh-TW')).toBe('Chinese_Traditional')
  })

  it('should handle unknown language codes gracefully', () => {
    // Should return the original code if language not found
    expect(getFileNameFromLanguageCode('unknown')).toBe('unknown')
    expect(getFileNameFromLanguageCode('xyz')).toBe('xyz')
  })

  it('should replace spaces with underscores for file safety', () => {
    // Test that spaces are converted to underscores
    const chineseSimplified = getFileNameFromLanguageCode('zh-CN')
    expect(chineseSimplified).toBe('Chinese_Simplified')
    expect(chineseSimplified).not.toContain(' ')
    
    const chineseTraditional = getFileNameFromLanguageCode('zh-TW')
    expect(chineseTraditional).toBe('Chinese_Traditional')
    expect(chineseTraditional).not.toContain(' ')
  })

  it('should work for all supported languages', () => {
    // Test that all supported languages can generate file names
    SUPPORTED_LANGUAGES.forEach(language => {
      const fileName = getFileNameFromLanguageCode(language.code)
      
      // Should not be empty
      expect(fileName).toBeTruthy()
      expect(fileName.length).toBeGreaterThan(0)
      
      // Should not contain spaces
      expect(fileName).not.toContain(' ')
      
      // Should be a valid file name (no special characters except underscore)
      expect(fileName).toMatch(/^[a-zA-Z_]+$/)
    })
  })

  it('should generate expected file names for download scenarios', () => {
    // Test typical download file name patterns
    const baseFilename = 'translations'
    
    SUPPORTED_LANGUAGES.forEach(language => {
      const humanReadableName = getFileNameFromLanguageCode(language.code)
      const expectedJsonFilename = `${baseFilename}_${humanReadableName}.json`
      const expectedCsvFilename = `${baseFilename}_${humanReadableName}.csv`
      
      // Verify the file names are properly formatted
      expect(expectedJsonFilename).toMatch(/^translations_[a-zA-Z_]+\.json$/)
      expect(expectedCsvFilename).toMatch(/^translations_[a-zA-Z_]+\.csv$/)
      
      // Verify specific expected names
      if (language.code === 'en') {
        expect(expectedJsonFilename).toBe('translations_English.json')
      } else if (language.code === 'id') {
        expect(expectedJsonFilename).toBe('translations_Indonesian.json')
      } else if (language.code === 'zh-CN') {
        expect(expectedJsonFilename).toBe('translations_Chinese_Simplified.json')
      } else if (language.code === 'zh-TW') {
        expect(expectedJsonFilename).toBe('translations_Chinese_Traditional.json')
      }
    })
  })

  it('should maintain consistency between language names and file names', () => {
    SUPPORTED_LANGUAGES.forEach(language => {
      const fileName = getFileNameFromLanguageCode(language.code)
      const expectedFileName = language.name.replace(/\s+/g, '_')
      
      expect(fileName).toBe(expectedFileName)
    })
  })

  it('should support only the four specified languages', () => {
    // Verify we have exactly 4 supported languages
    expect(SUPPORTED_LANGUAGES.length).toBe(4)
    
    // Verify the specific languages are supported
    const codes = SUPPORTED_LANGUAGES.map(lang => lang.code)
    expect(codes).toEqual(['en', 'id', 'zh-CN', 'zh-TW'])
    
    // Verify the file names for each
    expect(getFileNameFromLanguageCode('en')).toBe('English')
    expect(getFileNameFromLanguageCode('id')).toBe('Indonesian')
    expect(getFileNameFromLanguageCode('zh-CN')).toBe('Chinese_Simplified')
    expect(getFileNameFromLanguageCode('zh-TW')).toBe('Chinese_Traditional')
  })
})
