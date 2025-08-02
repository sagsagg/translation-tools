import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  TranslationData
} from '@/types'
import { isValidJSON } from './index'

export function validateJSON(content: string): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Check if it's valid JSON
  if (!isValidJSON(content)) {
    errors.push({
      type: 'syntax',
      message: 'Invalid JSON syntax'
    })
    return { isValid: false, errors, warnings }
  }

  try {
    const data = JSON.parse(content)

    // Check if it's an object
    if (typeof data !== 'object' || Array.isArray(data) || data === null) {
      errors.push({
        type: 'structure',
        message: 'JSON must be an object with key-value pairs'
      })
      return { isValid: false, errors, warnings }
    }

    // Check for duplicate keys (this is handled by JSON.parse, but we can check for empty values)
    const keys = Object.keys(data)
    const duplicateKeys = new Set<string>()
    const seenKeys = new Set<string>()

    for (const key of keys) {
      if (seenKeys.has(key)) {
        duplicateKeys.add(key)
      }
      seenKeys.add(key)
    }

    duplicateKeys.forEach(key => {
      errors.push({
        type: 'duplicate',
        message: `Duplicate key found: ${key}`,
        key
      })
    })

    // Check for empty values
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'string') {
        errors.push({
          type: 'structure',
          message: `Value for key "${key}" must be a string`,
          key
        })
      } else if (value.trim() === '') {
        warnings.push({
          type: 'empty_value',
          message: `Empty value for key: ${key}`,
          key
        })
      }
    }

    // Check for missing keys (at least one key should exist)
    if (keys.length === 0) {
      warnings.push({
        type: 'empty_value',
        message: 'JSON object is empty'
      })
    }

  } catch (error) {
    errors.push({
      type: 'syntax',
      message: `JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function validateCSV(content: string): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!content.trim()) {
    errors.push({
      type: 'structure',
      message: 'CSV file is empty'
    })
    return { isValid: false, errors, warnings }
  }

  // Parse CSV records properly handling multi-line fields
  const records = parseCSVRecords(content)

  if (records.length === 0) {
    errors.push({
      type: 'structure',
      message: 'CSV file is empty'
    })
    return { isValid: false, errors, warnings }
  }

  // Parse header
  const headers = records[0]

  if (headers.length < 2) {
    errors.push({
      type: 'structure',
      message: 'CSV must have at least 2 columns (Key and one language)'
    })
    return { isValid: false, errors, warnings }
  }

  // Check if first column is "Key"
  if (headers[0].toLowerCase() !== 'key') {
    errors.push({
      type: 'structure',
      message: 'First column must be named "Key"'
    })
  }

  // Check for duplicate headers
  const duplicateHeaders = findDuplicates(headers)
  duplicateHeaders.forEach(header => {
    errors.push({
      type: 'duplicate',
      message: `Duplicate column header: ${header}`
    })
  })

  // Validate data rows
  const seenKeys = new Set<string>()

  for (let i = 1; i < records.length; i++) {
    const values = records[i]

    // Check column count consistency
    if (values.length !== headers.length) {
      errors.push({
        type: 'structure',
        message: `Row ${i + 1} has ${values.length} columns, expected ${headers.length}`,
        line: i + 1
      })
      continue
    }

    const key = values[0]

    // Check for empty keys
    if (!key || key.trim() === '') {
      errors.push({
        type: 'missing',
        message: `Empty key in row ${i + 1}`,
        line: i + 1
      })
      continue
    }

    // Check for duplicate keys
    if (seenKeys.has(key)) {
      errors.push({
        type: 'duplicate',
        message: `Duplicate key: ${key}`,
        line: i + 1,
        key
      })
    }
    seenKeys.add(key)

    // Check for empty values
    for (let j = 1; j < values.length; j++) {
      if (!values[j] || values[j].trim() === '') {
        warnings.push({
          type: 'empty_value',
          message: `Empty value for key "${key}" in column "${headers[j]}"`,
          key
        })
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function validateTranslationData(data: TranslationData): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  const keys = Object.keys(data)

  if (keys.length === 0) {
    warnings.push({
      type: 'empty_value',
      message: 'Translation data is empty'
    })
  }

  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string') {
      errors.push({
        type: 'structure',
        message: `Value for key "${key}" must be a string`,
        key
      })
    } else if (value.trim() === '') {
      warnings.push({
        type: 'empty_value',
        message: `Empty value for key: ${key}`,
        key
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function parseCSVRecords(content: string): string[][] {
  const records: string[][] = []
  const lines = content.split('\n')
  let currentRecord: string[] = []
  let currentField = ''
  let inQuotes = false
  let recordStarted = false

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"'
          i++ // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
        recordStarted = true
      } else if (char === ',' && !inQuotes) {
        // End of field
        currentRecord.push(currentField.trim())
        currentField = ''
        recordStarted = true
      } else {
        currentField += char
        recordStarted = true
      }
    }

    // If we're not in quotes, this line ends the current record
    if (!inQuotes && recordStarted) {
      // Add the last field of this record
      currentRecord.push(currentField.trim())

      // Only add non-empty records
      if (currentRecord.some(field => field.trim() !== '')) {
        records.push(currentRecord)
      }

      // Reset for next record
      currentRecord = []
      currentField = ''
      recordStarted = false
    } else if (inQuotes) {
      // Add newline to field if we're inside quotes (multi-line field)
      currentField += '\n'
    }
  }

  // Handle case where file doesn't end with newline
  if (recordStarted && !inQuotes) {
    currentRecord.push(currentField.trim())
    if (currentRecord.some(field => field.trim() !== '')) {
      records.push(currentRecord)
    }
  }

  return records
}



function findDuplicates<T>(array: T[]): T[] {
  const seen = new Set<T>()
  const duplicates = new Set<T>()

  for (const item of array) {
    if (seen.has(item)) {
      duplicates.add(item)
    }
    seen.add(item)
  }

  return Array.from(duplicates)
}
