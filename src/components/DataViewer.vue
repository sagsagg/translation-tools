<template>
  <div class="w-full space-y-4">
    <!-- View Controls -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- View Toggle -->
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium">View:</label>
          <div class="flex border rounded-lg overflow-hidden">
            <button
              class="px-3 py-1 text-sm font-medium transition-colors"
              :class="{
                'bg-blue-600 text-white': currentView === 'table',
                'bg-gray-100 text-gray-700 hover:bg-gray-200': currentView !== 'table'
              }"
              @click="setView('table')"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9m-9 4h9" />
              </svg>
              Table
            </button>
            <button
              class="px-3 py-1 text-sm font-medium transition-colors"
              :class="{
                'bg-blue-600 text-white': currentView === 'json',
                'bg-gray-100 text-gray-700 hover:bg-gray-200': currentView !== 'json'
              }"
              @click="setView('json')"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              JSON
            </button>
            <button
              v-if="supportsSplitView"
              class="px-3 py-1 text-sm font-medium transition-colors"
              :class="{
                'bg-blue-600 text-white': currentView === 'split',
                'bg-gray-100 text-gray-700 hover:bg-gray-200': currentView !== 'split'
              }"
              @click="setView('split')"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Split
            </button>
            <button
              v-if="(jsonData && !csvData) || multiLanguageJsonData"
              class="px-3 py-1 text-sm font-medium transition-colors"
              :class="{
                'bg-blue-600 text-white': currentView === 'csv-table',
                'bg-gray-100 text-gray-700 hover:bg-gray-200': currentView !== 'csv-table'
              }"
              @click="setView('csv-table')"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9m-9 4h9" />
              </svg>
              CSV Table
            </button>
            <button
              v-if="(jsonData && !csvData) || multiLanguageJsonData"
              class="px-3 py-1 text-sm font-medium transition-colors"
              :class="{
                'bg-blue-600 text-white': currentView === 'dual',
                'bg-gray-100 text-gray-700 hover:bg-gray-200': currentView !== 'dual'
              }"
              @click="setView('dual')"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Dual View
            </button>
          </div>
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
          :data="displayData.csv"
          :search-query="searchQueryFromComposable"
          :show-actions="editable"
          :allow-language-management="true"
          :current-languages="tableLanguages"
          @edit-row="(row, index) => emit('edit-row', row, index)"
          @delete-row="(row, index) => emit('delete-row', row, index)"
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
            :data="displayData.csv"
            :search-query="searchQueryFromComposable"
            :show-actions="editable"
            :allow-language-management="true"
            :current-languages="tableLanguages"
            @edit-row="(row, index) => emit('edit-row', row, index)"
            @delete-row="(row, index) => emit('delete-row', row, index)"
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
            :data="displayData.csv"
            :search-query="searchQueryFromComposable"
            :show-actions="editable"
            :allow-language-management="true"
            :current-languages="tableLanguages"
            @edit-row="(row, index) => emit('edit-row', row, index)"
            @delete-row="(row, index) => emit('delete-row', row, index)"
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
</template>

<script setup lang="ts">
import { ref, computed, watch, shallowRef, onUnmounted } from 'vue'
import DataTable from './DataTable.vue'
import JsonViewer from './JsonViewer.vue'
import LanguageMultiSelect from './LanguageMultiSelect.vue'
import { Input } from '@/components/ui/input'
import { usePerformanceMonitor } from '@/utils/performance'

// Async component utilities for conditionally rendered components
import { createAsyncComponent, asyncComponentConfigs } from '@/utils/asyncComponents'

// Lazy load AdvancedSearchSheet since it's only rendered when the sheet is opened
const AdvancedSearchSheet = createAsyncComponent(
  () => import('./AdvancedSearchSheet.vue'),
  {
    ...asyncComponentConfigs.sheet,
    name: 'AdvancedSearchSheet',
    loadingComponent: () => import('@/components/skeleton/DialogSkeleton.vue')
  }
)
import type { CSVData, TranslationData, MultiLanguageTranslationData, ViewMode, CSVRow, Language } from '@/types'
import { csvToJSON, getLanguagesFromCSV } from '@/utils/csv'
import { useSearch } from '@/composables/useSearch'
import { memoizedTransforms, createCacheKey } from '@/utils/memoization'
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

// Store integration
const translationStore = useTranslationStore()
const languageStore = useLanguageStore()
const { tableLanguages } = storeToRefs(languageStore)

const currentView = ref<ViewMode>(props.defaultView)
const selectedLanguages = ref<string[]>([])

// Performance monitoring
const { startMeasurement, endMeasurement } = usePerformanceMonitor()

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
  if (props.multiLanguageJsonData) {
    return memoizedTransforms.getLanguages(props.multiLanguageJsonData)
  }
  if (props.csvData) {
    return getLanguagesFromCSV(props.csvData)
  }
  return []
})

const totalEntries = computed(() => {
  if (props.multiLanguageJsonData) {
    return memoizedTransforms.countKeys(props.multiLanguageJsonData)
  }
  if (props.csvData) {
    return props.csvData.rows.length
  }
  if (props.jsonData) {
    return Object.keys(props.jsonData).length
  }
  return 0
})

// Performance optimized cache using shallowRef for large data objects
const displayDataCache = shallowRef(new Map<string, { csv: CSVData; json: TranslationData | MultiLanguageTranslationData }>())

const displayData = computed(() => {
  startMeasurement('displayData-computation')

  // Use store's CSV data if available, otherwise use props
  const currentCSVData = translationStore.csvData || props.csvData

  // Skip cache when using store data to ensure reactivity
  const useCache = !translationStore.csvData

  let cacheKey = ''
  if (useCache) {
    // Create cache key from current props, store data, and selected languages
    cacheKey = createCacheKey(
      props.multiLanguageJsonData,
      currentCSVData,
      props.jsonData,
      selectedLanguages.value,
      tableLanguages.value // Include table languages in cache key
    )

    // Return cached result if available
    if (displayDataCache.value.has(cacheKey)) {
      endMeasurement('displayData-computation')
      return displayDataCache.value.get(cacheKey)!
    }
  }

  let csv: CSVData
  let json: TranslationData | MultiLanguageTranslationData

  if (props.multiLanguageJsonData) {
    // Handle multi-language JSON data (from multiple JSON file uploads)
    // This takes priority over csvData when both are present

    // Apply language filtering to JSON data
    if (selectedLanguages.value.length > 0 && selectedLanguages.value.length < availableLanguages.value.length) {
      // Filter to show only selected languages
      const filteredJson: MultiLanguageTranslationData = {}
      for (const language of selectedLanguages.value) {
        if (language in props.multiLanguageJsonData) {
          filteredJson[language] = props.multiLanguageJsonData[language]
        }
      }
      json = filteredJson
    } else {
      // Show all languages when no filter applied or all languages selected
      json = props.multiLanguageJsonData
    }

    // Convert multi-language JSON to CSV for table view using memoized function
    const languages = selectedLanguages.value.length > 0 && selectedLanguages.value.length < availableLanguages.value.length
      ? selectedLanguages.value.filter(lang => props.multiLanguageJsonData && lang in props.multiLanguageJsonData).sort()
      : Object.keys(props.multiLanguageJsonData).sort()

    csv = memoizedTransforms.jsonToCSV(props.multiLanguageJsonData, languages)
  } else if (currentCSVData) {
    csv = currentCSVData

    // Filter CSV data based on selected languages using memoized function
    if (selectedLanguages.value.length > 0 && selectedLanguages.value.length < availableLanguages.value.length) {
      csv = memoizedTransforms.filterCSV(currentCSVData, selectedLanguages.value)
    }

    // Convert CSV to JSON for JSON view (use first selected language or first available)
    const targetLanguage = selectedLanguages.value.length > 0 ? selectedLanguages.value[0] : availableLanguages.value[0]
    json = targetLanguage ? csvToJSON(currentCSVData, targetLanguage) : {}
  } else if (props.jsonData) {
    json = props.jsonData

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

  // Cache the result for future use (only when not using store data)
  if (useCache && cacheKey) {
    displayDataCache.value.set(cacheKey, result)
  }

  endMeasurement('displayData-computation')
  return result
})

// Cleanup on component unmount
onUnmounted(() => {
  // Clear cache to prevent memory leaks
  displayDataCache.value.clear()
})

function setView(view: ViewMode) {
  currentView.value = view
  emit('view-change', view)
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

// Language column management
function handleAddLanguage(language: Language) {
  // Add to language store
  languageStore.addTableLanguage(language)

  // Add column to CSV data if available
  // Use store's CSV data or props CSV data
  const currentCSVData = translationStore.csvData || props.csvData
  if (currentCSVData) {
    // If we haven't set the CSV data in the store yet, set it first
    if (!translationStore.csvData && props.csvData) {
      translationStore.setCSVData(props.csvData)
    }
    translationStore.addLanguageColumn(language.code, language.name)
  }
}

function handleRemoveLanguage(language: Language) {
  // Remove from language store
  const removed = languageStore.removeTableLanguage(language)

  // Remove column from CSV data if successfully removed and CSV data is available
  const currentCSVData = translationStore.csvData || props.csvData
  if (removed && currentCSVData) {
    // Ensure CSV data is in store
    if (!translationStore.csvData && props.csvData) {
      translationStore.setCSVData(props.csvData)
    }
    translationStore.removeLanguageColumn(language.name)
  }
}

// Watch for changes in available languages and set default
watch(availableLanguages, (languages) => {
  if (languages.length > 0 && selectedLanguages.value.length === 0) {
    // Default to all languages when first loaded
    selectedLanguages.value = []
  }
}, { immediate: true })

// Watch for JSON data changes and auto-switch to CSV table view
watch(() => props.jsonData, (jsonData) => {
  if (jsonData && !props.csvData && currentView.value === 'table') {
    setView('csv-table')
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
</script>
