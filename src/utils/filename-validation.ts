import { SUPPORTED_LANGUAGES, getFileNameFromLanguageCode } from '@/constants/languages'
import type { Language } from '@/types'

export interface FilenameValidationResult {
  isValid: boolean
  languageCode?: string
  language?: Language
  error?: string
  expectedFilenames?: string[]
  fallbackApplied?: boolean
  fallbackLanguageCode?: string
  fallbackLanguage?: Language
  warningMessage?: string
}

/**
 * Validates JSON filename against strict naming convention
 * Expected format: translations_{Language_Name}.json
 */
export function validateJSONFilename(filename: string): FilenameValidationResult {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.json$/i, '')

  // Check if it starts with 'translations_'
  if (!nameWithoutExt.startsWith('translations_')) {
    return {
      isValid: false,
      error: 'Filename must start with "translations_"',
      expectedFilenames: getExpectedFilenames()
    }
  }

  // Extract the language part
  const languagePart = nameWithoutExt.replace('translations_', '')

  // Find matching language by human-readable name
  const matchingLanguage = SUPPORTED_LANGUAGES.find(lang => {
    const expectedName = getFileNameFromLanguageCode(lang.code)
    return expectedName === languagePart
  })

  if (!matchingLanguage) {
    return {
      isValid: false,
      error: `Invalid language name "${languagePart}". Must be one of the supported language names.`,
      expectedFilenames: getExpectedFilenames()
    }
  }

  return {
    isValid: true,
    languageCode: matchingLanguage.code,
    language: matchingLanguage
  }
}

/**
 * Validates JSON filename with fallback to English for single file uploads
 * This provides a more user-friendly experience while encouraging proper naming
 */
export function validateJSONFilenameWithFallback(filename: string, allowFallback = true): FilenameValidationResult {
  // First try strict validation
  const strictResult = validateJSONFilename(filename)

  if (strictResult.isValid || !allowFallback) {
    return strictResult
  }

  // If strict validation fails and fallback is allowed, treat as English
  const englishLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === 'en')

  if (!englishLanguage) {
    return strictResult // Fallback to original error if English not found
  }

  // Generate warning message with examples
  const expectedFilenames = getExpectedFilenames()
  const warningMessage = `Filename "${filename}" doesn't follow the expected naming convention. ` +
    `File processed as English translations. For better organization, use: ${expectedFilenames.join(', ')}`

  return {
    isValid: true,
    languageCode: englishLanguage.code,
    language: englishLanguage,
    fallbackApplied: true,
    fallbackLanguageCode: englishLanguage.code,
    fallbackLanguage: englishLanguage,
    warningMessage
  }
}

/**
 * Get all expected filename patterns for supported languages
 */
export function getExpectedFilenames(): string[] {
  return SUPPORTED_LANGUAGES.map(lang => {
    const humanReadableName = getFileNameFromLanguageCode(lang.code)
    return `translations_${humanReadableName}.json`
  })
}

/**
 * Validate multiple JSON files for naming convention and uniqueness
 */
export function validateMultipleJSONFiles(files: File[]): {
  valid: File[]
  invalid: { file: File; error: string }[]
  duplicateLanguages: string[]
} {
  const valid: File[] = []
  const invalid: { file: File; error: string }[] = []
  const seenLanguages = new Set<string>()
  const duplicateLanguages: string[] = []

  for (const file of files) {
    // Only validate JSON files
    if (!file.name.toLowerCase().endsWith('.json')) {
      invalid.push({
        file,
        error: 'Only JSON files are allowed for multiple upload'
      })
      continue
    }

    const validation = validateJSONFilename(file.name)

    if (!validation.isValid) {
      invalid.push({
        file,
        error: validation.error || 'Invalid filename'
      })
      continue
    }

    // Check for duplicate languages
    if (validation.languageCode && seenLanguages.has(validation.languageCode)) {
      duplicateLanguages.push(validation.languageCode)
      invalid.push({
        file,
        error: `Duplicate language: ${validation.language?.name}. Only one file per language is allowed.`
      })
      continue
    }

    if (validation.languageCode) {
      seenLanguages.add(validation.languageCode)
    }
    valid.push(file)
  }

  return { valid, invalid, duplicateLanguages }
}

/**
 * Generate example filenames for user guidance
 */
export function getFilenameExamples(): { language: Language; filename: string }[] {
  return SUPPORTED_LANGUAGES.map(lang => ({
    language: lang,
    filename: `translations_${getFileNameFromLanguageCode(lang.code)}.json`
  }))
}

/**
 * Check if a filename follows the CSV naming convention (for validation)
 */
export function isCSVFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.csv')
}

/**
 * Validate that only one CSV file is uploaded when mixing with JSON files
 */
export function validateMixedFileUpload(files: File[]): {
  csvFiles: File[]
  jsonFiles: File[]
  errors: string[]
} {
  const csvFiles: File[] = []
  const jsonFiles: File[] = []
  const errors: string[] = []

  for (const file of files) {
    if (isCSVFile(file.name)) {
      csvFiles.push(file)
    } else if (file.name.toLowerCase().endsWith('.json')) {
      jsonFiles.push(file)
    } else {
      errors.push(`Unsupported file type: ${file.name}`)
    }
  }

  // Validate CSV file limit
  if (csvFiles.length > 1) {
    errors.push('Only one CSV file is allowed per upload')
  }

  // If both CSV and JSON files are present, that's not allowed
  if (csvFiles.length > 0 && jsonFiles.length > 0) {
    errors.push('Cannot upload CSV and JSON files together. Please upload them separately.')
  }

  return { csvFiles, jsonFiles, errors }
}
