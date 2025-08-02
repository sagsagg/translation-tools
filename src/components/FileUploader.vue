<template>
  <div class="w-full">
    <div
      class="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 transition-colors duration-200"
      :class="{
        'border-blue-400 bg-blue-50 dark:bg-blue-950': isDragOver,
        'border-green-400 bg-green-50 dark:bg-green-950': uploadSuccess,
        'border-red-400 bg-red-50 dark:bg-red-950': uploadError
      }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedFormats.join(',')"
        :multiple="multiple"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        @change="handleFileSelect"
      />

      <div class="text-center">
        <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
          <svg
            class="h-12 w-12"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div v-if="isUploading" class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
          <Progress :value="uploadProgress" class="w-full" />
        </div>

        <div v-else-if="uploadSuccess" class="space-y-2">
          <p class="text-sm text-green-600">
            File uploaded successfully!
          </p>
          <Button variant="outline" size="sm" @click="resetUpload">
            Upload Another
          </Button>
        </div>

        <div v-else-if="uploadError" class="space-y-2">
          <p class="text-sm text-destructive">
            {{ errorMessage }}
          </p>
          <Button variant="outline" size="sm" @click="resetUpload">
            Try Again
          </Button>
        </div>

        <div v-else class="space-y-3">
          <p class="text-lg font-medium text-gray-900 dark:text-gray-100">
            Drop files here or click to browse
          </p>
          <div class="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Supports</span>
            <Badge v-for="format in acceptedFormats" :key="format" variant="secondary" class="text-xs">
              {{ format }}
            </Badge>
            <span>up to {{ formatFileSize(maxFileSize) }}</span>
          </div>

          <!-- Multiple JSON Upload Info -->
          <div class="text-xs text-center space-y-1">
            <p class="text-blue-600 dark:text-blue-400">
              💡 <strong>Multiple JSON files:</strong> Select multiple JSON files with proper naming
            </p>
            <p class="text-orange-600 dark:text-orange-400">
              ⚠️ <strong>CSV files:</strong> Only one CSV file allowed per upload
            </p>
          </div>

          <div class="flex justify-center gap-2">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" @click="triggerFileSelect">
                  Choose Files
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select JSON or CSV translation files</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="ghost" size="sm" @click="showNamingHelp">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Naming Help
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View JSON filename requirements</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- File validation feedback -->
    <div v-if="validationResults.length > 0" class="mt-4 space-y-2">
      <Alert
        v-for="(result, index) in validationResults"
        :key="index"
        :variant="result.type"
      >
        <AlertTitle>{{ result.title }}</AlertTitle>
        <AlertDescription>{{ result.message }}</AlertDescription>
      </Alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useFileUpload } from '@/composables/useFileUpload'
import { formatFileSize } from '@/utils'
import type { FileUploadResult } from '@/types'

interface Props {
  multiple?: boolean
  onUpload?: (result: FileUploadResult | FileUploadResult[]) => void
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false
})

const emit = defineEmits<{
  upload: [result: FileUploadResult | FileUploadResult[]]
  error: [error: string]
  success: [result: FileUploadResult | FileUploadResult[]]
  'show-naming-help': []
}>()

const {
  isUploading,
  uploadProgress,
  lastUploadResult,
  acceptedFormats,
  maxFileSize,
  uploadFile,
  uploadFiles,
  uploadMultipleJSONFiles,
  validateFileBeforeUpload,
  resetUploadState
} = useFileUpload()

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const validationResults = ref<Array<{ type: 'default' | 'destructive'; title: string; message: string }>>([])

const uploadSuccess = computed(() => lastUploadResult.value?.success === true)
const uploadError = computed(() => lastUploadResult.value?.success === false)
const errorMessage = computed(() => {
  const result = lastUploadResult.value
  return (result && !result.success) ? result.error : 'Upload failed'
})

function triggerFileSelect() {
  fileInput.value?.click()
}

function showNamingHelp() {
  // This will trigger the SupportedLanguagesDialog to open
  // We'll emit an event that the parent can listen to
  emit('show-naming-help')
}

function handleDragOver() {
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

async function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files) {
    await processFiles(files)
  }
}

async function handleFileSelect(event: Event) {
  const target = event.target
  if (target instanceof HTMLInputElement && target.files) {
    await processFiles(target.files)
  }
}

async function processFiles(files: FileList) {
  validationResults.value = []

  // Convert FileList to Array for easier processing
  const fileArray = Array.from(files)

  // Check for mixed file types (CSV + JSON)
  const csvFiles = fileArray.filter(file => file.name.toLowerCase().endsWith('.csv'))
  const jsonFiles = fileArray.filter(file => file.name.toLowerCase().endsWith('.json'))

  if (csvFiles.length > 0 && jsonFiles.length > 0) {
    validationResults.value.push({
      type: 'destructive',
      title: 'Mixed File Types',
      message: 'Cannot upload CSV and JSON files together. Please upload them separately.'
    })
    return
  }

  if (csvFiles.length > 1) {
    validationResults.value.push({
      type: 'destructive',
      title: 'Multiple CSV Files',
      message: 'Only one CSV file is allowed per upload.'
    })
    return
  }

  // Validate files before upload
  const validFiles: File[] = []
  for (const file of fileArray) {
    const validation = validateFileBeforeUpload(file)

    if (validation.valid) {
      validFiles.push(file)
    } else {
      validationResults.value.push({
        type: 'destructive',
        title: 'Invalid File',
        message: validation.error || 'File validation failed'
      })
    }
  }

  if (validFiles.length === 0) {
    return
  }

  try {
    let result: FileUploadResult | FileUploadResult[]

    // Handle multiple JSON files or single file upload
    if (validFiles.length > 1 && jsonFiles.length > 0) {
      // Multiple JSON files - use the new uploadMultipleJSONFiles method
      const multipleResult = await uploadMultipleJSONFiles(validFiles)
      result = multipleResult.files // Extract the FileUploadResult array
    } else if (props.multiple && validFiles.length > 1) {
      // Multiple files (legacy support)
      const fileList = new DataTransfer()
      validFiles.forEach(file => fileList.items.add(file))
      result = await uploadFiles(fileList.files)
    } else {
      // Single file upload
      result = await uploadFile(validFiles[0])
    }

    emit('upload', result)
    emit('success', result)
    props.onUpload?.(result)

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Upload failed'
    emit('error', errorMsg)
    validationResults.value.push({
      type: 'destructive',
      title: 'Upload Error',
      message: errorMsg
    })
  }
}

function resetUpload() {
  resetUploadState()
  validationResults.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Watch for upload results to show validation feedback
watch(lastUploadResult, (result) => {
  if (result && !result.success) {
    validationResults.value = [{
      type: 'destructive',
      title: 'Upload Failed',
      message: result.error || 'Unknown error occurred'
    }]
  }
})
</script>
