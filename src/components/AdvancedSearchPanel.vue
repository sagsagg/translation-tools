<template>
  <Card class="w-full">
    <div class="p-4 space-y-4">
      <!-- Search Input with Scope Selector -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label for="search-input" class="text-sm font-medium">
            Search Translations
          </Label>
          <Button
            v-if="hasQuery && hasResults"
            variant="outline"
            size="sm"
            @click="exportResults"
            class="text-xs"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Results
          </Button>
        </div>

        <div class="flex items-center space-x-2">
          <div class="flex-1">
            <Input
              id="search-input"
              v-model="searchQuery"
              :placeholder="searchPlaceholder"
              class="w-full"
              @keydown.enter="performSearch"
            />
          </div>

          <SearchScopeSelector
            v-model="searchMode"
            :search-stats="searchStats"
            :is-searching="isSearching"
            @scope-change="handleScopeChange"
          />
        </div>
      </div>

      <!-- Advanced Options (Collapsible) -->
      <div class="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          @click="showAdvanced = !showAdvanced"
          class="text-xs text-gray-600 dark:text-gray-400 p-0 h-auto"
        >
          <svg
            class="w-3 h-3 mr-1 transition-transform"
            :class="{ 'rotate-90': showAdvanced }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          Advanced Options
        </Button>

        <div v-if="showAdvanced" class="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          <!-- Language Filter -->
          <div v-if="availableLanguages.length > 1" class="space-y-1">
            <Label class="text-xs font-medium text-gray-600 dark:text-gray-400">
              Filter by Language
            </Label>
            <Select :model-value="selectedLanguage" @update:model-value="handleLanguageChange">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All languages</SelectItem>
                <SelectItem
                  v-for="language in availableLanguages"
                  :key="language"
                  :value="language"
                >
                  {{ language }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Search Sensitivity -->
          <div class="space-y-1">
            <Label class="text-xs font-medium text-gray-600 dark:text-gray-400">
              Search Sensitivity: {{ Math.round((1 - searchThreshold) * 100) }}%
            </Label>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">Exact</span>
              <input
                type="range"
                v-model.number="searchThreshold"
                min="0"
                max="0.8"
                step="0.1"
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                @input="handleThresholdChange"
              />
              <span class="text-xs text-gray-500">Fuzzy</span>
            </div>
          </div>

          <!-- Max Results -->
          <div class="space-y-1">
            <Label class="text-xs font-medium text-gray-600 dark:text-gray-400">
              Max Results: {{ maxResults }}
            </Label>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">10</span>
              <input
                type="range"
                v-model.number="maxResults"
                min="10"
                max="500"
                step="10"
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                @input="handleMaxResultsChange"
              />
              <span class="text-xs text-gray-500">500</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Results Summary -->
      <div v-if="hasQuery" class="flex items-center justify-between text-sm">
        <div class="flex items-center space-x-2">
          <Badge v-if="hasResults" variant="secondary">
            {{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }}
          </Badge>
          <Badge v-else variant="outline">
            No results
          </Badge>

          <span v-if="selectedLanguage" class="text-xs text-gray-500">
            in {{ selectedLanguage }}
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <Button
            v-if="hasQuery"
            variant="ghost"
            size="sm"
            @click="clearSearch"
            class="text-xs"
          >
            Clear
          </Button>

          <Button
            v-if="hasQuery && !isSearching"
            variant="outline"
            size="sm"
            @click="performSearch"
            class="text-xs"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      <!-- Quick Suggestions -->
      <div v-if="suggestions.length > 0 && hasQuery && !hasResults" class="space-y-2">
        <Label class="text-xs font-medium text-gray-600 dark:text-gray-400">
          Did you mean?
        </Label>
        <div class="flex flex-wrap gap-1">
          <Button
            v-for="suggestion in suggestions.slice(0, 5)"
            :key="suggestion"
            variant="outline"
            size="sm"
            @click="applySuggestion(suggestion)"
            class="text-xs"
          >
            {{ suggestion }}
          </Button>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SearchScopeSelector from './SearchScopeSelector.vue'
import type { SearchResult } from '@/types'

interface SearchStats {
  totalItems: number
  languages: string[]
  averageKeyLength: number
  averageValueLength: number
}

interface Props {
  searchQuery: string
  searchResults: SearchResult[]
  isSearching: boolean
  searchStats: SearchStats
  availableLanguages: string[]
  selectedLanguage: string
  searchMode: 'all' | 'keys' | 'values'
  searchThreshold: number
  maxResults: number
  suggestions: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedLanguage': [value: string]
  'update:searchMode': [value: 'all' | 'keys' | 'values']
  'update:searchThreshold': [value: number]
  'update:maxResults': [value: number]
  'search': []
  'clear': []
  'export': [format: 'json' | 'csv']
  'apply-suggestion': [suggestion: string]
}>()

const showAdvanced = ref(false)

const searchQuery = computed({
  get: () => props.searchQuery,
  set: (value) => emit('update:searchQuery', value)
})

const selectedLanguage = computed({
  get: () => props.selectedLanguage,
  set: (value) => emit('update:selectedLanguage', value)
})

const searchMode = computed({
  get: () => props.searchMode,
  set: (value) => emit('update:searchMode', value)
})

const searchThreshold = computed({
  get: () => props.searchThreshold,
  set: (value) => emit('update:searchThreshold', value)
})

const maxResults = computed({
  get: () => props.maxResults,
  set: (value) => emit('update:maxResults', value)
})

const hasQuery = computed(() => props.searchQuery.trim().length > 0)
const hasResults = computed(() => props.searchResults.length > 0)

const searchPlaceholder = computed(() => {
  switch (props.searchMode) {
    case 'keys':
      return 'Search translation keys...'
    case 'values':
      return 'Search translation values...'
    case 'all':
    default:
      return 'Search keys and values...'
  }
})

function handleScopeChange(scope: 'all' | 'keys' | 'values') {
  emit('update:searchMode', scope)
}

function handleLanguageChange(value: string | number | bigint | Record<string, unknown> | null | undefined) {
  const language = typeof value === 'string' ? value : ''
  emit('update:selectedLanguage', language)
}

function handleThresholdChange() {
  // Debounce threshold changes
  setTimeout(() => {
    if (hasQuery.value) {
      emit('search')
    }
  }, 300)
}

function handleMaxResultsChange() {
  // No need to re-search, just update the limit
}

function performSearch() {
  emit('search')
}

function clearSearch() {
  emit('clear')
}

function exportResults() {
  emit('export', 'json')
}

function applySuggestion(suggestion: string) {
  emit('apply-suggestion', suggestion)
}
</script>

<style scoped>
/* Custom range slider styles */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type="range"]::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type="range"]::-webkit-slider-track {
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
}

input[type="range"]::-moz-range-track {
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
}

.dark input[type="range"]::-webkit-slider-track {
  background: #374151;
}

.dark input[type="range"]::-moz-range-track {
  background: #374151;
}
</style>
