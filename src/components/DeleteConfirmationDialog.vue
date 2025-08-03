<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>Confirm Deletion</span>
        </DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete the translation entry.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Translation Details -->
        <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
          <div class="space-y-2">
            <div>
              <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Key</Label>
              <p class="text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border">
                {{ translationKey }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Value</Label>
              <p class="text-sm bg-white dark:bg-gray-800 p-2 rounded border max-h-20 overflow-y-auto">
                {{ translationValue }}
              </p>
            </div>
            <div v-if="language" class="flex items-center space-x-2">
              <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Language</Label>
              <Badge variant="outline">{{ language }}</Badge>
            </div>
          </div>
        </div>

        <!-- Warning Message -->
        <div class="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <div class="flex items-start space-x-2">
            <svg class="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div class="text-sm">
              <p class="font-medium text-red-800 dark:text-red-200">Permanent Action</p>
              <p class="text-red-600 dark:text-red-300">
                This translation will be removed from all data sources and cannot be recovered.
                {{ affectedViews.length > 0 ? `This will affect: ${affectedViews.join(', ')}.` : '' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Confirmation Input -->
        <div v-if="requireConfirmation" class="space-y-2">
          <Label for="confirmation">
            Type <strong>DELETE</strong> to confirm
          </Label>
          <Input
            id="confirmation"
            v-model="confirmationText"
            placeholder="Type DELETE to confirm"
            :class="{ 'border-red-500': confirmationText && !isConfirmationValid }"
          />
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
          type="button"
          variant="destructive"
          :disabled="requireConfirmation && !isConfirmationValid || isDeleting"
          @click="handleDelete"
        >
          <svg
            v-if="isDeleting"
            class="w-4 h-4 mr-2 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ isDeleting ? 'Deleting...' : 'Delete Translation' }}
        </Button>
      </DialogFooter>
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
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface Props {
  open: boolean
  translationKey: string
  translationValue: string
  language?: string
  requireConfirmation?: boolean
  affectedViews?: string[]
}

interface DeleteTranslationData {
  key: string
  value: string
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: undefined,
  requireConfirmation: true,
  affectedViews: () => ['Table View', 'JSON View']
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'delete': [data: DeleteTranslationData]
  'cancel': []
}>()

const confirmationText = ref('')
const isDeleting = ref(false)

const isConfirmationValid = computed(() => {
  return !props.requireConfirmation || confirmationText.value.trim().toLowerCase() === 'delete'
})

// Reset confirmation when dialog opens/closes
watch(() => props.open, (newValue) => {
  if (newValue) {
    confirmationText.value = ''
    isDeleting.value = false
  }
})

async function handleDelete() {
  if (props.requireConfirmation && !isConfirmationValid.value) {
    return
  }

  isDeleting.value = true

  try {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500))

    const deleteData: DeleteTranslationData = {
      key: props.translationKey,
      value: props.translationValue,
      language: props.language
    }

    emit('delete', deleteData)
  } finally {
    isDeleting.value = false
  }
}

function handleCancel() {
  confirmationText.value = ''
  isDeleting.value = false
  emit('cancel')
  emit('update:open', false)
}
</script>
