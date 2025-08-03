<template>
  <TooltipProvider>
    <div class="min-h-screen bg-background text-foreground">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <h1 class="text-2xl font-bold text-foreground">Convert Translation</h1>
            </div>
            <div class="hidden md:flex items-center space-x-1 text-sm text-muted-foreground">
              <span>JSON ⇄ CSV</span>
              <span>•</span>
              <span>Multi-language</span>
              <span>•</span>
              <span>Search & Convert</span>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="space-y-8">
        <!-- Upload & Language Configuration Section -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- File Upload Column -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-xl font-semibold text-foreground">Upload Files</h2>
                  <SupportedLanguagesDialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      aria-label="View supported languages"
                      title="Supported languages"
                      data-supported-languages-trigger
                    >
                      <Info class="h-4 w-4" />
                    </Button>
                  </SupportedLanguagesDialog>
                </div>
                <p class="text-sm text-muted-foreground">
                  Upload JSON or CSV translation files to get started
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                @click="clearAllData"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </Button>
            </div>

            <FileUploader
              :multiple="true"
              @upload="handleFileUpload"
              @error="handleUploadError"
              @show-naming-help="handleShowNamingHelp"
            />

            <!-- Uploaded Files List -->
            <UploadedFilesList
              :files="uploadedFilesList"
              @remove-file="handleRemoveFile"
              @view-file="handleViewFile"
              @clear-all="handleClearAllFiles"
            />
          </div>

          <!-- Language Configuration Column -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-foreground">Language Configuration</h2>
                <p class="text-sm text-muted-foreground">
                  Configure languages for your translation project
                </p>
              </div>

              <LanguageSelectorSheet
                :selected-languages="selectedLanguages"
                :primary-language="primaryLanguage"
                @selection-change="handleLanguageSelection"
                @options-change="handleLanguageOptions"
              />
            </div>

            <Card v-if="selectedLanguages.length > 0">
              <div class="p-4">
                <LanguageSelector
                  :selected-languages="selectedLanguages"
                  :primary-language="primaryLanguage"
                  :options="languageOptions"
                />
              </div>
            </Card>

            <Card v-else class="border-dashed">
              <div class="p-6 text-center">
                <svg class="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <h3 class="text-sm font-medium text-foreground mb-1">No Languages Selected</h3>
                <p class="text-xs text-muted-foreground mb-3">
                  Click "Languages" above to configure your translation languages
                </p>
              </div>
            </Card>
          </div>
        </section>



        <!-- Data Visualization Section -->
        <section v-if="hasData" class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-foreground">Data View</h2>
              <p class="text-sm text-muted-foreground">
                View and edit your translation data
              </p>
            </div>

            <div class="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                @click="exportData('csv')"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </Button>

              <Button
                variant="outline"
                size="sm"
                @click="exportData('json')"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export JSON
              </Button>
            </div>
          </div>

          <DataViewer
            :csv-data="currentCSVData"
            :json-data="currentJSONData"
            :multi-language-json-data="currentMultiLanguageJSONData"
            :editable="true"
            @export="exportData"
            @edit-row="handleEditRowCSV"
            @delete-row="handleDeleteRowCSV"
            @edit-json="handleEditJSON"
            @view-change="handleViewChange"
          />
        </section>

        <!-- Empty State -->
        <section v-if="!hasData" class="text-center py-12">
          <div class="space-y-4">
            <svg class="w-16 h-16 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h3 class="text-lg font-medium text-foreground">No data loaded</h3>
              <p class="text-muted-foreground">Upload a JSON or CSV file to get started</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-border bg-card mt-16">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            <p>&copy; 2025 Convert Translation. Built with Vue 3 + TypeScript.</p>
          </div>
          <div class="flex items-center space-x-4">
            <span>{{ translationStats.totalLanguages }} languages</span>
            <span>•</span>
            <span>{{ translationStats.totalKeys }} keys</span>
            <span v-if="translationStats.missingTranslations > 0">
              • {{ translationStats.missingTranslations }} missing
            </span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Toast Notifications -->
    <Sonner />

    <!-- Replace Data Confirmation Dialog -->
    <ReplaceDataConfirmDialog
      v-model:open="isConfirmDialogOpen"
      @confirm="handleConfirmation"
      @cancel="handleCancellation"
    />

    <!-- Edit Translation Dialog -->
    <EditTranslationDialog
      v-model:open="isEditDialogOpen"
      :original-key="currentEditData?.key || ''"
      :original-value="currentEditData?.value || ''"
      :language="currentEditData?.language"
      @save="handleEditSave"
      @cancel="closeEditDialog"
    />

    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmationDialog
      v-model:open="isDeleteDialogOpen"
      :translation-key="currentDeleteData?.key || ''"
      :translation-value="currentDeleteData?.value || ''"
      :language="currentDeleteData?.language"
      @delete="handleDeleteConfirm"
      @cancel="closeDeleteDialog"
    />
    </div>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import 'vue-sonner/style.css'

import { Info } from 'lucide-vue-next'

import ThemeToggle from '@/components/ThemeToggle.vue'
import FileUploader from '@/components/FileUploader.vue'
import UploadedFilesList from '@/components/UploadedFilesList.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import LanguageSelectorSheet from '@/components/LanguageSelectorSheet.vue'
import SupportedLanguagesDialog from '@/components/SupportedLanguagesDialog.vue'

// Async component utilities for conditionally rendered components
import { createAsyncComponent, asyncComponentConfigs } from '@/utils/asyncComponents'

// Lazy load DataViewer since it's only rendered when hasData is true (v-if="hasData")
const DataViewer = createAsyncComponent(
  () => import('@/components/DataViewer.vue'),
  {
    ...asyncComponentConfigs.dataViewer,
    loadingComponent: () => import('@/components/skeleton/DataViewerSkeleton.vue')
  }
)

// Lazy load dialog components (these are only loaded when needed)
const ReplaceDataConfirmDialog = createAsyncComponent(
  () => import('@/components/ReplaceDataConfirmDialog.vue'),
  {
    ...asyncComponentConfigs.dialog,
    name: 'ReplaceDataConfirmDialog',
    loadingComponent: () => import('@/components/skeleton/DialogSkeleton.vue')
  }
)

const EditTranslationDialog = createAsyncComponent(
  () => import('@/components/EditTranslationDialog.vue'),
  {
    ...asyncComponentConfigs.dialog,
    name: 'EditTranslationDialog',
    loadingComponent: () => import('@/components/skeleton/DialogSkeleton.vue')
  }
)

const DeleteConfirmationDialog = createAsyncComponent(
  () => import('@/components/DeleteConfirmationDialog.vue'),
  {
    ...asyncComponentConfigs.dialog,
    name: 'DeleteConfirmationDialog',
    loadingComponent: () => import('@/components/skeleton/DialogSkeleton.vue')
  }
)
import { useMultiLanguage } from '@/composables/useMultiLanguage'
import { useFileUploadConfirmation } from '@/composables/useFileUploadConfirmation'
import { useFileManagement } from '@/composables/useFileManagement'
import { useEditDelete } from '@/composables/useEditDelete'
import { useConversion } from '@/composables/useConversion'
import { toast } from 'vue-sonner'
import type {
  FileUploadResult,
  CSVData,
  TranslationData,
  MultiLanguageTranslationData,
  LanguageSelection,
  CSVRow,
  ViewMode,
  LanguageOptions,
  UploadedFile,
  EditTranslationData,
  DeleteTranslationData
} from '@/types'

// Initialize composables
const {
  selectedLanguages,
  primaryLanguage,
  translationData,
  translationStats,
  updateLanguageSelection,
  loadFromCSV,
  loadFromJSON,
  exportToCSV,
  exportToMultipleJSON,
  clearAllData: clearMultiLanguageData
} = useMultiLanguage()

const {
  convertMultipleJSONToCSV
} = useConversion()

const {
  isConfirmDialogOpen,
  shouldConfirmUpload,
  handleConfirmation,
  handleCancellation
} = useFileUploadConfirmation()

const {
  uploadedFiles: uploadedFilesList,
  addFileWithReplaceInfo,
  addMultipleFiles,
  removeFile,
  clearAllFiles
} = useFileManagement()

const {
  isEditDialogOpen,
  isDeleteDialogOpen,
  currentEditData,
  currentDeleteData,
  openEditDialog,
  openDeleteDialog,
  closeEditDialog,
  closeDeleteDialog,
  editTranslationInData,
  editTranslationInCSV,
  editTranslationInMultiLanguage,
  deleteTranslationFromData,
  deleteTranslationFromCSV,
  deleteTranslationFromMultiLanguage,
  validateEditData
} = useEditDelete()

// Local state
const currentCSVData = ref<CSVData | undefined>()
const currentJSONData = ref<TranslationData | undefined>()
const currentMultiLanguageJSONData = ref<MultiLanguageTranslationData | undefined>()
const multipleJSONData = ref<Record<string, TranslationData>>({})
const currentView = ref<ViewMode>('table')
const languageOptions = ref({
  generateSeparateFiles: true,
  includeEmptyValues: true,
  addLanguagePrefix: true
})

// Computed properties
const hasData = computed(() => {
  return currentCSVData.value ||
         currentJSONData.value ||
         Object.keys(multipleJSONData.value).length > 0 ||
         Object.keys(translationData.value).length > 0
})

// Helper function to get language name from language code
function getLanguageName(code: string): string {
  const languageMap: Record<string, string> = {
    'en': 'English',
    'id': 'Indonesian',
    'zh-cn': 'Chinese_Simplified',
    'zh-tw': 'Chinese_Traditional'
  }
  return languageMap[code] || code
}

// Helper function to merge multiple JSON files into CSV structure
function mergeJSONFilesToCSV(uploads: { languageCode: string; data: TranslationData }[]): CSVData {
  // Get all unique translation keys from all files
  const allKeys = new Set<string>()
  for (const upload of uploads) {
    Object.keys(upload.data).forEach(key => allKeys.add(key))
  }

  // Create language map for easy lookup
  const languageData: Record<string, TranslationData> = {}
  for (const upload of uploads) {
    const languageName = getLanguageName(upload.languageCode)
    languageData[languageName] = upload.data
  }

  // Create headers: Key + language names
  const languageNames = Object.keys(languageData).sort()
  const headers = ['Key', ...languageNames]

  // Create rows
  const rows: CSVRow[] = Array.from(allKeys).sort().map(key => {
    const row: CSVRow = { Key: key }

    // Add translation for each language
    for (const languageName of languageNames) {
      row[languageName] = languageData[languageName][key] || ''
    }

    return row
  })

  return { headers, rows }
}

// Helper function to create merged JSON structure organized by language
function createMergedJSONStructure(uploads: { languageCode: string; data: TranslationData }[]): MultiLanguageTranslationData {
  const mergedData: MultiLanguageTranslationData = {}

  // Organize data by language
  for (const upload of uploads) {
    const languageName = getLanguageName(upload.languageCode)
    mergedData[languageName] = upload.data
  }

  return mergedData
}

// Event handlers
async function handleFileUpload(result: FileUploadResult | FileUploadResult[]) {
  // Check if user wants to proceed with upload (show confirmation if needed)
  const shouldProceed = await shouldConfirmUpload(
    result,
    currentCSVData.value,
    currentJSONData.value,
    translationData.value
  )

  if (!shouldProceed) {
    // User cancelled the upload
    return
  }

  // Handle array of results (multiple JSON files)
  if (Array.isArray(result)) {
    await handleMultipleJSONUpload(result)
    return
  }

  // Handle single result
  if (!result.success) {
    toast.error('Failed to upload file', {
      description: result.error || 'Unknown error occurred'
    })
    return
  }

  await processFileResult(result)

  // Track the uploaded file
  if (result.success) {
    // Estimate file size (we don't have actual file size here, so estimate)
    const estimatedSize = result.format === 'json'
      ? JSON.stringify(result.data).length
      : (result.data as CSVData).rows.length * 100 // rough estimate

    const { wasReplaced, replacedFile } = addFileWithReplaceInfo(result, estimatedSize)

    if (wasReplaced && replacedFile) {
      toast.info('File replaced', {
        description: `Replaced existing file "${replacedFile.name}" with new version`
      })
    }
  }
}

async function handleMultipleJSONUpload(results: FileUploadResult[]) {
  const successfulUploads: { languageCode: string; data: TranslationData }[] = []
  const errors: string[] = []

  // Process each file result
  for (const result of results) {
    if (result.success && result.format === 'json' && result.languageCode) {
      successfulUploads.push({
        languageCode: result.languageCode,
        data: result.data
      })
    } else {
      const errorMsg = result.success ? 'Invalid JSON file format' : result.error || 'Unknown error'
      errors.push(result.filename ? `${result.filename}: ${errorMsg}` : errorMsg)
    }
  }

  if (successfulUploads.length > 0) {
    // Clear previous data
    currentCSVData.value = undefined
    currentJSONData.value = undefined
    currentMultiLanguageJSONData.value = undefined
    multipleJSONData.value = {}

    // Convert multiple JSON files to CSV structure for table view
    const mergedCSVData = mergeJSONFilesToCSV(successfulUploads)

    // Create merged JSON structure for JSON view
    const mergedJSONData = createMergedJSONStructure(successfulUploads)

    // Store both representations for DataViewer
    currentCSVData.value = mergedCSVData
    currentMultiLanguageJSONData.value = mergedJSONData
    // Clear single JSON data since we have multi-language data
    currentJSONData.value = undefined

    // Also store in multipleJSONData for reference
    const newMultipleData: Record<string, TranslationData> = {}
    for (const upload of successfulUploads) {
      newMultipleData[upload.languageCode] = upload.data
      // Load into multi-language system
      loadFromJSON(upload.data, upload.languageCode)
    }
    multipleJSONData.value = newMultipleData

    // Load the merged CSV into the multi-language system
    loadFromCSV(mergedCSVData)

    // Track uploaded files
    const fileSizes = results.map(result =>
      result.success ? JSON.stringify(result.data).length : 0
    )
    addMultipleFiles(results, fileSizes)

    toast.success('Multiple JSON files uploaded successfully', {
      description: `Loaded ${successfulUploads.length} language files with ${mergedCSVData.headers.length - 1} languages`
    })
  }

  if (errors.length > 0) {
    toast.error('Some files failed to upload', {
      description: errors.join(', ')
    })
  }
}

async function processFileResult(result: FileUploadResult) {
  try {
    if (!result.success) {
      throw new Error(result.error)
    }

    if (result.format === 'csv') {
      const csvData = result.data

      // Validate CSV data structure
      if (!csvData || !csvData.headers || !csvData.rows) {
        throw new Error('Invalid CSV data structure')
      }

      if (csvData.headers.length === 0) {
        throw new Error('CSV file has no headers')
      }

      if (csvData.rows.length === 0) {
        throw new Error('CSV file has no data rows')
      }

      // Clear previous data and set new CSV data
      currentJSONData.value = undefined
      currentMultiLanguageJSONData.value = undefined
      currentCSVData.value = csvData

      // Load into multi-language system
      loadFromCSV(csvData)

      toast.success('CSV file uploaded successfully', {
        description: `Loaded ${csvData.rows.length} translation entries with ${csvData.headers.length} columns`
      })

    } else if (result.format === 'json') {
      const jsonData = result.data

      // Validate JSON data structure
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('Invalid JSON data structure')
      }

      const keys = Object.keys(jsonData)
      if (keys.length === 0) {
        throw new Error('JSON file contains no translation keys')
      }

      // Clear previous data and set new JSON data
      currentCSVData.value = undefined
      currentMultiLanguageJSONData.value = undefined
      currentJSONData.value = jsonData

      // Determine language code (use fallback if applied, otherwise use primary language)
      const languageCode = result.languageCode || primaryLanguage.value?.code || 'en'

      // Load into multi-language system
      loadFromJSON(jsonData, languageCode)

      // Show success message
      const successMessage = result.fallbackApplied
        ? `Loaded ${keys.length} translation keys (processed as English)`
        : `Loaded ${keys.length} translation keys`

      toast.success('JSON file uploaded successfully', {
        description: successMessage
      })

      // Show warning if fallback was applied
      if (result.fallbackApplied && result.warningMessage) {
        toast.warning('Filename Convention Notice', {
          description: result.warningMessage,
          duration: 8000 // Show warning longer
        })
      }
    } else {
      throw new Error('Unsupported file format')
    }
  } catch (error) {
    console.error('Error processing uploaded file:', error)
    toast.error('Error processing file', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}

function handleUploadError(error: string) {
  console.error('Upload error:', error)
  toast.error('Upload failed', {
    description: error
  })
}

function handleShowNamingHelp() {
  // This will trigger the SupportedLanguagesDialog to open
  // We can use a ref to control the dialog state or trigger the button click
  const dialogTrigger = document.querySelector('[data-supported-languages-trigger]') as HTMLElement
  if (dialogTrigger) {
    dialogTrigger.click()
  }
}

function handleLanguageSelection(selection: LanguageSelection) {
  updateLanguageSelection(selection)
}

function handleLanguageOptions(options: LanguageOptions) {
  // Update language options
  languageOptions.value = { ...options }
}

async function exportData(format: 'csv' | 'json') {
  try {
    if (format === 'csv') {
      if (Object.keys(translationData.value).length > 0) {
        await convertMultipleJSONToCSV(
          translationData.value,
          selectedLanguages.value,
          'translations.csv'
        )
        toast.success('CSV exported successfully', {
          description: `Exported ${selectedLanguages.value.length} languages to CSV`
        })
      } else {
        exportToCSV('translations.csv')
        toast.success('CSV exported successfully')
      }
    } else {
      if (selectedLanguages.value.length > 1) {
        exportToMultipleJSON('translations')
        toast.success('JSON files exported successfully', {
          description: `Exported ${selectedLanguages.value.length} separate JSON files`
        })
      } else if (currentJSONData.value) {
        const blob = new Blob([JSON.stringify(currentJSONData.value, null, 2)], {
          type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'translations.json'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('JSON exported successfully')
      }
    }
  } catch (error) {
    console.error('Export error:', error)
    toast.error('Export failed', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}

function handleEditRowCSV(row: CSVRow, _index: number) {
  // Handle CSV row editing - extract key and value from row
  const key = row.Key || ''
  const firstValueColumn = Object.keys(row).find(k => k !== 'Key')
  const value = firstValueColumn ? row[firstValueColumn] || '' : ''
  const language = firstValueColumn

  openEditDialog(key, value, language)
}

function handleDeleteRowCSV(row: CSVRow, _index: number) {
  // Handle CSV row deletion - extract key and value from row
  const key = row.Key || ''
  const firstValueColumn = Object.keys(row).find(k => k !== 'Key')
  const value = firstValueColumn ? row[firstValueColumn] || '' : ''
  const language = firstValueColumn

  openDeleteDialog(key, value, language)
}

function handleEditJSON(key: string, value: string) {
  // Handle JSON editing
  openEditDialog(key, value)
}

function handleViewChange(view: ViewMode) {
  currentView.value = view
}

function clearAllData() {
  currentCSVData.value = undefined
  currentJSONData.value = undefined
  currentMultiLanguageJSONData.value = undefined
  multipleJSONData.value = {}
  clearMultiLanguageData()
  clearAllFiles()
}

// File management handlers
function handleRemoveFile(fileId: string) {
  const result = removeFile(fileId)
  if (result.success) {
    // Check if we need to update current data
    const remainingFiles = uploadedFilesList.value

    if (remainingFiles.length === 0) {
      // No files left, clear all data
      clearAllData()
      toast.success('File removed', {
        description: 'All data cleared as no files remain'
      })
    } else {
      // Rebuild data from remaining files
      rebuildDataFromFiles()
      toast.success('File removed successfully')
    }
  } else {
    toast.error('Failed to remove file', {
      description: result.error
    })
  }
}

function handleViewFile(file: UploadedFile) {
  // For now, just show file info in a toast
  // This could be enhanced with a detailed view modal
  toast.info(`File: ${file.name}`, {
    description: `Format: ${file.format.toUpperCase()}, Language: ${file.languageCode || 'N/A'}, Size: ${(file.size / 1024).toFixed(1)}KB`
  })
}

function handleClearAllFiles() {
  clearAllFiles()
  clearAllData()
  toast.success('All files cleared')
}

function rebuildDataFromFiles() {
  // This function rebuilds the current data from remaining uploaded files
  const files = uploadedFilesList.value

  if (files.length === 0) {
    clearAllData()
    return
  }

  // Find the most recent file to use as primary data
  const sortedFiles = [...files].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
  const primaryFile = sortedFiles[0]

  if (primaryFile.format === 'csv') {
    currentCSVData.value = primaryFile.data as CSVData
    currentJSONData.value = undefined
    currentMultiLanguageJSONData.value = undefined
  } else if (primaryFile.format === 'json') {
    const jsonFiles = files.filter(f => f.format === 'json')

    if (jsonFiles.length === 1) {
      // Single JSON file
      currentJSONData.value = primaryFile.data as TranslationData
      currentCSVData.value = undefined
      currentMultiLanguageJSONData.value = undefined
    } else {
      // Multiple JSON files - rebuild multi-language structure
      const multiLangData: Record<string, TranslationData> = {}
      jsonFiles.forEach(file => {
        if (file.languageCode) {
          multiLangData[file.languageCode] = file.data as TranslationData
        }
      })

      currentMultiLanguageJSONData.value = multiLangData
      currentJSONData.value = undefined
      currentCSVData.value = undefined
    }
  }
}

// Edit and Delete handlers
function handleEditSave(editData: EditTranslationData) {
  const validationError = validateEditData(editData)
  if (validationError) {
    toast.error('Validation Error', {
      description: validationError
    })
    return
  }

  let result

  // Apply edit to the appropriate data source
  if (currentJSONData.value) {
    result = editTranslationInData(currentJSONData.value, editData)
  } else if (currentCSVData.value) {
    result = editTranslationInCSV(currentCSVData.value, editData)
  } else if (currentMultiLanguageJSONData.value) {
    result = editTranslationInMultiLanguage(currentMultiLanguageJSONData.value, editData)
  } else {
    toast.error('No data to edit')
    return
  }

  if (result.success) {
    closeEditDialog()
    toast.success('Translation updated successfully', {
      description: `Updated "${editData.originalKey}" to "${editData.newKey}"`
    })
  } else {
    toast.error('Failed to update translation', {
      description: result.error
    })
  }
}

function handleDeleteConfirm(deleteData: DeleteTranslationData) {
  let result

  // Apply delete to the appropriate data source
  if (currentJSONData.value) {
    result = deleteTranslationFromData(currentJSONData.value, deleteData)
  } else if (currentCSVData.value) {
    result = deleteTranslationFromCSV(currentCSVData.value, deleteData)
  } else if (currentMultiLanguageJSONData.value) {
    result = deleteTranslationFromMultiLanguage(currentMultiLanguageJSONData.value, deleteData)
  } else {
    toast.error('No data to delete from')
    return
  }

  if (result.success) {
    closeDeleteDialog()
    toast.success('Translation deleted successfully', {
      description: `Deleted "${deleteData.key}"`
    })
  } else {
    toast.error('Failed to delete translation', {
      description: result.error
    })
  }
}
</script>
