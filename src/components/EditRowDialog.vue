<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Translation Row</DialogTitle>
        <DialogDescription>
          Edit the translation key and all language values for this entry.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Primary Key Field -->
        <div class="space-y-2">
          <Label for="key" class="text-sm font-semibold text-primary">
            Translation Key *
          </Label>
          <Textarea
            id="key"
            v-model="formData.key"
            placeholder="Enter translation key..."
            class="min-h-[60px] font-mono text-sm"
            :class="{
              'border-red-500 focus:border-red-500': errors.key
            }"
            @blur="validateKey"
          />
          <p v-if="errors.key" class="text-sm text-red-600">
            {{ errors.key }}
          </p>
        </div>

        <!-- Dynamic Language Fields -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
            Language Translations
          </h3>
          
          <div 
            v-for="language in allLanguages" 
            :key="language"
            class="space-y-2"
          >
            <Label :for="`lang-${language}`" class="text-sm font-medium">
              {{ language }}
              <span v-if="language === 'English'" class="text-red-500">*</span>
            </Label>
            <Textarea
              :id="`lang-${language}`"
              v-model="formData.languages[language]"
              :placeholder="`Enter ${language} translation...`"
              class="min-h-[60px]"
              :class="{
                'border-red-500 focus:border-red-500': errors.languages[language]
              }"
              @blur="validateLanguage(language)"
            />
            <p v-if="errors.languages[language]" class="text-sm text-red-600">
              {{ errors.languages[language] }}
            </p>
          </div>
        </div>

        <!-- Form Actions -->
        <DialogFooter class="flex justify-between items-center pt-4 border-t">
          <div class="text-xs text-gray-500">
            * Required fields
          </div>
          <div class="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              @click="handleCancel"
              :disabled="isSubmitting"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              :disabled="!isValid || !hasChanges || isSubmitting"
              class="min-w-[80px]"
            >
              <span v-if="isSubmitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
              <span v-else>Save Changes</span>
            </Button>
          </div>
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { CSVRow } from '@/types'

interface Props {
  open: boolean
  originalRow: CSVRow
  allLanguages: string[]
}

interface EditRowData {
  originalKey: string
  newKey: string
  originalLanguages: Record<string, string>
  newLanguages: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  allLanguages: () => []
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [data: EditRowData]
  'cancel': []
}>()

const formData = ref({
  key: '',
  languages: {} as Record<string, string>
})

const errors = ref({
  key: '',
  languages: {} as Record<string, string>
})

const isSubmitting = ref(false)

const hasChanges = computed(() => {
  const originalKey = props.originalRow.Key || ''
  const keyChanged = formData.value.key !== originalKey
  
  const languagesChanged = props.allLanguages.some(lang => {
    const originalValue = props.originalRow[lang] || ''
    const newValue = formData.value.languages[lang] || ''
    return originalValue !== newValue
  })
  
  return keyChanged || languagesChanged
})

const isValid = computed(() => {
  // Key is required
  if (!formData.value.key.trim()) {
    return false
  }
  
  // English is required (if it exists in languages)
  if (props.allLanguages.includes('English') && !formData.value.languages['English']?.trim()) {
    return false
  }
  
  // No validation errors
  if (errors.value.key) {
    return false
  }
  
  if (Object.values(errors.value.languages).some(error => error)) {
    return false
  }
  
  return true
})

// Watch for prop changes to reset form
watch(() => [props.originalRow, props.allLanguages], () => {
  resetForm()
}, { immediate: true, deep: true })

function resetForm() {
  formData.value.key = props.originalRow.Key || ''
  
  // Initialize all language fields
  formData.value.languages = {}
  props.allLanguages.forEach(lang => {
    formData.value.languages[lang] = props.originalRow[lang] || ''
  })
  
  // Clear errors
  errors.value.key = ''
  errors.value.languages = {}
}

function validateKey() {
  errors.value.key = ''
  
  if (!formData.value.key.trim()) {
    errors.value.key = 'Translation key is required'
    return false
  }
  
  if (formData.value.key.trim().length < 2) {
    errors.value.key = 'Translation key must be at least 2 characters'
    return false
  }
  
  return true
}

function validateLanguage(language: string) {
  errors.value.languages[language] = ''
  
  // English is required
  if (language === 'English' && !formData.value.languages[language]?.trim()) {
    errors.value.languages[language] = 'English translation is required'
    return false
  }
  
  return true
}

function validateForm(): boolean {
  let isValid = true
  
  if (!validateKey()) {
    isValid = false
  }
  
  props.allLanguages.forEach(lang => {
    if (!validateLanguage(lang)) {
      isValid = false
    }
  })
  
  return isValid
}

async function handleSubmit() {
  if (!validateForm() || !hasChanges.value) {
    return
  }

  isSubmitting.value = true

  try {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500))

    const editData: EditRowData = {
      originalKey: props.originalRow.Key || '',
      newKey: formData.value.key.trim(),
      originalLanguages: {},
      newLanguages: {}
    }

    // Collect original and new language values
    props.allLanguages.forEach(lang => {
      editData.originalLanguages[lang] = props.originalRow[lang] || ''
      editData.newLanguages[lang] = formData.value.languages[lang]?.trim() || ''
    })

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
