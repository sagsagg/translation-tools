<template>
  <div class="w-full space-y-4">
    <!-- View Controls -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- View Toggle -->
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium">View:</label>
          <ToggleGroup
            type="single"
            :model-value="currentView"
            @update:model-value="handleViewChange"
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="table" aria-label="Table view">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9m-9 4h9" />
              </svg>
              Table
            </ToggleGroupItem>

            <ToggleGroupItem value="json" aria-label="JSON view">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              JSON
            </ToggleGroupItem>

            <ToggleGroupItem
              v-if="supportsSplitView"
              value="split"
              aria-label="Split view"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Split
            </ToggleGroupItem>

            <ToggleGroupItem
              v-if="(jsonData && !csvData) || multiLanguageJsonData"
              value="csv-table"
              aria-label="CSV table view"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9m-9 4h9" />
              </svg>
              CSV Table
            </ToggleGroupItem>

            <ToggleGroupItem
              v-if="(jsonData && !csvData) || multiLanguageJsonData"
              value="dual"
              aria-label="Dual view"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Dual View
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <!-- Language Filter (for multi-language data) -->
        <div v-if="availableLanguages.length > 1">
          <LanguageMultiSelect
            :available-languages="availableLanguages"
            v-model:selected-languages="selectedLanguages"
            @selection-change="handleLanguageSelectionChange"
          />
        </div>
      </div>
    </div>

    <!-- Data Display -->
    <div>
      <!-- Table View -->
      <div v-if="currentView === 'table'" class="w-full">
        <DataTable
          v-if="displayData.csv"
          :data="displayData.csv"
          :search-query="searchQueryFromComposable"
          :show-actions="editable"
          :allow-language-management="true"
          :current-languages="tableLanguages"
          @edit-row="handleEditRow"
          @delete-row="handleDeleteRow"
          @add-language="handleAddLanguage"
          @remove-language="handleRemoveLanguage"
          @sort="(column, direction) => emit('sort', column, direction)"
        >
          <template #advanced-search>
            <AdvancedSearchSheet
              v-model:selected-language="selectedSearchLanguage"
              v-model:search-mode="searchMode"
              v-model:search-threshold="searchThreshold"
              v-model:max-results="maxResults"
              :search-results="searchResults"
              :is-searching="isSearching"
              :search-stats="searchStats"
              :available-languages="availableLanguages"
              :suggestions="searchSuggestions"
              :has-query="hasQuery"
              :has-results="hasResults"
              @search="handleSearch"
              @clear="handleClearSearch"
              @export="handleExportSearch"
              @apply-suggestion="handleApplySuggestion"
            />
          </template>
        </DataTable>
      </div>

      <!-- JSON View -->
      <div v-else-if="currentView === 'json'" class="w-full space-y-4">
        <!-- Search Controls for JSON View -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium">Search:</label>
            <div class="flex items-center">
              <Input
                v-model="searchQueryFromComposable"
                type="text"
                placeholder="Search in JSON..."
                class="w-64"
              />
              <AdvancedSearchSheet
                v-model:selected-language="selectedSearchLanguage"
                v-model:search-mode="searchMode"
                v-model:search-threshold="searchThreshold"
                v-model:max-results="maxResults"
                :search-results="searchResults"
                :is-searching="isSearching"
                :search-stats="searchStats"
                :available-languages="availableLanguages"
                :suggestions="searchSuggestions"
                :has-query="hasQuery"
                :has-results="hasResults"
                @search="handleSearch"
                @clear="handleClearSearch"
                @export="handleExportSearch"
                @apply-suggestion="handleApplySuggestion"
              />
            </div>
          </div>
        </div>

        <JsonViewer
          :data="displayData.json"
          :search-query="searchQueryFromComposable"
          :editable="editable"
          @edit="(key, value) => emit('edit-json', key, value)"
        />
      </div>

      <!-- Split View -->
      <div v-else-if="currentView === 'split'" class="space-y-4">
        <!-- Shared Search Controls for Split View -->
        <div class="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium">Search:</label>
            <div class="flex items-center">
              <Input
                v-model="searchQueryFromComposable"
                type="text"
                placeholder="Search in both views..."
                class="w-64"
              />
              <AdvancedSearchSheet
                v-model:selected-language="selectedSearchLanguage"
                v-model:search-mode="searchMode"
                v-model:search-threshold="searchThreshold"
                v-model:max-results="maxResults"
                :search-results="searchResults"
                :is-searching="isSearching"
                :search-stats="searchStats"
                :available-languages="availableLanguages"
                :suggestions="searchSuggestions"
                :has-query="hasQuery"
                :has-results="hasResults"
                @search="handleSearch"
                @clear="handleClearSearch"
                @export="handleExportSearch"
                @apply-suggestion="handleApplySuggestion"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 p-4">
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Table View</h3>
            <div class="border rounded overflow-hidden p-2">
              <DataTable
                v-if="displayData.csv"
                :data="displayData.csv"
                :search-query="searchQueryFromComposable"
                :show-actions="false"
              />
            </div>
          </div>

          <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">JSON View</h3>
            <div class="border rounded overflow-hidden p-2">
              <JsonViewer
                :data="displayData.json"
                :search-query="searchQueryFromComposable"
                :editable="false"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- CSV Table View (JSON files only) -->
      <div v-else-if="currentView === 'csv-table'" class="w-full">
        <div class="space-y-2">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 border-b pb-2">CSV Table View</h3>
          <DataTable
            v-if="displayData.csv"
            :data="displayData.csv"
            :search-query="searchQueryFromComposable"
            :show-actions="editable"
            :allow-language-management="true"
            :current-languages="tableLanguages"
            @edit-row="handleEditRow"
            @delete-row="handleDeleteRow"
            @add-language="handleAddLanguage"
            @remove-language="handleRemoveLanguage"
            @sort="(column, direction) => emit('sort', column, direction)"
          >
            <template #advanced-search>
              <AdvancedSearchSheet
                v-model:selected-language="selectedSearchLanguage"
                v-model:search-mode="searchMode"
                v-model:search-threshold="searchThreshold"
                v-model:max-results="maxResults"
                :search-results="searchResults"
                :is-searching="isSearching"
                :search-stats="searchStats"
                :available-languages="availableLanguages"
                :suggestions="searchSuggestions"
                :has-query="hasQuery"
                :has-results="hasResults"
                @search="handleSearch"
                @clear="handleClearSearch"
                @export="handleExportSearch"
                @apply-suggestion="handleApplySuggestion"
              />
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Dual View (JSON files only) -->
      <div v-else-if="currentView === 'dual'" class="space-y-6">
        <!-- JSON View Section -->
        <div class="space-y-2">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 border-b pb-2">JSON View</h3>
          <JsonViewer
            v-if="displayData?.json"
            :data="displayData.json"
            :search-query="searchQueryFromComposable"
            :editable="editable"
            @edit="(key, value) => emit('edit-json', key, value)"
          />
        </div>

        <!-- CSV Table View Section -->
        <div class="space-y-2">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 border-b pb-2">Table View (English)</h3>
          <DataTable
            v-if="displayData.csv"
            :data="displayData.csv"
            :search-query="searchQueryFromComposable"
            :show-actions="editable"
            :allow-language-management="true"
            :current-languages="tableLanguages"
            @edit-row="handleEditRow"
            @delete-row="handleDeleteRow"
            @add-language="handleAddLanguage"
            @remove-language="handleRemoveLanguage"
            @sort="(column, direction) => emit('sort', column, direction)"
          >
            <template #advanced-search>
              <AdvancedSearchSheet
                v-model:selected-language="selectedSearchLanguage"
                v-model:search-mode="searchMode"
                v-model:search-threshold="searchThreshold"
                v-model:max-results="maxResults"
                :search-results="searchResults"
                :is-searching="isSearching"
                :search-stats="searchStats"
                :available-languages="availableLanguages"
                :suggestions="searchSuggestions"
                :has-query="hasQuery"
                :has-results="hasResults"
                @search="handleSearch"
                @clear="handleClearSearch"
                @export="handleExportSearch"
                @apply-suggestion="handleApplySuggestion"
              />
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Data Statistics -->
    <div class="text-sm text-muted-foreground space-y-1">
      <div class="flex items-center justify-between">
        <span>Total entries: {{ totalEntries }}</span>
        <span>Languages: {{ availableLanguages.length }}</span>
      </div>
      <div v-if="hasQuery" class="text-primary">
        Search active: "{{ searchQueryFromComposable }}"
      </div>
    </div>
  </div>

  <!-- Enhanced Edit Row Dialog -->
  <EditRowDialog
    v-if="isEditRowDialogOpen && currentEditRow"
    v-model:open="isEditRowDialogOpen"
    :original-row="currentEditRow"
    :all-languages="allLanguagesForEdit"
    @save="handleEditRowSave"
    @cancel="handleEditRowCancel"
  />

  <!-- Enhanced Delete Row Dialog -->
  <DeleteConfirmationDialog
    v-if="isDeleteRowDialogOpen && currentDeleteRow"
    v-model:open="isDeleteRowDialogOpen"
    :translation-key="currentDeleteRow.Key || ''"
    :translation-value="getFirstLanguageValue(currentDeleteRow)"
    :language="getFirstLanguageName()"
    @delete="handleDeleteRowConfirm"
    @cancel="handleDeleteRowCancel"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, defineAsyncComponent } from 'vue'
import LanguageMultiSelect from './LanguageMultiSelect.vue'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import AdvancedSearchSheet from './AdvancedSearchSheet.vue'
import type { CSVData, TranslationData, MultiLanguageTranslationData, ViewMode, CSVRow, Language } from '@/types'

interface EditRowData {
  originalKey: string
  newKey: string
  originalLanguages: Record<string, string>
  newLanguages: Record<string, string>
}
import { csvToJSON, csvToMultiLanguageJSON, getLanguagesFromCSV } from '@/utils/csv'
import { useSearch } from '@/composables/useSearch'
import { memoizedTransforms } from '@/utils/memoization'
import { useTranslationStore, useLanguageStore, storeToRefs } from '@/stores'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'


interface Props {
  csvData?: CSVData
  jsonData?: TranslationData
  multiLanguageJsonData?: MultiLanguageTranslationData
  editable?: boolean
  supportsSplitView?: boolean
  defaultView?: ViewMode
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  supportsSplitView: true,
  defaultView: 'table'
})

const emit = defineEmits<{
  'export': [format: 'csv' | 'json']
  'edit-row': [row: CSVRow, index: number]
  'delete-row': [row: CSVRow, index: number]
  'edit-json': [key: string, value: string]
  'sort': [column: string, direction: 'asc' | 'desc']
  'view-change': [view: ViewMode]
}>()

const EditRowDialog = defineAsyncComponent(() => import('./EditRowDialog.vue'));
const DeleteConfirmationDialog = defineAsyncComponent(() => import('./DeleteConfirmationDialog.vue'));
const JsonViewer = defineAsyncComponent(() => import('./JsonViewer.vue'));
const DataTable = defineAsyncComponent(() => import('./DataTable.vue'));

// Store integration
const translationStore = useTranslationStore()
const languageStore = useLanguageStore()
const {
  csvData: storeCSVData,
  jsonData: storeJSONData,
  multiLanguageJsonData: storeMultiLanguageJSONData
} = storeToRefs(translationStore)
const { tableLanguages } = storeToRefs(languageStore)

// Initialize store data based on props - ensures language column management works for all file types
function initializeStoreData() {
  // Prevent recursive updates: only initialize if store doesn't have data
  // This prevents the watcher from triggering itself when store is updated
  if (translationStore.hasData) {
    return
  }

  // Priority: multiLanguageJsonData > csvData > jsonData
  if (props.multiLanguageJsonData && Object.keys(props.multiLanguageJsonData).length > 0) {
    // Store multi-language JSON data in store
    translationStore.setMultiLanguageJSONData(props.multiLanguageJsonData)

    // Convert multi-language JSON to CSV and store it
    const languages = Object.keys(props.multiLanguageJsonData).sort()
    const csvData = memoizedTransforms.jsonToCSV(props.multiLanguageJsonData, languages)
    translationStore.setCSVData(csvData)

    // Set table languages based on available languages
    const supportedLanguages = languages.map(lang =>
      SUPPORTED_LANGUAGES.find(sl => sl.code === lang || sl.name === lang) ||
      { code: lang, name: lang, nativeName: lang }
    )
    languageStore.setTableLanguages(supportedLanguages)
  } else if (props.csvData) {
    // Store CSV data directly
    translationStore.setCSVData(props.csvData)

    // Extract and set table languages from CSV headers
    const languages = getLanguagesFromCSV(props.csvData)
    const supportedLanguages = languages.map(lang =>
      SUPPORTED_LANGUAGES.find(sl => sl.name === lang || sl.code === lang) ||
      { code: lang.toLowerCase().replace(/\s+/g, '-'), name: lang, nativeName: lang }
    )
    languageStore.setTableLanguages(supportedLanguages)
  } else if (props.jsonData && Object.keys(props.jsonData).length > 0) {
    // Store single JSON data in store
    translationStore.setJSONData(props.jsonData)

    // Convert single JSON to CSV format and store it
    const language = 'English' // Default language for single JSON files
    const csvData: CSVData = {
      headers: ['Key', language],
      rows: Object.entries(props.jsonData).map(([key, value]) => ({
        Key: key,
        [language]: value
      }))
    }
    translationStore.setCSVData(csvData)

    // Set English as the default table language
    const englishLang = SUPPORTED_LANGUAGES.find(sl => sl.code === 'en') || SUPPORTED_LANGUAGES[0]
    languageStore.setTableLanguages([englishLang])
  }
}

const currentView = ref<ViewMode>(props.defaultView)
const selectedLanguages = ref<string[]>([])

// Edit row dialog state
const isEditRowDialogOpen = ref(false)
const currentEditRow = ref<CSVRow>()

// Delete row dialog state
const isDeleteRowDialogOpen = ref(false)
const currentDeleteRow = ref<CSVRow>()

// Performance monitoring removed from computed to avoid side effects

// Performance optimization: use shallowRef for large data objects

// Initialize search functionality
const {
  searchQuery: searchQueryFromComposable,
  searchResults,
  isSearching,
  searchStats,
  selectedLanguage: selectedSearchLanguage,
  searchMode,
  searchThreshold,
  maxResults,
  indexJSONData,
  indexMultiLanguageJSONData,
  indexCSVData,
  performSearch,
  clearSearch,
  getSuggestions,
  exportSearchResults
} = useSearch()

const searchSuggestions = computed(() => getSuggestions(5))

// Computed properties for search state
const hasQuery = computed(() => searchQueryFromComposable.value.trim().length > 0)
const hasResults = computed(() => searchResults.value.length > 0)

const availableLanguages = computed(() => {
  // Use store data if available, otherwise use props (reactive to store changes)
  const currentMultiLanguageJSONData = storeMultiLanguageJSONData.value || props.multiLanguageJsonData
  const currentCSVData = storeCSVData.value || props.csvData

  if (currentMultiLanguageJSONData) {
    // For multi-language JSON, convert language codes to language names for consistency
    const languageCodes = memoizedTransforms.getLanguages(currentMultiLanguageJSONData)
    return languageCodes.map(code => {
      const language = SUPPORTED_LANGUAGES.find(sl => sl.code === code)
      return language ? language.name : code
    })
  }
  if (currentCSVData) {
    // For CSV, return language column names (already human-readable)
    return getLanguagesFromCSV(currentCSVData)
  }
  return []
})

const totalEntries = computed(() => {
  // Use store data if available, otherwise use props (reactive to store changes)
  const currentMultiLanguageJSONData = storeMultiLanguageJSONData.value || props.multiLanguageJsonData
  const currentCSVData = storeCSVData.value || props.csvData
  const currentJSONData = storeJSONData.value || props.jsonData

  if (currentMultiLanguageJSONData) {
    return memoizedTransforms.countKeys(currentMultiLanguageJSONData)
  }
  if (currentCSVData) {
    return currentCSVData.rows.length
  }
  if (currentJSONData) {
    return Object.keys(currentJSONData).length
  }
  return 0
})

// Computed property for all languages available for editing (not affected by filters)
const allLanguagesForEdit = computed(() => {
  // Get all language columns from the store data (unfiltered)
  const currentCSVData = storeCSVData.value || props.csvData
  if (currentCSVData && currentCSVData.headers.length > 0) {
    // Return all headers except 'Key'
    return currentCSVData.headers.filter(header => header.toLowerCase() !== 'key')
  }
  return []
})

// Cache removed to eliminate side effects in computed properties

const displayData = computed(() => {
  // Use store data if available, otherwise use props
  // Using reactive store references to ensure reactivity to store changes
  const currentCSVData = storeCSVData.value || props.csvData
  const currentMultiLanguageJSONData = storeMultiLanguageJSONData.value || props.multiLanguageJsonData
  const currentJSONData = storeJSONData.value || props.jsonData

  let csv: CSVData
  let json: TranslationData | MultiLanguageTranslationData

  if (currentMultiLanguageJSONData) {
    // Handle multi-language JSON data (from multiple JSON file uploads)
    // This takes priority over csvData when both are present

    // Apply language filtering to JSON data
    if (selectedLanguages.value.length > 0 && selectedLanguages.value.length < availableLanguages.value.length) {
      // Filter to show only selected languages
      // Convert language names back to language codes for JSON data access
      const filteredJson: MultiLanguageTranslationData = {}
      for (const languageName of selectedLanguages.value) {
        // Find the language code for this language name
        const language = SUPPORTED_LANGUAGES.find(sl => sl.name === languageName)
        const languageCode = language ? language.code : languageName

        if (languageCode in currentMultiLanguageJSONData) {
          filteredJson[languageCode] = currentMultiLanguageJSONData[languageCode]
        }
      }
      json = filteredJson
    } else {
      // Show all languages when no filter applied or all languages selected
      json = currentMultiLanguageJSONData
    }

    // Convert multi-language JSON to CSV for table view
    // Create a custom conversion that uses language names as headers but language codes for data access
    const selectedLanguageCodes = selectedLanguages.value.length > 0 && selectedLanguages.value.length < availableLanguages.value.length
      ? selectedLanguages.value.map(languageName => {
          const language = SUPPORTED_LANGUAGES.find(sl => sl.name === languageName)
          return language ? language.code : languageName
        }).filter(code => currentMultiLanguageJSONData && code in currentMultiLanguageJSONData).sort()
      : Object.keys(currentMultiLanguageJSONData).sort()

    // Create CSV with language names as headers
    const allKeys = new Set<string>()
    for (const languageCode of selectedLanguageCodes) {
      if (currentMultiLanguageJSONData[languageCode]) {
        Object.keys(currentMultiLanguageJSONData[languageCode]).forEach(key => allKeys.add(key))
      }
    }

    const languageNames = selectedLanguageCodes.map(code => {
      const language = SUPPORTED_LANGUAGES.find(sl => sl.code === code)
      return language ? language.name : code
    })

    csv = {
      headers: ['Key', ...languageNames],
      rows: Array.from(allKeys).sort().map(key => {
        const row: CSVRow = { Key: key }
        selectedLanguageCodes.forEach((code, index) => {
          const languageName = languageNames[index]
          row[languageName] = currentMultiLanguageJSONData[code]?.[key] || ''
        })
        return row
      })
    }
  } else if (currentCSVData) {
    csv = currentCSVData

    // Filter CSV data if we have selected languages and they're different from available languages
    if (selectedLanguages.value.length > 0 &&
        selectedLanguages.value.length < availableLanguages.value.length) {
      csv = memoizedTransforms.filterCSV(currentCSVData, selectedLanguages.value)
    }

    // Convert CSV to JSON for JSON view (use first selected language or first available)
    const targetLanguage = selectedLanguages.value.length > 0 ? selectedLanguages.value[0] : availableLanguages.value[0]
    json = targetLanguage ? csvToJSON(currentCSVData, targetLanguage) : {}
  } else if (currentJSONData) {
    json = currentJSONData

    // Convert JSON to CSV for table view (always show English for JSON files)
    const language = 'English'
    csv = {
      headers: ['Key', language],
      rows: Object.entries(json).map(([key, value]) => ({
        Key: key,
        [language]: value
      }))
    }
  } else {
    csv = { headers: [], rows: [] }
    json = {}
  }

  const result = { csv, json }

  // Note: Cache mutation removed from computed to avoid side effects
  // Caching can be implemented with a separate watcher if needed for performance

  return result
})

// Watch for prop changes and initialize store data (including initial mount)
watch(
  () => [props.csvData, props.jsonData, props.multiLanguageJsonData],
  () => {
    initializeStoreData()
  },
  { deep: true, immediate: true }
)

function setView(view: ViewMode) {
  currentView.value = view
  emit('view-change', view)
}

// Handle ToggleGroup value change
function handleViewChange(value: unknown) {
  if (typeof value === 'string' && value) {
    setView(value as ViewMode)
  }
}

// Search handlers
function handleSearch() {
  performSearch()
}

function handleClearSearch() {
  clearSearch()
}

function handleExportSearch(format: 'json' | 'csv') {
  const results = exportSearchResults(format)

  // Create and download file
  const blob = new Blob([results], {
    type: format === 'json' ? 'application/json' : 'text/csv'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `search-results.${format}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleApplySuggestion(suggestion: string) {
  searchQueryFromComposable.value = suggestion
  performSearch()
}

// Index data for search when it changes
watch(() => props.jsonData, (newData) => {
  if (newData) {
    indexJSONData(newData)
  }
}, { immediate: true })

watch(() => props.multiLanguageJsonData, (newData) => {
  if (newData) {
    indexMultiLanguageJSONData(newData)
  }
}, { immediate: true })

watch(() => props.csvData, (newData) => {
  if (newData) {
    indexCSVData(newData)
  }
}, { immediate: true })

function handleLanguageSelectionChange(languages: string[]) {
  selectedLanguages.value = languages
}

// Helper function to sync JSON data when CSV changes
function syncJSONDataFromCSV() {
  if (!storeCSVData.value) return

  // If we have multi-language JSON data, update it from CSV
  if (storeMultiLanguageJSONData.value) {
    const updatedMultiLanguageJSON = csvToMultiLanguageJSON(storeCSVData.value)
    translationStore.setMultiLanguageJSONData(updatedMultiLanguageJSON)
  }

  // If we have single JSON data, update it from CSV (use first language column)
  if (storeJSONData.value && storeCSVData.value.headers.length > 1) {
    const firstLanguage = storeCSVData.value.headers[1] // Skip 'Key' column
    const updatedJSON = csvToJSON(storeCSVData.value, firstLanguage)
    translationStore.setJSONData(updatedJSON)
  }
}

// Language column management
function handleAddLanguage(language: Language) {
  // Add to language store
  languageStore.addTableLanguage(language)

  // Add column to CSV data - store should always have CSV data after initialization
  if (storeCSVData.value) {
    translationStore.addLanguageColumn(language.code, language.name)
    // Sync JSON data to reflect the new language column
    syncJSONDataFromCSV()
  } else {
    // Fallback: try to initialize store data only if no data exists
    if (!translationStore.hasData) {
      initializeStoreData()
    }
    if (storeCSVData.value) {
      translationStore.addLanguageColumn(language.code, language.name)
      // Sync JSON data to reflect the new language column
      syncJSONDataFromCSV()
    }
  }

  // Auto-include newly added language in selection if filtering is active
  // This ensures the new language column is immediately visible
  if (selectedLanguages.value.length > 0 && selectedLanguages.value.length < availableLanguages.value.length) {
    if (!selectedLanguages.value.includes(language.name) && !selectedLanguages.value.includes(language.code)) {
      selectedLanguages.value = [...selectedLanguages.value, language.name]
    }
  }
}

function handleRemoveLanguage(language: Language) {
  // Remove from language store
  const removed = languageStore.removeTableLanguage(language)

  // Remove column from CSV data if successfully removed and CSV data is available
  const currentCSVData = storeCSVData.value || props.csvData
  if (removed && currentCSVData) {
    // Ensure CSV data is in store
    if (!storeCSVData.value && props.csvData) {
      translationStore.setCSVData(props.csvData)
    }
    translationStore.removeLanguageColumn(language.name)
    // Sync JSON data to reflect the removed language column
    syncJSONDataFromCSV()

    // Remove language from selection if it was selected
    selectedLanguages.value = selectedLanguages.value.filter(
      lang => lang !== language.name && lang !== language.code
    )
  }
}

// Enhanced edit row functionality
function handleEditRow(row: CSVRow, _index: number) {
  currentEditRow.value = { ...row }
  isEditRowDialogOpen.value = true
}

function handleEditRowSave(editData: EditRowData) {
  // Update the CSV data in the store
  if (storeCSVData.value) {
    // Find the row to update by matching the original key
    const rowIndex = storeCSVData.value.rows.findIndex(row => row.Key === editData.originalKey)

    if (rowIndex !== -1) {
      // Create the updated row with new data
      const updatedRow: CSVRow = { Key: editData.newKey }

      // Add all language values
      Object.entries(editData.newLanguages).forEach(([lang, value]) => {
        updatedRow[lang] = value as string
      })

      // Create a shallow copy of the CSV data for efficient updates
      const updatedCSVData = {
        ...storeCSVData.value,
        rows: [...storeCSVData.value.rows]
      }

      // Update only the specific row (targeted update)
      updatedCSVData.rows[rowIndex] = updatedRow

      // Update the store with optimized data structure
      translationStore.setCSVData(updatedCSVData)

      // Sync JSON data to reflect the changes
      syncJSONDataFromCSV()

      // Close the dialog immediately to prevent any reactivity issues
      isEditRowDialogOpen.value = false
      currentEditRow.value = undefined

      // Note: Removed emit('edit-row') to prevent triggering the old edit dialog system
      // The enhanced EditRowDialog handles the complete edit workflow internally
    }
  }
}

function handleEditRowCancel() {
  isEditRowDialogOpen.value = false
  currentEditRow.value = undefined;
}

// Enhanced delete row functionality
function handleDeleteRow(row: CSVRow, _index: number) {
  currentDeleteRow.value = { ...row }
  isDeleteRowDialogOpen.value = true
}

function handleDeleteRowConfirm(deleteData: { key: string; value: string; language?: string }) {
  // Handle delete operation with store integration
  if (storeCSVData.value) {
    // Call the store delete method
    const result = translationStore.deleteTranslationFromCSV(deleteData)

    if (result.success) {
      // Sync JSON data to reflect the deletion
      syncJSONDataFromCSV()

      // Close the dialog
      isDeleteRowDialogOpen.value = false
      currentDeleteRow.value = undefined

      // Note: Removed emit('delete-row') to prevent triggering the old delete dialog system
      // The enhanced delete functionality handles the complete workflow internally
    } else {
      console.error('Failed to delete row:', result.error)
    }
  } else {
    // Fallback to old system for non-store data
    if (currentDeleteRow.value) {
      emit('delete-row', currentDeleteRow.value, 0)
    }
    isDeleteRowDialogOpen.value = false
    currentDeleteRow.value = undefined
  }
}

function handleDeleteRowCancel() {
  isDeleteRowDialogOpen.value = false
  currentDeleteRow.value = undefined
}

// Helper functions for delete dialog
function getFirstLanguageValue(row: CSVRow): string {
  const firstLanguageColumn = allLanguagesForEdit.value[0]
  return firstLanguageColumn ? (row[firstLanguageColumn] || '') : ''
}

function getFirstLanguageName(): string {
  return allLanguagesForEdit.value[0] || ''
}

// Watch for changes in available languages and set default
watch(availableLanguages, (languages) => {
  if (languages.length > 0 && selectedLanguages.value.length === 0) {
    // Default to all languages when first loaded
    selectedLanguages.value = []
  }
}, { immediate: true })

// Watch for JSON data changes - keep table view for better UX
watch(() => props.jsonData, (jsonData) => {
  // JSON files should use 'table' view by default for optimal user experience
  // The table view now supports language column management for all file types
  if (jsonData && !props.csvData && currentView.value !== 'table') {
    setView('table')
  }
}, { immediate: true })

// Initialize table languages when CSV data is loaded
watch(() => props.csvData, (csvData) => {
  if (csvData && csvData.headers.length > 0) {
    // Set CSV data in store if not already set
    if (!translationStore.csvData) {
      translationStore.setCSVData(csvData)
    }

    // Map CSV headers to Language objects
    const languages: Language[] = csvData.headers
      .map(header => {
        // Try to find matching language by name
        return SUPPORTED_LANGUAGES.find(lang =>
          lang.name.toLowerCase() === header.toLowerCase() ||
          lang.code.toLowerCase() === header.toLowerCase()
        )
      })
      .filter((lang): lang is Language => lang !== undefined)

    // If we found matching languages, set them as table languages
    if (languages.length > 0) {
      languageStore.setTableLanguages(languages)
    } else {
      // Default to English if no matching languages found
      languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]])
    }
  }
}, { immediate: true })

onMounted(() => {
  console.log('DataViewer mounted');
})
</script>
