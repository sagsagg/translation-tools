<template>
  <div
    v-if="visible"
    class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out"
    :class="{
      'translate-x-0 opacity-100': visible,
      'translate-x-full opacity-0': !visible
    }"
  >
    <div class="p-4">
      <div class="flex items-start">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-green-500" />
          <XCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-500" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5 text-yellow-500" />
          <Info v-else class="w-5 h-5 text-blue-500" />
        </div>

        <!-- Content -->
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
            {{ toast.title }}
          </p>
          <p v-if="toast.message" class="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close button -->
        <div class="ml-4 flex-shrink-0">
          <button
            @click="$emit('close')"
            class="inline-flex text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import type { Toast } from '@/composables/useToast'

interface Props {
  toast: Toast
}

defineProps<Props>()

defineEmits<{
  close: []
}>()

const visible = ref(false)

onMounted(() => {
  // Trigger animation after mount
  setTimeout(() => {
    visible.value = true
  }, 10)
})
</script>

<style scoped>
/* Additional animations for smooth transitions */
.transform {
  transform-origin: top right;
}
</style>
