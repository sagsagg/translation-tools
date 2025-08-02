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
      <div v-if="viewMode === 'tree'" class="p-4 bg-white dark:bg-gray-900">
        <VueJsonPretty
          :data="filteredData"
          :show-length="true"
          :show-line="true"
          :show-icon="true"
          :show-double-quotes="true"
          :collapsed-node-length="10"
          :deep="3"
          :theme="isDarkMode ? 'dark' : 'light'"
          :height="400"
          :virtual="Object.keys(filteredData).length > 100"
          class="vue-json-pretty-custom"
        >
          <!-- Custom key rendering with search highlighting -->
          <template #renderNodeKey="{ node, defaultKey }">
            <span v-html="highlightSearchInText(String(defaultKey || node.key || ''), localSearchQuery)" />
          </template>

          <!-- Custom value rendering with search highlighting -->
          <template #renderNodeValue="{ node, defaultValue }">
            <span v-html="getHighlightedValue(node, defaultValue)" />
          </template>
        </VueJsonPretty>
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
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'


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

// Filtered data for vue-json-pretty
const filteredData = computed(() => {
  return Object.fromEntries(filteredEntries.value)
})



// Dark mode detection (simple approach)
const isDarkMode = computed(() => {
  return document.documentElement.classList.contains('dark')
})

const formattedJson = computed(() => {
  const data = filteredData.value

  let jsonString: string
  if (viewMode.value === 'compact') {
    jsonString = JSON.stringify(data)
  } else {
    jsonString = JSON.stringify(data, null, 2)
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

// Highlight search text within vue-json-pretty tree view
function highlightSearchInText(text: string, searchQuery: string): string {
  if (!searchQuery.trim()) {
    return text
  }

  const query = searchQuery.toLowerCase()
  const lowerText = text.toLowerCase()

  if (!lowerText.includes(query)) {
    return text
  }

  // Use the existing highlightText utility for consistent highlighting
  return highlightText(text, searchQuery)
}

// Get highlighted value for vue-json-pretty renderNodeValue slot
function getHighlightedValue(node: any, defaultValue: any): string {
  // If it's a string value, apply highlighting
  if (typeof node.value === 'string') {
    return highlightSearchInText(node.value, localSearchQuery.value)
  }

  // If defaultValue is a string, apply highlighting to it
  if (typeof defaultValue === 'string') {
    return highlightSearchInText(defaultValue, localSearchQuery.value)
  }

  // For non-string values, return the default rendering
  return String(defaultValue || node.value || '')
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

<style scoped>
.vue-json-pretty-custom {
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.dark .vue-json-pretty-custom {
  border-color: #374151;
}

/* Custom styling for vue-json-pretty */
:deep(.vjs-tree) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

:deep(.vjs-tree .vjs-tree__node) {
  padding: 2px 0;
}

:deep(.vjs-tree .vjs-tree__node:hover) {
  background-color: rgba(59, 130, 246, 0.1);
}

:deep(.vjs-tree .vjs-key) {
  color: #1e40af;
  font-weight: 600;
}

:deep(.vjs-tree .vjs-value__string) {
  color: #059669;
}

:deep(.vjs-tree .vjs-value__number) {
  color: #dc2626;
}

:deep(.vjs-tree .vjs-value__boolean) {
  color: #7c3aed;
}

:deep(.vjs-tree .vjs-value__null) {
  color: #6b7280;
}

/* Dark mode styles */
.dark :deep(.vjs-tree .vjs-key) {
  color: #60a5fa;
}

.dark :deep(.vjs-tree .vjs-value__string) {
  color: #34d399;
}

.dark :deep(.vjs-tree .vjs-value__number) {
  color: #f87171;
}

.dark :deep(.vjs-tree .vjs-value__boolean) {
  color: #a78bfa;
}

.dark :deep(.vjs-tree .vjs-value__null) {
  color: #9ca3af;
}

.dark :deep(.vjs-tree .vjs-tree__node:hover) {
  background-color: rgba(59, 130, 246, 0.2);
}

/* Search highlighting styles for tree view */
:deep(.vjs-tree .highlight) {
  background-color: #fef08a;
  color: #92400e;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 600;
}

.dark :deep(.vjs-tree .highlight) {
  background-color: #fbbf24;
  color: #92400e;
}

/* Enhanced tree view search highlighting */
:deep(.vjs-tree .vjs-key .highlight) {
  background-color: #dbeafe;
  color: #1e40af;
}

.dark :deep(.vjs-tree .vjs-key .highlight) {
  background-color: #1e3a8a;
  color: #93c5fd;
}

:deep(.vjs-tree .vjs-value__string .highlight) {
  background-color: #d1fae5;
  color: #065f46;
}

.dark :deep(.vjs-tree .vjs-value__string .highlight) {
  background-color: #064e3b;
  color: #6ee7b7;
}
</style>
