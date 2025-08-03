<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button
        variant="outline"
        size="sm"
        class="ml-2 h-9 px-3"
        :disabled="disabled"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
        Advanced
      </Button>
    </SheetTrigger>

    <SheetContent side="right" class="w-[400px] sm:w-[540px]">
      <SheetHeader>
        <SheetTitle>Advanced Search Options</SheetTitle>
        <SheetDescription>
          Configure advanced search parameters and filters for more precise results.
        </SheetDescription>
      </SheetHeader>

      <div class="space-y-6 px-4">
        <!-- Search Scope -->
        <div class="space-y-3">
          <Label class="text-sm font-medium">Search Scope</Label>
          <SearchScopeSelector
            v-model="searchMode"
            :search-stats="searchStats"
            :is-searching="isSearching"
            @scope-change="handleScopeChange"
          />
          <p class="text-xs text-muted-foreground">
            Choose whether to search in keys, values, or both.
          </p>
        </div>

        <!-- Language Filter -->
        <div v-if="availableLanguages.length > 1" class="space-y-3">
          <Label class="text-sm font-medium">Language Filter</Label>
          <Select :model-value="selectedLanguage" @update:model-value="handleLanguageChange">
            <SelectTrigger>
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
          <p class="text-xs text-muted-foreground">
            Filter results by specific language.
          </p>
        </div>

        <!-- Search Sensitivity -->
        <div class="space-y-3">
          <Label class="text-sm font-medium">
            Search Sensitivity: {{ Math.round((1 - searchThreshold) * 100) }}%
          </Label>
          <div>
            <Slider
              :model-value="[searchThreshold]"
              :min="0"
              :max="0.8"
              :step="0.1"
              class="w-full"
              @update:model-value="handleThresholdSliderChange"
            />
            <div class="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Exact</span>
              <span>Fuzzy</span>
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            Adjust how strict the search matching should be.
          </p>
        </div>

        <!-- Max Results -->
        <div class="space-y-3">
          <Label class="text-sm font-medium">
            Max Results: {{ maxResults }}
          </Label>
          <div>
            <Slider
              :model-value="[maxResults]"
              :min="10"
              :max="500"
              :step="10"
              class="w-full"
              @update:model-value="handleMaxResultsSliderChange"
            />
            <div class="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10</span>
              <span>500</span>
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            Limit the number of search results displayed.
          </p>
        </div>

        <!-- Search Results Summary -->
        <div v-if="hasQuery" class="space-y-3">
          <Label class="text-sm font-medium">Search Results</Label>
          <div class="p-3 bg-muted rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Badge v-if="hasResults" variant="secondary">
                  {{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }}
                </Badge>
                <Badge v-else variant="outline">
                  No results
                </Badge>

                <span v-if="selectedLanguage" class="text-xs text-muted-foreground">
                  in {{ selectedLanguage }}
                </span>
              </div>

              <Button
                v-if="hasResults"
                variant="outline"
                size="sm"
                @click="exportResults"
                class="text-xs"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </Button>
            </div>
          </div>
        </div>

        <!-- Quick Suggestions -->
        <div v-if="suggestions.length > 0 && hasQuery && !hasResults" class="space-y-3">
          <Label class="text-sm font-medium">Suggestions</Label>
          <div class="flex flex-wrap gap-2">
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
          <p class="text-xs text-muted-foreground">
            Try these alternative search terms.
          </p>
        </div>
      </div>

      <SheetFooter>
        <div class="flex items-center justify-between w-full">
          <Button
            variant="outline"
            @click="clearSearch"
            :disabled="!hasQuery"
          >
            Clear Search
          </Button>

          <div class="flex space-x-2">
            <Button
              variant="outline"
              @click="refreshSearch"
              :disabled="!hasQuery || isSearching"
            >
              <svg
                v-if="isSearching"
                class="w-4 h-4 mr-2 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ isSearching ? 'Searching...' : 'Refresh' }}
            </Button>

            <SheetClose as-child>
              <Button>Done</Button>
            </SheetClose>
          </div>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import SearchScopeSelector from './SearchScopeSelector.vue'
import type { SearchResult } from '@/types'

interface SearchStats {
  totalItems: number
  languages: string[]
  averageKeyLength: number
  averageValueLength: number
}

interface Props {
  searchResults: SearchResult[]
  isSearching: boolean
  searchStats: SearchStats
  availableLanguages: string[]
  selectedLanguage: string
  searchMode: 'all' | 'keys' | 'values'
  searchThreshold: number
  maxResults: number
  suggestions: string[]
  hasQuery: boolean
  hasResults: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:selectedLanguage': [value: string]
  'update:searchMode': [value: 'all' | 'keys' | 'values']
  'update:searchThreshold': [value: number]
  'update:maxResults': [value: number]
  'search': []
  'clear': []
  'export': [format: 'json' | 'csv']
  'apply-suggestion': [suggestion: string]
}>()

const isOpen = ref(false)

const searchMode = computed({
  get: () => props.searchMode,
  set: (value) => emit('update:searchMode', value)
})

const selectedLanguage = computed({
  get: () => props.selectedLanguage,
  set: (value) => emit('update:selectedLanguage', value)
})

const searchThreshold = computed({
  get: () => props.searchThreshold,
  set: (value) => emit('update:searchThreshold', value)
})

const maxResults = computed({
  get: () => props.maxResults,
  set: (value) => emit('update:maxResults', value)
})

function handleScopeChange(scope: 'all' | 'keys' | 'values') {
  emit('update:searchMode', scope)
}

function handleLanguageChange(value: string | number | bigint | Record<string, unknown> | null | undefined) {
  const language = typeof value === 'string' ? value : ''
  emit('update:selectedLanguage', language)
}

function handleThresholdSliderChange(value: number[] | undefined) {
  if (value && value[0] !== undefined) {
    searchThreshold.value = value[0]
    // Debounce threshold changes
    setTimeout(() => {
      if (props.hasQuery) {
        emit('search')
      }
    }, 300)
  }
}

function handleMaxResultsSliderChange(value: number[] | undefined) {
  if (value && value[0] !== undefined) {
    maxResults.value = value[0]
  }
}

function refreshSearch() {
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


