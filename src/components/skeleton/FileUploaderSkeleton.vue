<template>
  <div class="w-full" role="status" aria-label="Loading file uploader">
    <!-- Main Upload Area Skeleton -->
    <div class="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 bg-slate-50 dark:bg-slate-900/50">
      <!-- Upload Icon Skeleton -->
      <div class="text-center">
        <div class="mx-auto h-12 w-12 mb-4">
          <div class="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>

        <!-- Main Text Skeleton -->
        <div class="space-y-3">
          <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-64 mx-auto animate-pulse"></div>
          
          <!-- Format Badges Skeleton -->
          <div class="flex items-center justify-center space-x-2">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
            <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full px-3 py-1 w-12 animate-pulse"></div>
            <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full px-3 py-1 w-12 animate-pulse"></div>
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
          </div>

          <!-- Info Text Skeleton -->
          <div class="text-xs text-center space-y-1">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-80 mx-auto animate-pulse"></div>
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-72 mx-auto animate-pulse"></div>
          </div>

          <!-- Buttons Skeleton -->
          <div class="flex justify-center gap-2">
            <div class="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-24 animate-pulse"></div>
            <div class="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-8 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- File Naming Guidelines Skeleton (if expanded) -->
    <div class="mt-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-700">
      <div class="space-y-3">
        <!-- Title -->
        <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
        
        <!-- Guidelines List -->
        <div class="space-y-2">
          <div class="flex items-start space-x-2">
            <div class="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full mt-0.5 animate-pulse"></div>
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
          </div>
          <div class="flex items-start space-x-2">
            <div class="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full mt-0.5 animate-pulse"></div>
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
          </div>
          <div class="flex items-start space-x-2">
            <div class="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full mt-0.5 animate-pulse"></div>
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5 animate-pulse"></div>
          </div>
        </div>

        <!-- Examples Section -->
        <div class="mt-4 space-y-2">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
          <div class="bg-slate-100 dark:bg-slate-800 p-3 rounded-md space-y-1">
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-52 animate-pulse"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-44 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Screen reader text -->
    <span class="sr-only">Loading file upload interface...</span>
  </div>
</template>

<script setup lang="ts">
// No props needed for skeleton component
</script>

<style scoped>
/* Enhanced shimmer animation for better visual feedback */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Optional: Add shimmer effect for more sophisticated loading */
.shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

/* Dark mode shimmer */
.dark .shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
}
</style>
