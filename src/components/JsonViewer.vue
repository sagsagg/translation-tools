<template>
  <div class="w-full">
    <!-- Controls -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium">Search:</label>
          <Input
            v-model="localSearchQuery"
            type="text"
            placeholder="Search keys or values..."
            class="w-64"
          />
        </div>

        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium">View:</label>
          <Select v-model="viewMode">
            <SelectTrigger class="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formatted">Formatted</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="tree">Tree View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              size="sm"
              @click="copyToClipboard"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy JSON to clipboard</p>
          </TooltipContent>
        </Tooltip>

        <Badge variant="secondary" class="text-xs">
          {{ filteredEntries.length }} of {{ totalEntries }} entries
        </Badge>
      </div>
    </div>

    <!-- JSON Content -->
    <div class="border rounded-lg overflow-hidden">
      <!-- Tree View -->
      <div v-if="viewMode === 'tree'" class="p-4 bg-gray-50 dark:bg-gray-900">
        <div class="space-y-1">
          <div
            v-for="[key, value] in filteredEntries"
            :key="key"
            class="flex items-start space-x-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2"
            :class="{ 'bg-yellow-100 dark:bg-yellow-900': isHighlighted(key, value) }"
          >
            <div class="flex-shrink-0 w-4 h-4 mt-0.5">
              <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM2 15a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start space-x-2">
                <span
                  class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 flex-shrink-0"
                  v-html="highlightText(key, localSearchQuery)"
                />
                <span class="text-gray-500">:</span>
                <span
                  class="text-sm text-gray-900 dark:text-gray-100 break-words"
                  v-html="highlightText(value, localSearchQuery)"
                />
              </div>
            </div>

            <div v-if="editable" class="flex-shrink-0">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="$emit('edit', key, value)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit translation</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <!-- Formatted/Compact View -->
      <div v-else class="relative">
        <pre
          class="p-4 text-sm font-mono overflow-auto max-h-96 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          v-html="formattedJson"
        />

        <div class="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            @click="toggleExpanded"
          >
            <svg
              class="w-4 h-4"
              :class="{ 'rotate-180': isExpanded }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="mt-4 text-sm text-gray-600 space-y-1">
      <div>Total keys: {{ totalEntries }}</div>
      <div v-if="localSearchQuery">Filtered: {{ filteredEntries.length }}</div>
      <div>Average key length: {{ averageKeyLength }}</div>
      <div>Average value length: {{ averageValueLength }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

import type { TranslationData, MultiLanguageTranslationData } from '@/types'
import { highlightText } from '@/utils'

interface Props {
  data: TranslationData | MultiLanguageTranslationData
  searchQuery?: string
  editable?: boolean
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  editable: false,
  maxHeight: '400px'
})

defineEmits<{
  edit: [key: string, value: string]
}>()

const localSearchQuery = ref(props.searchQuery)
const viewMode = ref<'formatted' | 'compact' | 'tree'>('tree')
const isExpanded = ref(false)

const totalEntries = computed(() => Object.keys(props.data).length)

const filteredEntries = computed(() => {
  const entries = Object.entries(props.data)

  if (!localSearchQuery.value.trim()) {
    return entries
  }

  const query = localSearchQuery.value.toLowerCase()
  return entries.filter(([key, value]) => {
    // Check if key matches
    if (key.toLowerCase().includes(query)) {
      return true
    }

    // Handle both string values (single JSON) and object values (multi-language JSON)
    if (typeof value === 'string') {
      return value.toLowerCase().includes(query)
    } else if (typeof value === 'object' && value !== null) {
      // For nested objects, search within their string values
      return Object.values(value).some(nestedValue =>
        typeof nestedValue === 'string' && nestedValue.toLowerCase().includes(query)
      )
    }

    return false
  })
})

const averageKeyLength = computed(() => {
  const keys = Object.keys(props.data)
  if (keys.length === 0) return 0
  return Math.round(keys.reduce((sum, key) => sum + key.length, 0) / keys.length)
})

const averageValueLength = computed(() => {
  const values = Object.values(props.data)
  if (values.length === 0) return 0

  const totalLength = values.reduce((sum, value) => {
    if (typeof value === 'string') {
      return sum + value.length
    } else if (typeof value === 'object' && value !== null) {
      // For nested objects, calculate average length of their string values
      const nestedValues = Object.values(value).filter(v => typeof v === 'string')
      const nestedAverage = nestedValues.length > 0
        ? nestedValues.reduce((nestedSum, nestedValue) => nestedSum + (nestedValue as string).length, 0) / nestedValues.length
        : 0
      return sum + nestedAverage
    }
    return sum
  }, 0)

  return Math.round(totalLength / values.length)
})

const formattedJson = computed(() => {
  const filteredData = Object.fromEntries(filteredEntries.value)

  let jsonString: string
  if (viewMode.value === 'compact') {
    jsonString = JSON.stringify(filteredData)
  } else {
    jsonString = JSON.stringify(filteredData, null, 2)
  }

  // Apply syntax highlighting
  return syntaxHighlight(jsonString)
})

function syntaxHighlight(json: string): string {
  // Simple syntax highlighting for JSON
  return json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'text-gray-900 dark:text-gray-100'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-600 dark:text-blue-400 font-medium' // Keys
        } else {
          cls = 'text-green-600 dark:text-green-400' // String values
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-600 dark:text-purple-400' // Booleans
      } else if (/null/.test(match)) {
        cls = 'text-red-600 dark:text-red-400' // Null
      } else if (/\d/.test(match)) {
        cls = 'text-orange-600 dark:text-orange-400' // Numbers
      }
      return `<span class="${cls}">${match}</span>`
    })
    .replace(/\n/g, '<br>')
    .replace(/\s/g, '&nbsp;')
}

function isHighlighted(key: string, value: string): boolean {
  if (!localSearchQuery.value.trim()) return false

  const query = localSearchQuery.value.toLowerCase()
  return key.toLowerCase().includes(query) || value.toLowerCase().includes(query)
}

function toggleExpanded(): void {
  isExpanded.value = !isExpanded.value
}

async function copyToClipboard(): Promise<void> {
  try {
    const filteredData = Object.fromEntries(filteredEntries.value)
    const jsonString = JSON.stringify(filteredData, null, 2)
    await navigator.clipboard.writeText(jsonString)

    // You could add a toast notification here
    console.log('JSON copied to clipboard')
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

// Watch for external search query changes
watch(() => props.searchQuery, (newQuery) => {
  localSearchQuery.value = newQuery
})
</script>
