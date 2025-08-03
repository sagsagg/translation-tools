<template>
  <div v-if="files.length > 0" class="mt-4 space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
        Uploaded Files ({{ files.length }})
      </h3>
      <Button
        v-if="files.length > 1"
        variant="outline"
        size="sm"
        @click="$emit('clear-all')"
        class="text-xs"
      >
        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear All
      </Button>
    </div>

    <div class="space-y-2 max-h-48 overflow-y-auto">
      <Card
        v-for="file in files"
        :key="file.id"
        class="p-3 hover:bg-muted/50 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 min-w-0 flex-1">
            <!-- File Icon -->
            <div class="flex-shrink-0">
              <svg
                v-if="file.format === 'json'"
                class="w-5 h-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
              </svg>
            </div>

            <!-- File Info -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center space-x-2">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {{ file.name }}
                </p>
                <Badge
                  :variant="file.format === 'json' ? 'default' : 'secondary'"
                  class="text-xs"
                >
                  {{ file.format.toUpperCase() }}
                </Badge>
                <Badge
                  v-if="file.languageCode"
                  variant="outline"
                  class="text-xs"
                >
                  {{ file.languageCode }}
                </Badge>
              </div>
              <div class="flex items-center space-x-2 mt-1">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatFileSize(file.size) }}
                </p>
                <span class="text-xs text-gray-400">•</span>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatUploadTime(file.uploadedAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-1 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('view-file', file)"
                  class="h-8 w-8 p-0"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View file details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('remove-file', file.id)"
                  class="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove file</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatFileSize } from '@/utils'
import type { UploadedFile } from '@/types'

interface Props {
  files: UploadedFile[]
}

defineProps<Props>()

defineEmits<{
  'remove-file': [fileId: string]
  'view-file': [file: UploadedFile]
  'clear-all': []
}>()

function formatUploadTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60)
    return `${hours}h ago`
  } else {
    return date.toLocaleDateString()
  }
}
</script>
