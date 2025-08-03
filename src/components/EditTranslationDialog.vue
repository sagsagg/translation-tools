<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Translation</DialogTitle>
        <DialogDescription>
          Make changes to the translation key and value. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="key">Translation Key</Label>
          <Input
            id="key"
            v-model="formData.key"
            placeholder="e.g., app.welcome.title"
            :class="{ 'border-red-500': errors.key }"
            @blur="validateKey"
          />
          <p v-if="errors.key" class="text-sm text-red-500">{{ errors.key }}</p>
        </div>

        <div class="space-y-2">
          <Label for="value">Translation Value</Label>
          <Textarea
            id="value"
            v-model="formData.value"
            placeholder="Enter the translation text"
            rows="3"
            :class="{ 'border-red-500': errors.value }"
            @blur="validateValue"
          />
          <p v-if="errors.value" class="text-sm text-red-500">{{ errors.value }}</p>
        </div>

        <div v-if="language" class="space-y-2">
          <Label>Language</Label>
          <div class="flex items-center space-x-2">
            <Badge variant="outline">{{ language }}</Badge>
            <span class="text-sm text-gray-500">This translation is for {{ language }}</span>
          </div>
        </div>

        <div v-if="hasChanges" class="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div class="flex items-start space-x-2">
            <svg class="w-4 h-4 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div class="text-sm">
              <p class="font-medium text-blue-800 dark:text-blue-200">Changes detected</p>
              <p class="text-blue-600 dark:text-blue-300">Your changes will be applied to all views and data sources.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="!isValid || !hasChanges || isSubmitting"
          >
            <svg
              v-if="isSubmitting"
              class="w-4 h-4 mr-2 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface Props {
  open: boolean
  originalKey: string
  originalValue: string
  language?: string
}

interface EditTranslationData {
  originalKey: string
  originalValue: string
  newKey: string
  newValue: string
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: undefined
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [data: EditTranslationData]
  'cancel': []
}>()

const formData = ref({
  key: '',
  value: ''
})

const errors = ref({
  key: '',
  value: ''
})

const isSubmitting = ref(false)

const hasChanges = computed(() => {
  return formData.value.key !== props.originalKey || 
         formData.value.value !== props.originalValue
})

const isValid = computed(() => {
  return formData.value.key.trim() !== '' && 
         formData.value.value.trim() !== '' &&
         !errors.value.key && 
         !errors.value.value
})

// Watch for prop changes to reset form
watch(() => [props.originalKey, props.originalValue], () => {
  resetForm()
}, { immediate: true })

function resetForm() {
  formData.value = {
    key: props.originalKey,
    value: props.originalValue
  }
  errors.value = {
    key: '',
    value: ''
  }
  isSubmitting.value = false
}

function validateKey() {
  errors.value.key = ''
  
  if (!formData.value.key.trim()) {
    errors.value.key = 'Translation key is required'
    return false
  }
  
  if (formData.value.key.length < 2) {
    errors.value.key = 'Translation key must be at least 2 characters'
    return false
  }
  
  if (!/^[a-zA-Z0-9._-]+$/.test(formData.value.key)) {
    errors.value.key = 'Translation key can only contain letters, numbers, dots, underscores, and hyphens'
    return false
  }
  
  return true
}

function validateValue() {
  errors.value.value = ''
  
  if (!formData.value.value.trim()) {
    errors.value.value = 'Translation value is required'
    return false
  }
  
  if (formData.value.value.length > 1000) {
    errors.value.value = 'Translation value must be less than 1000 characters'
    return false
  }
  
  return true
}

function validateForm(): boolean {
  const keyValid = validateKey()
  const valueValid = validateValue()
  return keyValid && valueValid
}

async function handleSubmit() {
  if (!validateForm() || !hasChanges.value) {
    return
  }

  isSubmitting.value = true

  try {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500))

    const editData: EditTranslationData = {
      originalKey: props.originalKey,
      originalValue: props.originalValue,
      newKey: formData.value.key.trim(),
      newValue: formData.value.value.trim(),
      language: props.language
    }

    emit('save', editData)
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  resetForm()
  emit('cancel')
  emit('update:open', false)
}
</script>
