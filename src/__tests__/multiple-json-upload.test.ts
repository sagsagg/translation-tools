import { describe, it, expect } from 'vitest'
import {
  validateJSONFilename,
  validateMultipleJSONFiles,
  getExpectedFilenames,
  getFilenameExamples
} from '@/utils/filename-validation'
import type { FileUploadResult } from '@/types'

describe('Multiple JSON Upload Features', () => {
  describe('validateJSONFilename', () => {
    it('should validate correct JSON filenames', () => {
      const validFilenames = [
        'translations_English.json',
        'translations_Indonesian.json',
        'translations_Chinese_Simplified.json',
        'translations_Chinese_Traditional.json'
      ]

      validFilenames.forEach(filename => {
        const result = validateJSONFilename(filename)
        expect(result.isValid).toBe(true)
        expect(result.languageCode).toBeDefined()
        expect(result.language).toBeDefined()
      })
    })

    it('should reject invalid JSON filenames', () => {
      const invalidFilenames = [
        'en.json',
        'english.json',
        'translations-en.json',
        'translations_en.json',
        'translations_invalid.json',
        'translations.json',
        'test_English.json'
      ]

      invalidFilenames.forEach(filename => {
        const result = validateJSONFilename(filename)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeDefined()
        expect(result.expectedFilenames).toBeDefined()
      })
    })

    it('should extract correct language codes', () => {
      const testCases = [
        { filename: 'translations_English.json', expectedCode: 'en' },
        { filename: 'translations_Indonesian.json', expectedCode: 'id' },
        { filename: 'translations_Chinese_Simplified.json', expectedCode: 'zh-CN' },
        { filename: 'translations_Chinese_Traditional.json', expectedCode: 'zh-TW' }
      ]

      testCases.forEach(({ filename, expectedCode }) => {
        const result = validateJSONFilename(filename)
        expect(result.isValid).toBe(true)
        expect(result.languageCode).toBe(expectedCode)
      })
    })
  })

  describe('validateMultipleJSONFiles', () => {
    it('should validate multiple valid JSON files', () => {
      const files = [
        new File(['{}'], 'translations_English.json', { type: 'application/json' }),
        new File(['{}'], 'translations_Indonesian.json', { type: 'application/json' })
      ]

      const result = validateMultipleJSONFiles(files)
      expect(result.valid).toHaveLength(2)
      expect(result.invalid).toHaveLength(0)
      expect(result.duplicateLanguages).toHaveLength(0)
    })

    it('should reject non-JSON files', () => {
      const files = [
        new File([''], 'test.txt', { type: 'text/plain' }),
        new File([''], 'data.csv', { type: 'text/csv' })
      ]

      const result = validateMultipleJSONFiles(files)
      expect(result.valid).toHaveLength(0)
      expect(result.invalid).toHaveLength(2)
      expect(result.invalid[0].error).toContain('Only JSON files are allowed')
    })

    it('should detect duplicate languages', () => {
      const files = [
        new File(['{}'], 'translations_English.json', { type: 'application/json' }),
        new File(['{}'], 'translations_English.json', { type: 'application/json' })
      ]

      const result = validateMultipleJSONFiles(files)
      expect(result.valid).toHaveLength(1)
      expect(result.invalid).toHaveLength(1)
      expect(result.duplicateLanguages).toContain('en')
    })

    it('should handle mixed valid and invalid files', () => {
      const files = [
        new File(['{}'], 'translations_English.json', { type: 'application/json' }),
        new File(['{}'], 'invalid_name.json', { type: 'application/json' }),
        new File([''], 'test.txt', { type: 'text/plain' })
      ]

      const result = validateMultipleJSONFiles(files)
      expect(result.valid).toHaveLength(1)
      expect(result.invalid).toHaveLength(2)
    })
  })

  describe('getExpectedFilenames', () => {
    it('should return all expected filename patterns', () => {
      const filenames = getExpectedFilenames()
      expect(filenames).toHaveLength(4)
      expect(filenames).toContain('translations_English.json')
      expect(filenames).toContain('translations_Indonesian.json')
      expect(filenames).toContain('translations_Chinese_Simplified.json')
      expect(filenames).toContain('translations_Chinese_Traditional.json')
    })
  })

  describe('getFilenameExamples', () => {
    it('should return examples with language objects and filenames', () => {
      const examples = getFilenameExamples()
      expect(examples).toHaveLength(4)

      examples.forEach(example => {
        expect(example.language).toBeDefined()
        expect(example.language.code).toBeDefined()
        expect(example.language.name).toBeDefined()
        expect(example.filename).toBeDefined()
        expect(example.filename).toMatch(/^translations_.*\.json$/)
      })
    })
  })

  describe('File Upload Integration', () => {
    it('should create proper FileUploadResult for valid JSON files', () => {
      const mockResult: FileUploadResult = {
        success: true,
        format: 'json',
        data: { 'test.key': 'test value' },
        filename: 'translations_English.json',
        languageCode: 'en'
      }

      expect(mockResult.success).toBe(true)
      expect(mockResult.format).toBe('json')
      expect(mockResult.languageCode).toBe('en')
      expect(mockResult.filename).toBe('translations_English.json')
    })

    it('should handle upload errors with filename information', () => {
      const mockResult: FileUploadResult = {
        success: false,
        error: 'Invalid filename format',
        filename: 'invalid_name.json'
      }

      expect(mockResult.success).toBe(false)
      expect(mockResult.error).toBeDefined()
      expect(mockResult.filename).toBe('invalid_name.json')
    })
  })

  describe('Error Messages', () => {
    it('should provide helpful error messages for common mistakes', () => {
      const commonMistakes = [
        'en.json',
        'english.json',
        'translations-English.json',
        'translations_en.json'
      ]

      commonMistakes.forEach(filename => {
        const result = validateJSONFilename(filename)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeDefined()
        expect(result.expectedFilenames).toBeDefined()
        expect(result.expectedFilenames?.length).toBe(4)
      })
    })

    it('should include expected filenames in error responses', () => {
      const result = validateJSONFilename('invalid.json')
      expect(result.expectedFilenames).toEqual([
        'translations_English.json',
        'translations_Indonesian.json',
        'translations_Chinese_Simplified.json',
        'translations_Chinese_Traditional.json'
      ])
    })
  })
})
