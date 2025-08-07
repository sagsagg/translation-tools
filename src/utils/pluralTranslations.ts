/**
 * Utility functions for handling plural translations
 * Plural translations are identified by a pipe separator (|) in the translation value
 * Format: "singular form | plural form"
 */

import type { CSVData, CSVRow } from '@/types'

export interface PluralTranslation {
  singular: string
  plural: string
  original: string
}

export type PluralFilterMode = 'all' | 'plural-only' | 'singular-only'

/**
 * Detects if a translation value contains plural forms (pipe separator)
 */
export function isPluralTranslation(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  // Check if the value contains exactly one pipe separator
  const parts = value.split('|')
  if (parts.length !== 2) {
    return false
  }

  // Both parts must have non-empty content after trimming
  const firstPart = parts[0].trim()
  const secondPart = parts[1].trim()

  return firstPart.length > 0 && secondPart.length > 0
}

/**
 * Parses a plural translation value into singular and plural forms
 */
export function parsePluralTranslation(value: string): PluralTranslation | null {
  if (!isPluralTranslation(value)) {
    return null
  }

  const parts = value.split('|')
  if (parts.length !== 2) {
    return null
  }

  return {
    singular: parts[0].trim(),
    plural: parts[1].trim(),
    original: value
  }
}

/**
 * Creates a plural translation value from singular and plural forms
 */
export function createPluralTranslation(singular: string, plural: string): string {
  return `${singular.trim()} | ${plural.trim()}`
}

/**
 * Extracts the singular form from a translation value
 * Returns the original value if it's not a plural translation
 */
export function getSingularForm(value: string): string {
  const parsed = parsePluralTranslation(value)
  return parsed ? parsed.singular : value
}

/**
 * Extracts the plural form from a translation value
 * Returns the original value if it's not a plural translation
 */
export function getPluralForm(value: string): string {
  const parsed = parsePluralTranslation(value)
  return parsed ? parsed.plural : value
}

/**
 * Checks if a translation key has plural translations in any language
 */
export function hasAnyPluralTranslation(translations: Record<string, string>): boolean {
  return Object.values(translations).some(value => isPluralTranslation(value))
}

/**
 * Gets statistics about plural translations in a dataset
 */
export function getPluralTranslationStats(data: Record<string, Record<string, string>>) {
  let totalKeys = 0
  let pluralKeys = 0
  let totalTranslations = 0
  let pluralTranslations = 0

  Object.entries(data).forEach(([key, translations]) => {
    totalKeys++
    let hasPlural = false

    Object.values(translations).forEach(value => {
      totalTranslations++
      if (isPluralTranslation(value)) {
        pluralTranslations++
        hasPlural = true
      }
    })

    if (hasPlural) {
      pluralKeys++
    }
  })

  return {
    totalKeys,
    pluralKeys,
    singularKeys: totalKeys - pluralKeys,
    totalTranslations,
    pluralTranslations,
    singularTranslations: totalTranslations - pluralTranslations,
    pluralKeyPercentage: totalKeys > 0 ? (pluralKeys / totalKeys) * 100 : 0,
    pluralTranslationPercentage: totalTranslations > 0 ? (pluralTranslations / totalTranslations) * 100 : 0
  }
}

/**
 * Filters CSV data based on plural translation mode
 */
export function filterCSVByPluralMode(
  csvData: CSVData,
  mode: PluralFilterMode
): CSVData {
  if (mode === 'all') {
    return csvData
  }

  const filteredRows = csvData.rows.filter(row => {
    // Get all translation values (excluding the Key column)
    const translationValues = csvData.headers
      .filter(header => header.toLowerCase() !== 'key')
      .map(header => row[header] || '')

    const hasPlural = translationValues.some(value => isPluralTranslation(value))

    if (mode === 'plural-only') {
      return hasPlural
    } else if (mode === 'singular-only') {
      return !hasPlural
    }

    return true
  })

  return {
    headers: csvData.headers,
    rows: filteredRows
  }
}

/**
 * Filters JSON data based on plural translation mode
 */
export function filterJSONByPluralMode(
  jsonData: Record<string, string>,
  mode: PluralFilterMode
): Record<string, string> {
  if (mode === 'all') {
    return jsonData
  }

  const filteredData: Record<string, string> = {}

  Object.entries(jsonData).forEach(([key, value]) => {
    const hasPlural = isPluralTranslation(value)

    if (mode === 'plural-only' && hasPlural) {
      filteredData[key] = value
    } else if (mode === 'singular-only' && !hasPlural) {
      filteredData[key] = value
    }
  })

  return filteredData
}

/**
 * Filters multi-language JSON data based on plural translation mode
 */
export function filterMultiLanguageJSONByPluralMode(
  multiLanguageData: Record<string, Record<string, string>>,
  mode: PluralFilterMode
): Record<string, Record<string, string>> {
  if (mode === 'all') {
    return multiLanguageData
  }

  const filteredData: Record<string, Record<string, string>> = {}

  // Initialize language objects
  Object.keys(multiLanguageData).forEach(languageCode => {
    filteredData[languageCode] = {}
  })

  // Get all unique keys
  const allKeys = new Set<string>()
  Object.values(multiLanguageData).forEach(languageData => {
    Object.keys(languageData).forEach(key => allKeys.add(key))
  })

  // Filter keys based on plural mode
  allKeys.forEach(key => {
    const translations: Record<string, string> = {}
    Object.entries(multiLanguageData).forEach(([languageCode, languageData]) => {
      if (key in languageData) {
        translations[languageCode] = languageData[key]
      }
    })

    const hasPlural = hasAnyPluralTranslation(translations)

    if (mode === 'plural-only' && hasPlural) {
      Object.entries(translations).forEach(([languageCode, value]) => {
        filteredData[languageCode][key] = value
      })
    } else if (mode === 'singular-only' && !hasPlural) {
      Object.entries(translations).forEach(([languageCode, value]) => {
        filteredData[languageCode][key] = value
      })
    }
  })

  return filteredData
}

/**
 * Validates that a plural translation has both singular and plural forms
 */
export function validatePluralTranslation(value: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!value || typeof value !== 'string') {
    errors.push('Translation value is required')
    return { isValid: false, errors }
  }

  if (!isPluralTranslation(value)) {
    // Not a plural translation, which is valid
    return { isValid: true, errors: [] }
  }

  const parsed = parsePluralTranslation(value)
  if (!parsed) {
    errors.push('Invalid plural translation format')
    return { isValid: false, errors }
  }

  if (!parsed.singular.trim()) {
    errors.push('Singular form cannot be empty')
  }

  if (!parsed.plural.trim()) {
    errors.push('Plural form cannot be empty')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Formats a plural translation for display purposes
 */
export function formatPluralTranslationForDisplay(value: string): string {
  const parsed = parsePluralTranslation(value)
  if (!parsed) {
    return value
  }

  return `${parsed.singular} | ${parsed.plural}`
}

/**
 * Searches for plural translations containing a specific query
 */
export function searchPluralTranslations(
  data: Record<string, Record<string, string>>,
  query: string,
  searchInSingular = true,
  searchInPlural = true
): { key: string, language: string, value: string, matchType: 'singular' | 'plural' | 'both' }[] {
  const results: { key: string, language: string, value: string, matchType: 'singular' | 'plural' | 'both' }[] = []
  const lowerQuery = query.toLowerCase()

  Object.entries(data).forEach(([key, translations]) => {
    Object.entries(translations).forEach(([language, value]) => {
      if (isPluralTranslation(value)) {
        const parsed = parsePluralTranslation(value)
        if (parsed) {
          const singularMatch = searchInSingular && parsed.singular.toLowerCase().includes(lowerQuery)
          const pluralMatch = searchInPlural && parsed.plural.toLowerCase().includes(lowerQuery)

          if (singularMatch || pluralMatch) {
            let matchType: 'singular' | 'plural' | 'both'
            if (singularMatch && pluralMatch) {
              matchType = 'both'
            } else if (singularMatch) {
              matchType = 'singular'
            } else {
              matchType = 'plural'
            }

            results.push({
              key,
              language,
              value,
              matchType
            })
          }
        }
      }
    })
  })

  return results
}
