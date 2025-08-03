<template>
  <div class="space-y-4">
    <!-- Format Selection -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-foreground">Input Format</label>
      <RadioGroup
        :model-value="format"
        @update:model-value="handleFormatChange"
        class="flex items-center space-x-6"
      >
        <div class="flex items-center space-x-2">
          <RadioGroupItem
            id="format-json"
            value="json"
            :checked="format === 'json'"
          />
          <label for="format-json" class="text-sm font-medium text-foreground cursor-pointer select-none">
            JSON
          </label>
        </div>
        <div class="flex items-center space-x-2">
          <RadioGroupItem
            id="format-csv"
            value="csv"
            :checked="format === 'csv'"
          />
          <label for="format-csv" class="text-sm font-medium text-foreground cursor-pointer select-none">
            CSV
          </label>
        </div>
      </RadioGroup>
      <p class="text-xs text-muted-foreground">
        {{ getFormatDescription(format) }}
      </p>
    </div>

    <!-- Text Input Area -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label for="text-input" class="text-sm font-medium text-foreground">
          Translation Content
        </label>
        <div class="flex items-center space-x-2">
          <Button
            v-if="hasContent"
            variant="ghost"
            size="sm"
            @click="clearContent"
            class="text-xs"
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            @click="insertExample"
            class="text-xs"
          >
            Insert Example
          </Button>
        </div>
      </div>

      <Textarea
        id="text-input"
        v-model="content"
        :placeholder="getPlaceholderText(format)"
        class="min-h-[200px] font-mono text-sm"
        :class="{
          'border-red-500 focus:border-red-500': validationErrors.length > 0,
          'border-green-500 focus:border-green-500': isValid && hasContent
        }"
      />
    </div>

    <!-- Validation Feedback -->
    <div v-if="hasContent" class="space-y-2">
      <!-- Validation Errors -->
      <div v-if="validationErrors.length > 0" class="space-y-1">
        <div
          v-for="error in validationErrors"
          :key="error.message"
          class="flex items-start space-x-2 text-sm text-red-600 dark:text-red-400"
        >
          <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error.message }}</span>
        </div>
      </div>

      <!-- Validation Warnings -->
      <div v-if="validationWarnings.length > 0" class="space-y-1">
        <div
          v-for="warning in validationWarnings"
          :key="warning.message"
          class="flex items-start space-x-2 text-sm text-yellow-600 dark:text-yellow-400"
        >
          <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>{{ warning.message }}</span>
        </div>
      </div>

      <!-- Success Indicator -->
      <div v-if="isValid" class="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Content is valid and ready to process</span>
      </div>
    </div>

    <!-- Process Button -->
    <div class="flex justify-end">
      <Button
        @click="handleProcess"
        :disabled="!canProcess"
        :class="{ 'opacity-50 cursor-not-allowed': !canProcess }"
      >
        <svg
          v-if="isProcessing"
          class="w-4 h-4 mr-2 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Process Content</span>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTextInput } from '@/composables/useTextInput'
import type { TextInputFormat, TextInputResult } from '@/types'

// Emits
const emit = defineEmits<{
  'process': [result: TextInputResult]
}>()

// Use text input composable
const {
  content,
  format,
  isProcessing,
  hasContent,
  isValid,
  validationErrors,
  validationWarnings,
  canProcess,
  setContent,
  setFormat,
  clearContent,
  processContent,
  getExampleContent,
  getFormatDescription,
  getPlaceholderText
} = useTextInput()

// Event handlers
function handleFormatChange(value: string) {
  setFormat(value as TextInputFormat)
}

function insertExample() {
  const example = getExampleContent(format.value)
  setContent(example)
}

async function handleProcess() {
  const result = await processContent()
  emit('process', result)
}
</script>

<style scoped>
/* Custom styles for better textarea appearance */
.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
