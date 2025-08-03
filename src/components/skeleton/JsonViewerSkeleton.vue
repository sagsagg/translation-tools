<template>
  <div class="space-y-4 animate-pulse">
    <!-- Controls Skeleton -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- Search Input Skeleton -->
        <div class="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        
        <!-- View Mode Selector Skeleton -->
        <div class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      
      <!-- Action Buttons Skeleton -->
      <div class="flex space-x-2">
        <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>

    <!-- Stats Skeleton -->
    <div class="flex items-center space-x-4 text-sm">
      <div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div class="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>

    <!-- JSON Content Skeleton -->
    <div class="border rounded-lg overflow-hidden">
      <div class="p-4 bg-white dark:bg-gray-900">
        <div class="space-y-2">
          <!-- JSON Tree Structure Skeleton -->
          <div class="flex items-center space-x-2">
            <div class="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          
          <!-- Nested Items -->
          <div class="ml-6 space-y-2">
            <div v-for="i in 12" :key="i" class="flex items-center space-x-2">
              <div class="h-3 w-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="h-3 w-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div class="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
          
          <!-- More nested structure -->
          <div class="flex items-center space-x-2">
            <div class="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div class="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          
          <div class="ml-6 space-y-2">
            <div v-for="i in 8" :key="`nested-${i}`" class="flex items-center space-x-2">
              <div class="h-3 w-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="h-3 w-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div class="h-3 w-36 bg-gray-100 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Stats Skeleton -->
    <div class="flex items-center justify-between text-sm">
      <div class="flex space-x-4">
        <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// JsonViewer skeleton loading component
// Provides visual feedback while the JsonViewer component loads
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
