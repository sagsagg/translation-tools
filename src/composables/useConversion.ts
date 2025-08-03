import { ref, computed, reactive } from 'vue'
import type {
  TranslationData,
  CSVData,
  Language,
  MultiLanguageTranslationData,
  ConversionOptions,
  FileFormat
} from '@/types'
import { ConversionEngine } from '@/utils/conversion'

export function useConversion() {
  const isConverting = ref(false)
  const conversionProgress = ref(0)
  const lastConversionResult = ref<string | null>(null)
  const conversionError = ref<string | null>(null)

  const conversionOptions = reactive<ConversionOptions>({
    sourceFormat: 'json',
    targetFormat: 'csv',
    languages: [],
    includeEmptyValues: true
  })

  const supportedConversions = computed(() => ConversionEngine.getSupportedConversions())

  async function convertJSONToCSV(
    translationData: TranslationData,
    language: Language,
    filename?: string
  ): Promise<string> {
    isConverting.value = true
    conversionProgress.value = 0
    conversionError.value = null

    try {
      conversionProgress.value = 25

      const csvContent = ConversionEngine.jsonToCSV(translationData, language)

      conversionProgress.value = 75

      if (filename) {
        ConversionEngine.downloadCSV(csvContent, filename)
      }

      conversionProgress.value = 100
      lastConversionResult.value = csvContent

      return csvContent
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Conversion failed'
      conversionError.value = errorMsg
      throw new Error(errorMsg)
    } finally {
      isConverting.value = false
      setTimeout(() => {
        conversionProgress.value = 0
      }, 1000)
    }
  }

  async function convertMultipleJSONToCSV(
    translations: MultiLanguageTranslationData,
    languages: Language[],
    filename?: string
  ): Promise<string> {
    isConverting.value = true
    conversionProgress.value = 0
    conversionError.value = null

    try {
      conversionProgress.value = 25

      const csvContent = ConversionEngine.multipleJSONToCSV(translations, languages)

      conversionProgress.value = 75

      if (filename) {
        ConversionEngine.downloadCSV(csvContent, filename)
      }

      conversionProgress.value = 100
      lastConversionResult.value = csvContent

      return csvContent
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Conversion failed'
      conversionError.value = errorMsg
      throw new Error(errorMsg)
    } finally {
      isConverting.value = false
      setTimeout(() => {
        conversionProgress.value = 0
      }, 1000)
    }
  }

  async function convertCSVToJSON(
    csvData: CSVData,
    targetLanguage?: string,
    filename?: string
  ): Promise<TranslationData> {
    isConverting.value = true
    conversionProgress.value = 0
    conversionError.value = null

    try {
      conversionProgress.value = 25

      const jsonData = ConversionEngine.csvToJSON(csvData, targetLanguage)

      conversionProgress.value = 75

      if (filename) {
        ConversionEngine.downloadJSON(jsonData, filename)
      }

      conversionProgress.value = 100
      lastConversionResult.value = JSON.stringify(jsonData, null, 2)

      return jsonData
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Conversion failed'
      conversionError.value = errorMsg
      throw new Error(errorMsg)
    } finally {
      isConverting.value = false
      setTimeout(() => {
        conversionProgress.value = 0
      }, 1000)
    }
  }

  async function convertCSVToMultipleJSON(
    csvData: CSVData,
    baseFilename?: string
  ): Promise<Record<string, TranslationData>> {
    isConverting.value = true
    conversionProgress.value = 0
    conversionError.value = null

    try {
      conversionProgress.value = 25

      const translations = ConversionEngine.csvToMultipleJSON(csvData)

      conversionProgress.value = 75

      if (baseFilename) {
        ConversionEngine.downloadMultipleJSON(translations, baseFilename)
      }

      conversionProgress.value = 100
      lastConversionResult.value = JSON.stringify(translations, null, 2)

      return translations
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Conversion failed'
      conversionError.value = errorMsg
      throw new Error(errorMsg)
    } finally {
      isConverting.value = false
      setTimeout(() => {
        conversionProgress.value = 0
      }, 1000)
    }
  }

  function getConversionPreview(
    sourceData: TranslationData | CSVData,
    maxRows = 10
  ): string {
    try {
      return ConversionEngine.getConversionPreview(sourceData, conversionOptions, maxRows)
    } catch (error) {
      return `Preview error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  function validateConversionOptions(): { valid: boolean; errors: string[] } {
    return ConversionEngine.validateConversionOptions(conversionOptions)
  }

  function estimateOutputSize(sourceData: TranslationData | CSVData): { estimatedSize: number; unit: string } {
    return ConversionEngine.estimateOutputSize(sourceData, conversionOptions)
  }

  function updateConversionOptions(updates: Partial<ConversionOptions>) {
    Object.assign(conversionOptions, updates)
  }

  function resetConversionState() {
    isConverting.value = false
    conversionProgress.value = 0
    lastConversionResult.value = null
    conversionError.value = null
  }

  function downloadLastResult(filename: string, format: FileFormat) {
    if (!lastConversionResult.value) {
      throw new Error('No conversion result to download')
    }

    if (format === 'csv') {
      ConversionEngine.downloadCSV(lastConversionResult.value, filename)
    } else {
      try {
        const jsonData = JSON.parse(lastConversionResult.value)
        ConversionEngine.downloadJSON(jsonData, filename)
      } catch (error) {
        throw new Error(`Invalid JSON result for download: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  return {
    // State
    isConverting: computed(() => isConverting.value),
    conversionProgress: computed(() => conversionProgress.value),
    lastConversionResult: computed(() => lastConversionResult.value),
    conversionError: computed(() => conversionError.value),
    conversionOptions: computed(() => conversionOptions),
    supportedConversions,

    // Methods
    convertJSONToCSV,
    convertMultipleJSONToCSV,
    convertCSVToJSON,
    convertCSVToMultipleJSON,
    getConversionPreview,
    validateConversionOptions,
    estimateOutputSize,
    updateConversionOptions,
    resetConversionState,
    downloadLastResult
  }
}
