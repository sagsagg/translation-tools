<template>
  <div class="flex items-center space-x-2">
    <Label for="search-scope" class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
      Search in:
    </Label>

    <Select :model-value="selectedScope" @update:model-value="handleScopeChange">
      <SelectTrigger id="search-scope" class="w-[140px]">
        <SelectValue :placeholder="getScopeLabel(selectedScope)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Both Key & Value</span>
          </div>
        </SelectItem>
        <SelectItem value="keys">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.243-6.243A6 6 0 0121 9z" />
            </svg>
            <span>Keys Only</span>
          </div>
        </SelectItem>
        <SelectItem value="values">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Values Only</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>

    <!-- Search Statistics -->
    <div v-if="showStats && searchStats" class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
      <span>•</span>
      <span>{{ searchStats.totalItems }} items</span>
      <span v-if="searchStats.languages.length > 1">
        • {{ searchStats.languages.length }} languages
      </span>
    </div>

    <!-- Performance Indicator -->
    <div v-if="isSearching" class="flex items-center space-x-1 text-xs text-blue-500">
      <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>Searching...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type SearchScope = 'all' | 'keys' | 'values'

interface SearchStats {
  totalItems: number
  languages: string[]
  averageKeyLength: number
  averageValueLength: number
}

interface Props {
  modelValue: SearchScope
  searchStats?: SearchStats
  isSearching?: boolean
  showStats?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'all',
  searchStats: undefined,
  isSearching: false,
  showStats: true,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: SearchScope]
  'scope-change': [scope: SearchScope]
}>()

const selectedScope = ref<SearchScope>(props.modelValue)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  selectedScope.value = newValue
}, { immediate: true })

function handleScopeChange(value: string | number | bigint | Record<string, unknown> | null | undefined) {
  const newScope = value as SearchScope
  selectedScope.value = newScope
  emit('update:modelValue', newScope)
  emit('scope-change', newScope)
}

function getScopeLabel(scope: SearchScope): string {
  switch (scope) {
    case 'all':
      return 'Both Key & Value'
    case 'keys':
      return 'Keys Only'
    case 'values':
      return 'Values Only'
    default:
      return 'Both Key & Value'
  }
}

const scopeDescription = computed(() => {
  switch (selectedScope.value) {
    case 'all':
      return 'Search in both translation keys and values for comprehensive results'
    case 'keys':
      return 'Search only in translation keys for faster, targeted results'
    case 'values':
      return 'Search only in translation values to find specific text content'
    default:
      return ''
  }
})

const scopeIcon = computed(() => {
  switch (selectedScope.value) {
    case 'all':
      return 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
    case 'keys':
      return '15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.243-6.243A6 6 0 0121 9z'
    case 'values':
      return '9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    default:
      return 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
  }
})

const scopeColor = computed(() => {
  switch (selectedScope.value) {
    case 'all':
      return 'text-blue-500'
    case 'keys':
      return 'text-green-500'
    case 'values':
      return 'text-purple-500'
    default:
      return 'text-blue-500'
  }
})

// Performance metrics
const performanceHint = computed(() => {
  if (!props.searchStats) return ''

  const { totalItems } = props.searchStats

  if (totalItems > 1000) {
    switch (selectedScope.value) {
      case 'keys':
        return 'Faster search - keys only'
      case 'values':
        return 'Focused search - values only'
      case 'all':
        return 'Comprehensive search - may be slower'
      default:
        return ''
    }
  }

  return ''
})

defineExpose({
  scopeDescription,
  scopeIcon,
  scopeColor,
  performanceHint
})
</script>


