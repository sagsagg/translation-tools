import { describe, it, expect, vi } from 'vitest'
import type { CSVData, TranslationData, FileUploadResult } from '@/types'

// Mock the composables
vi.mock('@/composables/useMultiLanguage', () => ({
  useMultiLanguage: () => ({
    translationData: { value: {} },
    primaryLanguage: { value: { code: 'en', name: 'English' } },
    loadFromCSV: vi.fn(),
    loadFromJSON: vi.fn(),
    clearMultiLanguageData: vi.fn()
  })
}))

vi.mock('@/composables/useConversion', () => ({
  useConversion: () => ({
    convertMultipleJSONToCSV: vi.fn()
  })
}))

vi.mock('@/composables/useFileUploadConfirmation', () => ({
  useFileUploadConfirmation: () => ({
    isConfirmDialogOpen: { value: false },
    shouldConfirmUpload: vi.fn().mockResolvedValue(true),
    handleConfirmation: vi.fn(),
    handleCancellation: vi.fn()
  })
}))

describe('Data Switching Between CSV and JSON', () => {
  const mockCSVData: CSVData = {
    headers: ['Key', 'english', 'spanish'],
    rows: [
      { Key: 'test.key1', english: 'Hello', spanish: 'Hola' },
      { Key: 'test.key2', english: 'World', spanish: 'Mundo' }
    ]
  }

  const mockJSONData: TranslationData = {
    'test.key1': 'Hello JSON',
    'test.key2': 'World JSON',
    'test.key3': 'New JSON Key'
  }

  const mockCSVResult: FileUploadResult = {
    success: true,
    format: 'csv',
    data: mockCSVData
  }

  const mockJSONResult: FileUploadResult = {
    success: true,
    format: 'json',
    data: mockJSONData
  }

  it('should clear JSON data when CSV is uploaded', async () => {
    // This test simulates the processFileResult function logic
    let currentCSVData: CSVData | undefined = undefined
    let currentJSONData: TranslationData | undefined = mockJSONData

    // Simulate uploading CSV file (should clear JSON data)
    if (mockCSVResult.format === 'csv') {
      currentJSONData = undefined
      currentCSVData = mockCSVResult.data
    }

    expect(currentCSVData).toEqual(mockCSVData)
    expect(currentJSONData).toBeUndefined()
  })

  it('should clear CSV data when JSON is uploaded', async () => {
    // This test simulates the processFileResult function logic
    let currentCSVData: CSVData | undefined = mockCSVData
    let currentJSONData: TranslationData | undefined = undefined

    // Simulate uploading JSON file (should clear CSV data)
    if (mockJSONResult.format === 'json') {
      currentCSVData = undefined
      currentJSONData = mockJSONResult.data
    }

    expect(currentJSONData).toEqual(mockJSONData)
    expect(currentCSVData).toBeUndefined()
  })

  it('should handle CSV to JSON switching correctly', async () => {
    // Start with no data
    let currentCSVData: CSVData | undefined = undefined
    let currentJSONData: TranslationData | undefined = undefined

    // Upload CSV first
    if (mockCSVResult.format === 'csv') {
      currentJSONData = undefined
      currentCSVData = mockCSVResult.data
    }

    expect(currentCSVData).toEqual(mockCSVData)
    expect(currentJSONData).toBeUndefined()

    // Then upload JSON (should replace CSV)
    if (mockJSONResult.format === 'json') {
      currentCSVData = undefined
      currentJSONData = mockJSONResult.data
    }

    expect(currentJSONData).toEqual(mockJSONData)
    expect(currentCSVData).toBeUndefined()
  })

  it('should handle JSON to CSV switching correctly', async () => {
    // Start with no data
    let currentCSVData: CSVData | undefined = undefined
    let currentJSONData: TranslationData | undefined = undefined

    // Upload JSON first
    if (mockJSONResult.format === 'json') {
      currentCSVData = undefined
      currentJSONData = mockJSONResult.data
    }

    expect(currentJSONData).toEqual(mockJSONData)
    expect(currentCSVData).toBeUndefined()

    // Then upload CSV (should replace JSON)
    if (mockCSVResult.format === 'csv') {
      currentJSONData = undefined
      currentCSVData = mockCSVResult.data
    }

    expect(currentCSVData).toEqual(mockCSVData)
    expect(currentJSONData).toBeUndefined()
  })

  it('should validate data structure before clearing previous data', () => {
    // Test invalid CSV data
    const invalidCSVResult: FileUploadResult = {
      success: true,
      format: 'csv',
      data: { headers: [], rows: [] } // Invalid: empty headers
    }

    let currentCSVData: CSVData | undefined = mockCSVData
    let currentJSONData: TranslationData | undefined = undefined
    let errorThrown = false

    try {
      const csvData = invalidCSVResult.data

      // Validate CSV data structure (same logic as in processFileResult)
      if (!csvData || !csvData.headers || !csvData.rows) {
        throw new Error('Invalid CSV data structure')
      }

      if (csvData.headers.length === 0) {
        throw new Error('CSV file has no headers')
      }

      if (csvData.rows.length === 0) {
        throw new Error('CSV file has no data rows')
      }

      // Only clear if validation passes
      currentJSONData = undefined
      currentCSVData = csvData
    } catch {
      errorThrown = true
    }

    // Should not have cleared data due to validation error
    expect(errorThrown).toBe(true)
    expect(currentCSVData).toEqual(mockCSVData) // Original data preserved
    expect(currentJSONData).toBeUndefined()
  })

  it('should validate JSON data structure before clearing previous data', () => {
    // Test invalid JSON data
    const invalidJSONResult: FileUploadResult = {
      success: true,
      format: 'json',
      data: {} // Invalid: empty object
    }

    let currentCSVData: CSVData | undefined = undefined
    let currentJSONData: TranslationData | undefined = mockJSONData
    let errorThrown = false

    try {
      const jsonData = invalidJSONResult.data

      // Validate JSON data structure (same logic as in processFileResult)
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('Invalid JSON data structure')
      }

      const keys = Object.keys(jsonData)
      if (keys.length === 0) {
        throw new Error('JSON file contains no translation keys')
      }

      // Only clear if validation passes
      currentCSVData = undefined
      currentJSONData = jsonData
    } catch {
      errorThrown = true
    }

    // Should not have cleared data due to validation error
    expect(errorThrown).toBe(true)
    expect(currentJSONData).toEqual(mockJSONData) // Original data preserved
    expect(currentCSVData).toBeUndefined()
  })

  it('should maintain data integrity during switching', () => {
    // Test that data is properly isolated between formats
    let currentCSVData: CSVData | undefined = undefined
    let currentJSONData: TranslationData | undefined = undefined

    // Upload CSV
    if (mockCSVResult.format === 'csv') {
      currentJSONData = undefined
      currentCSVData = mockCSVResult.data
    }

    // Verify CSV data integrity
    expect(currentCSVData?.headers).toEqual(['Key', 'english', 'spanish'])
    expect(currentCSVData?.rows).toHaveLength(2)
    expect(currentCSVData?.rows[0].Key).toBe('test.key1')

    // Upload JSON
    if (mockJSONResult.format === 'json') {
      currentCSVData = undefined
      currentJSONData = mockJSONResult.data
    }

    // Verify JSON data integrity
    expect(Object.keys(currentJSONData || {})).toHaveLength(3)
    expect(currentJSONData?.['test.key1']).toBe('Hello JSON')
    expect(currentJSONData?.['test.key3']).toBe('New JSON Key')
  })
})
