<template>
  <div class="w-full">
    <!-- Table Controls -->
    <div class="flex flex-col space-y-4 mb-4">
      <!-- Top Row: Language Management -->
      <div v-if="allowLanguageManagement" class="flex items-center justify-between">
        <LanguageColumnManager
          :current-languages="currentLanguages"
          @add-language="handleAddLanguage"
          @remove-language="handleRemoveLanguage"
        />
        <div class="text-xs text-slate-500 dark:text-slate-400">
          {{ currentLanguages.length }} language{{ currentLanguages.length !== 1 ? 's' : '' }} active
        </div>
      </div>

      <!-- Bottom Row: Standard Controls -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium">Show:</label>
            <Select v-model="pageSize">
              <SelectTrigger class="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="10">10</SelectItem>
                <SelectItem :value="25">25</SelectItem>
                <SelectItem :value="50">50</SelectItem>
                <SelectItem :value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span class="text-sm text-gray-600">entries</span>
          </div>

          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium">Search:</label>
            <div class="flex items-center">
              <Input
                v-model="localSearchQuery"
                type="text"
                placeholder="Search in table..."
                class="w-64"
              />
              <slot name="advanced-search" />
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
          </span>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="border rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <Table class="table-fixed data-table">
          <TableHeader>
            <TableRow>
              <TableHead
                v-for="header in headers"
                :key="header"
                class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 whitespace-normal"
                :class="{
                  'w-48 min-w-48 max-w-48': header.toLowerCase() === 'key',
                  'w-64 min-w-64 max-w-64': header.toLowerCase() !== 'key'
                }"
                @click="handleSort(header)"
              >
                <div class="flex items-center space-x-1">
                  <span>{{ header }}</span>
                  <div class="flex flex-col">
                    <svg
                      class="w-3 h-3"
                      :class="{
                        'text-blue-600': sortColumn === header && sortDirection === 'asc',
                        'text-gray-400': !(sortColumn === header && sortDirection === 'asc')
                      }"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
                    </svg>
                    <svg
                      class="w-3 h-3"
                      :class="{
                        'text-blue-600': sortColumn === header && sortDirection === 'desc',
                        'text-gray-400': !(sortColumn === header && sortDirection === 'desc')
                      }"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </TableHead>
              <TableHead v-if="showActions" class="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="(row, index) in paginatedData"
              v-memo="[row, showActions, localSearchQuery]"
              :key="index"
              class="hover:bg-muted/50"
            >
              <TableCell
                v-for="header in headers"
                :key="`${index}-${header}`"
                :class="{
                  'w-48 min-w-48 max-w-48': header.toLowerCase() === 'key',
                  'w-64 min-w-64 max-w-64': header.toLowerCase() !== 'key'
                }"
              >
                <div
                  v-if="header.toLowerCase() === 'key'"
                  class="font-mono text-sm font-medium text-primary table-cell-content"
                >
                  <div class="flex items-center gap-2">
                    <span
                      v-html="highlightText(row[header] || '', localSearchQuery)"
                    />
                    <Badge
                      v-if="hasRowPluralTranslations(row)"
                      variant="secondary"
                      class="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
                    >
                      Plural
                    </Badge>
                  </div>
                </div>
                <div
                  v-else
                  class="text-sm table-cell-content"
                  :class="{
                    'text-gray-500 italic': !row[header] || row[header].trim() === '',
                    'text-gray-900 dark:text-gray-100': row[header] && row[header].trim() !== ''
                  }"
                >
                  <span
                    v-if="row[header] && row[header].trim() !== ''"
                    v-html="highlightText(row[header], localSearchQuery)"
                  />
                  <span
                    v-else
                    class="text-slate-400 dark:text-slate-500 italic text-xs"
                    :title="`Add translation for ${header}`"
                  >
                    Empty
                  </span>
                </div>
              </TableCell>
              <TableCell v-if="showActions">
                <!-- Isolate each row's tooltips with their own provider to prevent recursive updates -->
                <div class="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="$emit('edit-row', row, index)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="delete-button"
                      @click="$emit('delete-row', row, index)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-4">
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          Previous
        </Button>

        <div class="flex items-center space-x-1">
          <Button
            v-for="page in visiblePages"
            :key="page"
            :variant="page === currentPage ? 'default' : 'outline'"
            size="sm"
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </Button>
      </div>

      <div class="text-sm text-gray-600">
        Page {{ currentPage }} of {{ totalPages }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { CSVData, CSVRow, SortDirection, Language } from '@/types'
import { highlightText } from '@/utils'
import { hasAnyPluralTranslation } from '@/utils/pluralTranslations'

interface Props {
  data: CSVData
  searchQuery?: string
  showActions?: boolean
  allowLanguageManagement?: boolean
  currentLanguages?: Language[]
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  showActions: false,
  allowLanguageManagement: false,
  currentLanguages: () => []
})

const emit = defineEmits<{
  'edit-row': [row: CSVRow, index: number]
  'delete-row': [row: CSVRow, index: number]
  'sort': [column: string, direction: SortDirection]
  'add-language': [language: Language]
  'remove-language': [language: Language]
}>();

const LanguageColumnManager = defineAsyncComponent(() => import('@/components/LanguageColumnManager.vue'));

const localSearchQuery = ref(props.searchQuery)
const sortColumn = ref<string>('')
const sortDirection = ref<SortDirection>('asc')
const currentPage = ref(1)
const pageSize = ref(25)

const headers = computed(() => props.data.headers)

const filteredData = computed(() => {
  let filtered = [...props.data.rows]

  // Apply search filter
  if (localSearchQuery.value.trim()) {
    const query = localSearchQuery.value.toLowerCase()
    filtered = filtered.filter(row =>
      Object.values(row).some(value =>
        value?.toString().toLowerCase().includes(query)
      )
    )
  }

  // Apply sorting
  if (sortColumn.value) {
    filtered.sort((a, b) => {
      const aVal = a[sortColumn.value] || ''
      const bVal = b[sortColumn.value] || ''

      const comparison = aVal.localeCompare(bVal)
      return sortDirection.value === 'asc' ? comparison : -comparison
    })
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredData.value.length))

const paginatedData = computed(() => {
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Function to check if a row has any plural translations
function hasRowPluralTranslations(row: CSVRow): boolean {
  // Get all translation values (excluding the Key column)
  const translations: Record<string, string> = {}
  headers.value.forEach(header => {
    if (header.toLowerCase() !== 'key') {
      translations[header] = row[header] || ''
    }
  })

  return hasAnyPluralTranslation(translations)
}

function handleSort(column: string) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }

  emit('sort', column, sortDirection.value)
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Watch for external search query changes
watch(() => props.searchQuery, (newQuery) => {
  localSearchQuery.value = newQuery
}, { immediate: true })

// Reset to first page when search or page size changes
watch([localSearchQuery, pageSize], () => {
  currentPage.value = 1
})

// Language management handlers
function handleAddLanguage(language: Language) {
  emit('add-language', language)
}

function handleRemoveLanguage(language: Language) {
  emit('remove-language', language)
}
</script>
