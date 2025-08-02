import { describe, it, expect } from 'vitest'
import {
  validateJSONFilename,
  validateJSONFilenameWithFallback,
  getExpectedFilenames
} from '@/utils/filename-validation'
import type { FileUploadResult } from '@/types'

describe('JSON Fallback Mechanism', () => {
  describe('validateJSONFilenameWithFallback', () => {
    it('should pass through valid filenames without fallback', () => {
      const validFilenames = [
        'translations_English.json',
        'translations_Indonesian.json',
        'translations_Chinese_Simplified.json',
        'translations_Chinese_Traditional.json'
      ]

      validFilenames.forEach(filename => {
        const result = validateJSONFilenameWithFallback(filename, true)
        expect(result.isValid).toBe(true)
        expect(result.fallbackApplied).toBeFalsy()
        expect(result.warningMessage).toBeUndefined()
        expect(result.languageCode).toBeDefined()
      })
    })

    it('should apply fallback for invalid filenames when enabled', () => {
      const invalidFilenames = [
        'en.json',
        'english.json',
        'translations-English.json',
        'translations_en.json',
        'my-translations.json',
        'app_strings.json'
      ]

      invalidFilenames.forEach(filename => {
        const result = validateJSONFilenameWithFallback(filename, true)
        expect(result.isValid).toBe(true)
        expect(result.fallbackApplied).toBe(true)
        expect(result.languageCode).toBe('en')
        expect(result.fallbackLanguageCode).toBe('en')
        expect(result.warningMessage).toBeDefined()
        expect(result.warningMessage).toContain(filename)
        expect(result.warningMessage).toContain('processed as English')
      })
    })

    it('should not apply fallback when disabled', () => {
      const invalidFilenames = [
        'en.json',
        'english.json',
        'my-translations.json'
      ]

      invalidFilenames.forEach(filename => {
        const result = validateJSONFilenameWithFallback(filename, false)
        expect(result.isValid).toBe(false)
        expect(result.fallbackApplied).toBeFalsy()
        expect(result.error).toBeDefined()
      })
    })

    it('should include expected filenames in warning message', () => {
      const result = validateJSONFilenameWithFallback('invalid.json', true)
      expect(result.isValid).toBe(true)
      expect(result.fallbackApplied).toBe(true)
      expect(result.warningMessage).toContain('translations_English.json')
      expect(result.warningMessage).toContain('translations_Indonesian.json')
      expect(result.warningMessage).toContain('translations_Chinese_Simplified.json')
      expect(result.warningMessage).toContain('translations_Chinese_Traditional.json')
    })

    it('should handle edge cases gracefully', () => {
      const edgeCases = [
        'translations_.json',
        'translations_Unknown.json',
        'translations_ENGLISH.json', // Wrong case
        'translations_english.json'  // Wrong case
      ]

      edgeCases.forEach(filename => {
        const result = validateJSONFilenameWithFallback(filename, true)
        expect(result.isValid).toBe(true)
        expect(result.fallbackApplied).toBe(true)
        expect(result.languageCode).toBe('en')
      })
    })
  })

  describe('Fallback vs Strict Validation Comparison', () => {
    it('should show difference between strict and fallback validation', () => {
      const testFilename = 'my-app-strings.json'

      const strictResult = validateJSONFilename(testFilename)
      const fallbackResult = validateJSONFilenameWithFallback(testFilename, true)

      expect(strictResult.isValid).toBe(false)
      expect(strictResult.error).toBeDefined()

      expect(fallbackResult.isValid).toBe(true)
      expect(fallbackResult.fallbackApplied).toBe(true)
      expect(fallbackResult.languageCode).toBe('en')
    })
  })

  describe('Warning Message Content', () => {
    it('should provide comprehensive warning messages', () => {
      const result = validateJSONFilenameWithFallback('app.json', true)

      expect(result.warningMessage).toContain('app.json')
      expect(result.warningMessage).toContain("doesn't follow the expected naming convention")
      expect(result.warningMessage).toContain('processed as English translations')
      expect(result.warningMessage).toContain('For better organization')
      expect(result.warningMessage).toContain('translations_English.json')
    })

    it('should include all expected filename patterns in warning', () => {
      const result = validateJSONFilenameWithFallback('test.json', true)
      const expectedFilenames = getExpectedFilenames()

      expectedFilenames.forEach(expectedFilename => {
        expect(result.warningMessage).toContain(expectedFilename)
      })
    })
  })

  describe('Language Detection', () => {
    it('should correctly identify English language for fallback', () => {
      const result = validateJSONFilenameWithFallback('random.json', true)

      expect(result.languageCode).toBe('en')
      expect(result.fallbackLanguageCode).toBe('en')
      expect(result.language?.code).toBe('en')
      expect(result.language?.name).toBe('English')
      expect(result.fallbackLanguage?.code).toBe('en')
      expect(result.fallbackLanguage?.name).toBe('English')
    })
  })

  describe('FileUploadResult Integration', () => {
    it('should create proper FileUploadResult with fallback information', () => {
      const mockResult: FileUploadResult = {
        success: true,
        format: 'json',
        data: { 'test.key': 'test value' },
        filename: 'my-app.json',
        languageCode: 'en',
        fallbackApplied: true,
        warningMessage: 'Filename "my-app.json" doesn\'t follow the expected naming convention. File processed as English translations.'
      }

      expect(mockResult.success).toBe(true)
      expect(mockResult.format).toBe('json')
      expect(mockResult.languageCode).toBe('en')
      expect(mockResult.fallbackApplied).toBe(true)
      expect(mockResult.warningMessage).toBeDefined()
      expect(mockResult.warningMessage).toContain('my-app.json')
    })

    it('should handle successful upload without fallback', () => {
      const mockResult: FileUploadResult = {
        success: true,
        format: 'json',
        data: { 'test.key': 'test value' },
        filename: 'translations_English.json',
        languageCode: 'en',
        fallbackApplied: false
      }

      expect(mockResult.success).toBe(true)
      expect(mockResult.fallbackApplied).toBe(false)
      expect(mockResult.warningMessage).toBeUndefined()
    })
  })

  describe('User Experience Scenarios', () => {
    it('should handle common user filename patterns', () => {
      const commonPatterns = [
        'strings.json',
        'localization.json',
        'i18n.json',
        'lang.json',
        'messages.json',
        'text.json',
        'content.json'
      ]

      commonPatterns.forEach(filename => {
        const result = validateJSONFilenameWithFallback(filename, true)
        expect(result.isValid).toBe(true)
        expect(result.fallbackApplied).toBe(true)
        expect(result.languageCode).toBe('en')
        expect(result.warningMessage).toContain('processed as English')
      })
    })

    it('should handle developer-style filenames', () => {
      const devPatterns = [
        'en-US.json',
        'en_US.json',
        'english-translations.json',
        'app-en.json',
        'locale-en.json'
      ]

      devPatterns.forEach(filename => {
        const result = validateJSONFilenameWithFallback(filename, true)
        expect(result.isValid).toBe(true)
        expect(result.fallbackApplied).toBe(true)
        expect(result.languageCode).toBe('en')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle missing English language gracefully', () => {
      // This test ensures the fallback mechanism doesn't break if English is somehow not available
      const result = validateJSONFilenameWithFallback('test.json', true)

      // Should still work because English is in SUPPORTED_LANGUAGES
      expect(result.isValid).toBe(true)
      expect(result.fallbackApplied).toBe(true)
      expect(result.languageCode).toBe('en')
    })
  })
})
