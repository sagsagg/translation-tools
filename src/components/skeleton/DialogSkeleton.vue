<template>
  <div class="space-y-4 animate-pulse">
    <!-- Dialog Header Skeleton -->
    <div class="flex items-center justify-between">
      <div class="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div class="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>

    <!-- Dialog Content Skeleton -->
    <div class="space-y-4">
      <!-- Form Fields Skeleton -->
      <div class="space-y-2">
        <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      
      <div class="space-y-2">
        <div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      
      <!-- Optional Language Field -->
      <div class="space-y-2">
        <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>

    <!-- Dialog Actions Skeleton -->
    <div class="flex items-center justify-end space-x-2">
      <div class="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div class="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dialog skeleton loading component
// Provides visual feedback while dialog components load
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
