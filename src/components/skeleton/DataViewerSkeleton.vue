<template>
  <div class="w-full space-y-4 animate-pulse">
    <!-- View Controls Skeleton -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- View Toggle Skeleton -->
        <div class="flex items-center space-x-2">
          <div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="flex border rounded-lg overflow-hidden">
            <div class="h-8 w-16 bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-8 w-16 bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-8 w-16 bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
      
      <!-- Export Button Skeleton -->
      <div class="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>

    <!-- Search Controls Skeleton -->
    <div class="flex items-center space-x-4">
      <div class="flex-1">
        <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div class="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div class="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>

    <!-- Language Filter Skeleton -->
    <div class="flex items-center space-x-2">
      <div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div class="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>

    <!-- Content Area Skeleton -->
    <div class="border rounded-lg p-4">
      <div class="space-y-3">
        <!-- Header Row -->
        <div class="flex space-x-4">
          <div class="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        
        <!-- Data Rows -->
        <div v-for="i in 8" :key="i" class="flex space-x-4">
          <div class="h-5 w-32 bg-gray-100 dark:bg-gray-800 rounded"></div>
          <div class="h-5 w-32 bg-gray-100 dark:bg-gray-800 rounded"></div>
          <div class="h-5 w-32 bg-gray-100 dark:bg-gray-800 rounded"></div>
          <div class="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Pagination Skeleton -->
    <div class="flex items-center justify-between">
      <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div class="flex space-x-2">
        <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// DataViewer skeleton loading component
// Provides visual feedback while the main DataViewer component loads
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
