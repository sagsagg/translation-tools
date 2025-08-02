import { describe, it, expect } from 'vitest'
import { validateJSON, validateCSV, validateTranslationData } from '@/utils/validation'
import type { TranslationData } from '@/types'

describe('Validation utilities', () => {
  describe('JSON validation', () => {
    it('should validate correct JSON', () => {
      const validJSON = JSON.stringify({
        'home.title': 'Welcome',
        'nav.about': 'About Us'
      })

      const result = validateJSON(validJSON)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid JSON syntax', () => {
      const invalidJSON = '{ "key": "value" invalid }'

      const result = validateJSON(invalidJSON)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].type).toBe('syntax')
    })

    it('should reject non-object JSON', () => {
      const arrayJSON = JSON.stringify(['item1', 'item2'])

      const result = validateJSON(arrayJSON)

      expect(result.isValid).toBe(false)
      expect(result.errors[0].type).toBe('structure')
    })

    it('should warn about empty values', () => {
      const jsonWithEmptyValues = JSON.stringify({
        'key1': 'Valid value',
        'key2': '',
        'key3': '   '
      })

      const result = validateJSON(jsonWithEmptyValues)

      expect(result.isValid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.type === 'empty_value')).toBe(true)
    })

    it('should reject non-string values', () => {
      const jsonWithNonStringValues = JSON.stringify({
        'key1': 'Valid string',
        'key2': 123,
        'key3': true
      })

      const result = validateJSON(jsonWithNonStringValues)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.type === 'structure')).toBe(true)
    })
  })

  describe('CSV validation', () => {
    it('should validate correct CSV', () => {
      const validCSV = `Key,English,Chinese
home.title,Welcome,歡迎
nav.about,About Us,關於我們`

      const result = validateCSV(validCSV)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject CSV without Key column', () => {
      const invalidCSV = `Name,English,Chinese
home.title,Welcome,歡迎`

      const result = validateCSV(invalidCSV)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('Key'))).toBe(true)
    })

    it('should reject CSV with insufficient columns', () => {
      const invalidCSV = `Key
home.title`

      const result = validateCSV(invalidCSV)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('2 columns'))).toBe(true)
    })

    it('should detect duplicate keys', () => {
      const csvWithDuplicates = `Key,English
home.title,Welcome
home.title,Welcome Again`

      const result = validateCSV(csvWithDuplicates)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.type === 'duplicate')).toBe(true)
    })

    it('should detect inconsistent column counts', () => {
      const inconsistentCSV = `Key,English,Chinese
home.title,Welcome,歡迎
nav.about,About Us`

      const result = validateCSV(inconsistentCSV)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.type === 'structure')).toBe(true)
    })

    it('should warn about empty values', () => {
      const csvWithEmptyValues = `Key,English,Chinese
home.title,Welcome,
nav.about,,關於我們`

      const result = validateCSV(csvWithEmptyValues)

      expect(result.isValid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.type === 'empty_value')).toBe(true)
    })

    it('should handle quoted CSV values', () => {
      const quotedCSV = `Key,English
"home.title","Welcome, friend"
"nav.about","About ""Us"""`

      const result = validateCSV(quotedCSV)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Translation data validation', () => {
    it('should validate correct translation data', () => {
      const validData: TranslationData = {
        'home.title': 'Welcome',
        'nav.about': 'About Us'
      }

      const result = validateTranslationData(validData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject non-string values', () => {
      const invalidData = {
        'home.title': 'Welcome',
        'nav.count': 123
      } as unknown as TranslationData

      const result = validateTranslationData(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.type === 'structure')).toBe(true)
    })

    it('should warn about empty translation data', () => {
      const emptyData: TranslationData = {}

      const result = validateTranslationData(emptyData)

      expect(result.isValid).toBe(true)
      expect(result.warnings.some(w => w.type === 'empty_value')).toBe(true)
    })

    it('should warn about empty values', () => {
      const dataWithEmptyValues: TranslationData = {
        'home.title': 'Welcome',
        'nav.about': '',
        'footer.text': '   '
      }

      const result = validateTranslationData(dataWithEmptyValues)

      expect(result.isValid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.type === 'empty_value')).toBe(true)
    })
  })
})
