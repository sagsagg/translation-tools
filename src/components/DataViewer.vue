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
          :search-query="searchQuery"
          :show-actions="editable"
          @edit-row="(row, index) => emit('edit-row', row, index)"
          @delete-row="(row, index) => emit('delete-row', row, index)"
          @sort="(column, direction) => emit('sort', column, direction)"
        />
      </div>

      <!-- JSON View -->
      <div v-else-if="currentView === 'json'" class="w-full">
        <JsonViewer
          :data="displayData.json"
          :search-query="searchQuery"
          :editable="editable"
          @edit="(key, value) => emit('edit-json', key, value)"
        />
      </div>

      <!-- Split View -->
      <div v-else-if="currentView === 'split'" class="grid grid-cols-2 gap-4 p-4">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Table View</h3>
          <div class="border rounded overflow-hidden p-2">
            <DataTable
              :data="displayData.csv"
              :search-query="searchQuery"
              :show-actions="false"
            />
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">JSON View</h3>
          <div class="border rounded overflow-hidden p-2">
            <JsonViewer
              :data="displayData.json"
              :search-query="searchQuery"
              :editable="false"
            />
          </div>
        </div>
      </div>

      <!-- CSV Table View (JSON files only) -->
      <div v-else-if="currentView === 'csv-table'" class="w-full">
        <div class="space-y-2">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 border-b pb-2">CSV Table View</h3>
          <DataTable
            :data="displayData.csv"
            :search-query="searchQuery"
            :show-actions="editable"
            @edit-row="(row, index) => emit('edit-row', row, index)"
            @delete-row="(row, index) => emit('delete-row', row, index)"
            @sort="(column, direction) => emit('sort', column, direction)"
          />
        </div>
      </div>

      <!-- Dual View (JSON files only) -->
      <div v-else-if="currentView === 'dual'" class="space-y-6">
        <!-- JSON View Section -->
        <div class="space-y-2">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 border-b pb-2">JSON View</h3>
          <JsonViewer
            :data="displayData.json"
            :search-query="searchQuery"
            :editable="editable"
            @edit="(key, value) => emit('edit-json', key, value)"
          />
        </div>

        <!-- CSV Table View Section -->
        <div class="space-y-2">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 border-b pb-2">Table View (English)</h3>
          <DataTable
            :data="displayData.csv"
            :search-query="searchQuery"
            :show-actions="editable"
            @edit-row="(row, index) => emit('edit-row', row, index)"
            @delete-row="(row, index) => emit('delete-row', row, index)"
            @sort="(column, direction) => emit('sort', column, direction)"
          />
        </div>
      </div>
    </div>

    <!-- Data Statistics -->
    <div class="text-sm text-muted-foreground space-y-1">
      <div class="flex items-center justify-between">
        <span>Total entries: {{ totalEntries }}</span>
        <span>Languages: {{ availableLanguages.length }}</span>
      </div>
      <div v-if="searchQuery" class="text-primary">
        Search active: "{{ searchQuery }}"
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DataTable from './DataTable.vue'
import JsonViewer from './JsonViewer.vue'
import LanguageMultiSelect from './LanguageMultiSelect.vue'
import type { CSVData, TranslationData, MultiLanguageTranslationData, ViewMode, CSVRow } from '@/types'
import { csvToJSON, getLanguagesFromCSV } from '@/utils/csv'

interface Props {
  csvData?: CSVData
  jsonData?: TranslationData
  multiLanguageJsonData?: MultiLanguageTranslationData
  searchQuery?: string
  editable?: boolean
  supportsSplitView?: boolean
  defaultView?: ViewMode
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
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

const currentView = ref<ViewMode>(props.defaultView)
const selectedLanguages = ref<string[]>([])

const availableLanguages = computed(() => {
  if (props.multiLanguageJsonData) {
    return Object.keys(props.multiLanguageJsonData).sort()
  }
  if (props.csvData) {
    return getLanguagesFromCSV(props.csvData)
  }
  return []
})

const totalEntries = computed(() => {
  if (props.multiLanguageJsonData) {
    // Count unique translation keys across all languages
    const allKeys = new Set<string>()
    for (const languageData of Object.values(props.multiLanguageJsonData)) {
      Object.keys(languageData).forEach(key => allKeys.add(key))
    }
    return allKeys.size
  }
  if (props.csvData) {
    return props.csvData.rows.length
  }
  if (props.jsonData) {
    return Object.keys(props.jsonData).length
  }
  return 0
})

const displayData = computed(() => {
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

    // Convert multi-language JSON to CSV for table view
    const languages = selectedLanguages.value.length > 0 && selectedLanguages.value.length < availableLanguages.value.length
      ? selectedLanguages.value.filter(lang => props.multiLanguageJsonData && lang in props.multiLanguageJsonData).sort()
      : Object.keys(props.multiLanguageJsonData).sort()

    const allKeys = new Set<string>()

    // Collect all unique keys from selected languages
    for (const language of languages) {
      if (props.multiLanguageJsonData[language]) {
        Object.keys(props.multiLanguageJsonData[language]).forEach(key => allKeys.add(key))
      }
    }

    csv = {
      headers: ['Key', ...languages],
      rows: Array.from(allKeys).sort().map(key => {
        const row: CSVRow = { Key: key }
        for (const language of languages) {
          row[language] = props.multiLanguageJsonData![language][key] || ''
        }
        return row
      })
    }
  } else if (props.csvData) {
    csv = props.csvData

    // Filter CSV data based on selected languages
    if (selectedLanguages.value.length > 0 && selectedLanguages.value.length < availableLanguages.value.length) {
      // Filter to show only selected language columns
      const filteredHeaders = ['Key', ...selectedLanguages.value]
      const filteredRows = csv.rows.map(row => {
        const filteredRow: CSVRow = { Key: row.Key }
        selectedLanguages.value.forEach(lang => {
          if (lang in row) {
            filteredRow[lang] = row[lang]
          }
        })
        return filteredRow
      })
      csv = { headers: filteredHeaders, rows: filteredRows }
    }

    // Convert CSV to JSON for JSON view (use first selected language or first available)
    const targetLanguage = selectedLanguages.value.length > 0 ? selectedLanguages.value[0] : availableLanguages.value[0]
    json = targetLanguage ? csvToJSON(props.csvData, targetLanguage) : {}
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

  return { csv, json }
})

function setView(view: ViewMode) {
  currentView.value = view
  emit('view-change', view)
}

function handleLanguageSelectionChange(languages: string[]) {
  selectedLanguages.value = languages
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
</script>
