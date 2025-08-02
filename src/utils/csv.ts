import Papa from 'papaparse'
import type { CSVData, CSVRow, TranslationData, Language } from '@/types'
import { mapLanguageNameToCode } from '@/constants/languages'

export function parseCSV(content: string): CSVData {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim()
  })

  if (result.errors.length > 0) {
    throw new Error(`CSV parsing error: ${result.errors[0].message}`)
  }

  const headers = result.meta.fields || []
  const rows = result.data as CSVRow[]

  return {
    headers,
    rows
  }
}

export function csvToJSON(csvData: CSVData, targetLanguage?: string): TranslationData {
  const result: TranslationData = {}

  // If no target language specified, use the first non-Key column
  const languageColumn = targetLanguage || csvData.headers.find(h => h.toLowerCase() !== 'key')

  if (!languageColumn) {
    throw new Error('No language column found in CSV')
  }

  // Find the key column (case-insensitive)
  const keyColumn = csvData.headers.find(header =>
    header.toLowerCase() === 'key'
  ) || 'Key'

  for (const row of csvData.rows) {
    const key = row[keyColumn]?.trim()
    const value = row[languageColumn]?.trim()

    if (key && value) {
      result[key] = value
    }
  }

  return result
}

export function csvToMultiLanguageJSON(csvData: CSVData): Record<string, TranslationData> {
  const result: Record<string, TranslationData> = {}

  // Get all language columns (exclude key column, case-insensitive)
  const languageColumns = csvData.headers.filter(h => h.toLowerCase() !== 'key')

  for (const languageColumnName of languageColumns) {
    // Map the CSV column name to a proper language code
    const languageCode = mapLanguageNameToCode(languageColumnName)
    result[languageCode] = csvToJSON(csvData, languageColumnName)
  }

  return result
}

export function jsonToCSV(
  translations: Record<string, TranslationData>,
  languages: Language[]
): string {
  const headers = ['Key', ...languages.map(lang => lang.name)]
  const rows: string[][] = []

  // Get all unique keys from all languages
  const allKeys = new Set<string>()
  for (const langData of Object.values(translations)) {
    Object.keys(langData).forEach(key => allKeys.add(key))
  }

  // Create rows
  for (const key of Array.from(allKeys).sort()) {
    const row = [key]

    for (const language of languages) {
      const langCode = language.code
      const value = translations[langCode]?.[key] || ''
      row.push(value)
    }

    rows.push(row)
  }

  // Convert to CSV format
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return csvContent
}

export function singleJSONToCSV(
  translationData: TranslationData,
  languageName: string = 'English'
): string {
  const headers = ['Key', languageName]
  const rows: string[][] = []

  for (const [key, value] of Object.entries(translationData)) {
    rows.push([key, value])
  }

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return csvContent
}

export function validateCSVStructure(csvData: CSVData): boolean {
  // Check if we have at least 2 columns (Key + at least one language)
  if (csvData.headers.length < 2) {
    return false
  }

  // Check if first column is 'Key'
  if (csvData.headers[0].toLowerCase() !== 'key') {
    return false
  }

  // Check if all rows have the same number of columns
  const expectedColumns = csvData.headers.length
  return csvData.rows.every(row => Object.keys(row).length === expectedColumns)
}

export function getLanguagesFromCSV(csvData: CSVData): string[] {
  return csvData.headers.filter(header => header.toLowerCase() !== 'key')
}

export function addLanguageToCSV(
  csvData: CSVData,
  newLanguage: string,
  translations: TranslationData
): CSVData {
  const newHeaders = [...csvData.headers, newLanguage]
  const newRows = csvData.rows.map(row => ({
    ...row,
    [newLanguage]: translations[row.Key] || ''
  }))

  return {
    headers: newHeaders,
    rows: newRows
  }
}

export function removeLanguageFromCSV(csvData: CSVData, language: string): CSVData {
  const newHeaders = csvData.headers.filter(h => h !== language)
  const newRows = csvData.rows.map(row => {
    const newRow = { ...row }
    delete newRow[language]
    return newRow
  })

  return {
    headers: newHeaders,
    rows: newRows
  }
}

export function mergeCSVData(csvData1: CSVData, csvData2: CSVData): CSVData {
  // Combine headers (remove duplicates)
  const allHeaders = Array.from(new Set([...csvData1.headers, ...csvData2.headers]))

  // Create a map of existing keys from first CSV
  const keyMap = new Map<string, CSVRow>()
  csvData1.rows.forEach(row => {
    if (row.Key) {
      keyMap.set(row.Key, { ...row })
    }
  })

  // Merge data from second CSV
  csvData2.rows.forEach(row => {
    if (row.Key) {
      if (keyMap.has(row.Key)) {
        // Merge with existing row
        const existingRow = keyMap.get(row.Key)!
        Object.assign(existingRow, row)
      } else {
        // Add new row
        keyMap.set(row.Key, { ...row })
      }
    }
  })

  // Convert back to array and ensure all columns exist
  const mergedRows = Array.from(keyMap.values()).map(row => {
    const completeRow: CSVRow = { Key: row.Key }
    allHeaders.forEach(header => {
      completeRow[header] = row[header] || ''
    })
    return completeRow
  })

  return {
    headers: allHeaders,
    rows: mergedRows
  }
}
