<template>
  <div class="mt-4 space-y-3 animate-pulse">
    <!-- Header Skeleton -->
    <div class="flex items-center justify-between">
      <div class="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div class="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>

    <!-- Files List Skeleton -->
    <div class="space-y-2 max-h-48 overflow-y-auto">
      <!-- File Item Skeleton -->
      <div v-for="i in 3" :key="i" class="p-3 border rounded-lg bg-white dark:bg-gray-900">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 min-w-0 flex-1">
            <!-- File Icon Skeleton -->
            <div class="flex-shrink-0">
              <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            
            <!-- File Info Skeleton -->
            <div class="min-w-0 flex-1">
              <div class="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
              <div class="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
          
          <!-- Action Buttons Skeleton -->
          <div class="flex items-center space-x-2">
            <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// UploadedFilesList skeleton loading component
// Provides visual feedback while the UploadedFilesList component loads
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
