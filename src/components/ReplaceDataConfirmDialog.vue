<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-lg">
          <AlertTriangle class="h-5 w-5 text-amber-500" />
          Replace Current Data?
        </DialogTitle>
        <DialogDescription class="text-base leading-relaxed">
          Uploading a new file will replace all current translation data. Any unsaved changes will be lost. Are you sure you want to continue?
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-3 pt-4">
        <!-- Don't ask again option -->
        <div v-if="showDontAskOption" class="flex items-center space-x-2">
          <Checkbox 
            id="dont-ask-again" 
            v-model:checked="dontAskAgain"
            class="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <label 
            for="dont-ask-again" 
            class="text-sm text-muted-foreground cursor-pointer"
          >
            Don't ask again for this session
          </label>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end gap-3">
          <DialogClose as-child>
            <Button 
              variant="outline" 
              @click="handleCancel"
              class="min-w-[80px]"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            @click="handleConfirm"
            class="min-w-[120px]"
          >
            Replace Data
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle } from 'lucide-vue-next'

interface Props {
  open?: boolean
  showDontAskOption?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  showDontAskOption: true
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': [dontAskAgain: boolean]
  'cancel': []
}>()

const isOpen = ref(props.open)
const dontAskAgain = ref(false)

// Watch for prop changes
watch(() => props.open, (newValue) => {
  isOpen.value = newValue
  // Reset don't ask again when dialog opens
  if (newValue) {
    dontAskAgain.value = false
  }
})

// Emit changes
watch(isOpen, (newValue) => {
  emit('update:open', newValue)
})

function handleConfirm() {
  emit('confirm', dontAskAgain.value)
  isOpen.value = false
}

function handleCancel() {
  emit('cancel')
  isOpen.value = false
}
</script>
