<template>
  <div class="space-y-8 p-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Skeleton Loading Components Demo
      </h2>
      <p class="text-slate-600 dark:text-slate-400">
        Preview of skeleton loading states for FileUploader and TextInput components
      </p>
    </div>

    <!-- FileUploader Skeleton Demo -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          FileUploader Skeleton
        </h3>
        <Button 
          @click="toggleFileUploaderSkeleton" 
          variant="outline" 
          size="sm"
        >
          {{ showFileUploaderSkeleton ? 'Hide' : 'Show' }} Skeleton
        </Button>
      </div>
      
      <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <FileUploaderSkeleton v-if="showFileUploaderSkeleton" />
        <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
          Click "Show Skeleton" to preview the FileUploader loading state
        </div>
      </div>
    </div>

    <!-- TextInput Skeleton Demo -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          TextInput Skeleton
        </h3>
        <Button 
          @click="toggleTextInputSkeleton" 
          variant="outline" 
          size="sm"
        >
          {{ showTextInputSkeleton ? 'Hide' : 'Show' }} Skeleton
        </Button>
      </div>
      
      <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <TextInputSkeleton v-if="showTextInputSkeleton" />
        <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
          Click "Show Skeleton" to preview the TextInput loading state
        </div>
      </div>
    </div>

    <!-- Both Skeletons Demo -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Both Skeletons
        </h3>
        <Button 
          @click="toggleBothSkeletons" 
          variant="outline" 
          size="sm"
        >
          {{ showBothSkeletons ? 'Hide' : 'Show' }} Both
        </Button>
      </div>
      
      <div v-if="showBothSkeletons" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h4 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            FileUploader Loading
          </h4>
          <FileUploaderSkeleton />
        </div>
        <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h4 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            TextInput Loading
          </h4>
          <TextInputSkeleton />
        </div>
      </div>
      <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
        Click "Show Both" to preview both skeleton components side by side
      </div>
    </div>

    <!-- Features List -->
    <div class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Skeleton Features
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div class="space-y-2">
          <h4 class="font-medium text-slate-700 dark:text-slate-300">Design</h4>
          <ul class="space-y-1 text-slate-600 dark:text-slate-400">
            <li>• Slate color scheme consistency</li>
            <li>• shadcn-vue styling patterns</li>
            <li>• Responsive and mobile-friendly</li>
            <li>• Dark mode support</li>
          </ul>
        </div>
        <div class="space-y-2">
          <h4 class="font-medium text-slate-700 dark:text-slate-300">Technical</h4>
          <ul class="space-y-1 text-slate-600 dark:text-slate-400">
            <li>• Vue 3 Composition API</li>
            <li>• TypeScript with proper types</li>
            <li>• Accessibility attributes</li>
            <li>• Shimmer/pulse animations</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import FileUploaderSkeleton from './FileUploaderSkeleton.vue'
import TextInputSkeleton from './TextInputSkeleton.vue'

// State for controlling skeleton visibility
const showFileUploaderSkeleton = ref(false)
const showTextInputSkeleton = ref(false)
const showBothSkeletons = ref(false)

// Toggle functions
function toggleFileUploaderSkeleton() {
  showFileUploaderSkeleton.value = !showFileUploaderSkeleton.value
}

function toggleTextInputSkeleton() {
  showTextInputSkeleton.value = !showTextInputSkeleton.value
}

function toggleBothSkeletons() {
  showBothSkeletons.value = !showBothSkeletons.value
}
</script>

<style scoped>
/* Additional styles for demo presentation */
.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
