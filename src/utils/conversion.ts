import type {
  TranslationData,
  CSVData,
  Language,
  MultiLanguageTranslationData,
  ConversionOptions
} from '@/types'
import { jsonToCSV, singleJSONToCSV, csvToJSON, csvToMultiLanguageJSON } from './csv'
import { saveAs } from 'file-saver'
import { getFileNameFromLanguageCode } from '@/constants/languages'

export class ConversionEngine {
  /**
   * Type guard to check if data is TranslationData
   */
  static isTranslationData(data: unknown): data is TranslationData {
    return typeof data === 'object' && data !== null && !Array.isArray(data) &&
           !('headers' in data) && !('rows' in data)
  }

  /**
   * Type guard to check if data is CSVData
   */
  static isCSVData(data: unknown): data is CSVData {
    return typeof data === 'object' && data !== null &&
           'headers' in data && 'rows' in data &&
           Array.isArray((data as CSVData).headers) && Array.isArray((data as CSVData).rows)
  }

  /**
   * Convert single JSON translation file to CSV format
   */
  static jsonToCSV(
    translationData: TranslationData,
    language: Language = { code: 'en', name: 'English', nativeName: 'English' }
  ): string {
    return singleJSONToCSV(translationData, language.name)
  }

  /**
   * Convert multiple JSON translation files to a single CSV with multiple language columns
   */
  static multipleJSONToCSV(
    translations: MultiLanguageTranslationData,
    languages: Language[]
  ): string {
    return jsonToCSV(translations, languages)
  }

  /**
   * Convert CSV to single JSON file for specified language
   */
  static csvToJSON(csvData: CSVData, targetLanguage?: string): TranslationData {
    return csvToJSON(csvData, targetLanguage)
  }

  /**
   * Convert CSV to multiple JSON files (one per language)
   */
  static csvToMultipleJSON(csvData: CSVData): Record<string, TranslationData> {
    return csvToMultiLanguageJSON(csvData)
  }

  /**
   * Download JSON file
   */
  static downloadJSON(
    data: TranslationData,
    filename = 'translations.json'
  ): void {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    saveAs(blob, filename)
  }

  /**
   * Download multiple JSON files as a ZIP (simplified - individual downloads)
   */
  static downloadMultipleJSON(
    translations: Record<string, TranslationData>,
    baseFilename = 'translations'
  ): void {
    Object.entries(translations).forEach(([languageCode, data]) => {
      const humanReadableName = getFileNameFromLanguageCode(languageCode)
      const filename = `${baseFilename}_${humanReadableName}.json`
      this.downloadJSON(data, filename)
    })
  }

  /**
   * Download CSV file
   */
  static downloadCSV(
    csvContent: string,
    filename = 'translations.csv'
  ): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, filename)
  }

  /**
   * Convert and download JSON to CSV
   */
  static convertAndDownloadJSONToCSV(
    translationData: TranslationData,
    language: Language,
    filename?: string
  ): void {
    const csvContent = this.jsonToCSV(translationData, language)
    const humanReadableName = getFileNameFromLanguageCode(language.code)
    const downloadFilename = filename || `translations_${humanReadableName}.csv`
    this.downloadCSV(csvContent, downloadFilename)
  }

  /**
   * Convert and download multiple JSON files to single CSV
   */
  static convertAndDownloadMultipleJSONToCSV(
    translations: MultiLanguageTranslationData,
    languages: Language[],
    filename?: string
  ): void {
    const csvContent = this.multipleJSONToCSV(translations, languages)
    const downloadFilename = filename || 'translations_multilang.csv'
    this.downloadCSV(csvContent, downloadFilename)
  }

  /**
   * Convert and download CSV to JSON
   */
  static convertAndDownloadCSVToJSON(
    csvData: CSVData,
    targetLanguage?: string,
    filename?: string
  ): void {
    const jsonData = this.csvToJSON(csvData, targetLanguage)
    const humanReadableName = targetLanguage ? getFileNameFromLanguageCode(targetLanguage) : 'converted'
    const downloadFilename = filename || `translations_${humanReadableName}.json`
    this.downloadJSON(jsonData, downloadFilename)
  }

  /**
   * Convert and download CSV to multiple JSON files
   */
  static convertAndDownloadCSVToMultipleJSON(
    csvData: CSVData,
    baseFilename?: string
  ): void {
    const translations = this.csvToMultipleJSON(csvData)
    const downloadBasename = baseFilename || 'translations'
    this.downloadMultipleJSON(translations, downloadBasename)
  }

  /**
   * Get preview of conversion result
   */
  static getConversionPreview(
    sourceData: TranslationData | CSVData,
    options: ConversionOptions,
    maxRows = 10
  ): string {
    try {
      if (options.sourceFormat === 'json' && options.targetFormat === 'csv') {
        if (!this.isTranslationData(sourceData)) return 'Invalid JSON data'
        const jsonData = sourceData
        const language = options.languages[0] || { code: 'en', name: 'English', nativeName: 'English' }
        const csvContent = this.jsonToCSV(jsonData, language)

        // Return first few lines for preview
        const lines = csvContent.split('\n')
        return lines.slice(0, maxRows + 1).join('\n') + (lines.length > maxRows + 1 ? '\n...' : '')
      }

      if (options.sourceFormat === 'csv' && options.targetFormat === 'json') {
        if (!this.isCSVData(sourceData)) return 'Invalid CSV data'
        const csvData = sourceData
        const targetLanguage = options.languages[0]?.name
        const jsonData = this.csvToJSON(csvData, targetLanguage)

        // Return formatted JSON with limited entries
        const entries = Object.entries(jsonData)
        const limitedEntries = entries.slice(0, maxRows)
        const limitedData = Object.fromEntries(limitedEntries)

        let preview = JSON.stringify(limitedData, null, 2)
        if (entries.length > maxRows) {
          preview = preview.slice(0, -2) + ',\n  "...": "..."\n}'
        }
        return preview
      }
    } catch (error) {
      return `Preview error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return 'Preview not available'
  }

  /**
   * Validate conversion options
   */
  static validateConversionOptions(options: ConversionOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!options.sourceFormat || !options.targetFormat) {
      errors.push('Source and target formats are required')
    }

    if (options.sourceFormat === options.targetFormat) {
      errors.push('Source and target formats cannot be the same')
    }

    if (!options.languages || options.languages.length === 0) {
      errors.push('At least one language must be specified')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Get supported conversion paths
   */
  static getSupportedConversions(): { from: string; to: string; description: string }[] {
    return [
      {
        from: 'json',
        to: 'csv',
        description: 'Convert JSON translation files to CSV format with language columns'
      },
      {
        from: 'csv',
        to: 'json',
        description: 'Convert CSV translation files to JSON format (single or multiple files)'
      }
    ]
  }

  /**
   * Estimate conversion result size
   */
  static estimateOutputSize(
    sourceData: TranslationData | CSVData,
    options: ConversionOptions
  ): { estimatedSize: number; unit: string } {
    try {
      let estimatedBytes = 0

      if (options.sourceFormat === 'json' && options.targetFormat === 'csv') {
        if (this.isTranslationData(sourceData)) {
          const entries = Object.entries(sourceData)
          const avgKeyLength = entries.reduce((sum, [key]) => sum + key.length, 0) / entries.length
          const avgValueLength = entries.reduce((sum, [, value]) => sum + value.length, 0) / entries.length

          // Estimate CSV size: headers + rows with quotes and commas
          const headerSize = options.languages.reduce((sum, lang) => sum + lang.name.length, 0) + 10
          const rowSize = (avgKeyLength + avgValueLength * options.languages.length + 10) * entries.length
          estimatedBytes = headerSize + rowSize
        }
      } else if (options.sourceFormat === 'csv' && options.targetFormat === 'json') {
        if (this.isCSVData(sourceData)) {
          const avgKeyLength = sourceData.rows.reduce((sum, row) => sum + (row.Key?.length || 0), 0) / sourceData.rows.length
          const avgValueLength = sourceData.rows.reduce((sum, row) => {
            const values = Object.values(row).filter(v => v !== row.Key)
            return sum + values.reduce((vSum, v) => vSum + (v?.length || 0), 0) / values.length
          }, 0) / sourceData.rows.length

          // Estimate JSON size with formatting
          estimatedBytes = (avgKeyLength + avgValueLength + 20) * sourceData.rows.length * options.languages.length
        }
      }

      if (estimatedBytes < 1024) {
        return { estimatedSize: estimatedBytes, unit: 'bytes' }
      } else if (estimatedBytes < 1024 * 1024) {
        return { estimatedSize: Math.round(estimatedBytes / 1024), unit: 'KB' }
      } else {
        return { estimatedSize: Math.round(estimatedBytes / (1024 * 1024)), unit: 'MB' }
      }
    } catch {
      return { estimatedSize: 0, unit: 'bytes' }
    }
  }
}
