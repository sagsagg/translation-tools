<template>
  <div class="space-y-4" role="status" aria-label="Loading text input interface">
    <!-- Format Selection Skeleton -->
    <div class="space-y-3">
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
      
      <!-- Radio Group Skeleton -->
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-2">
          <div class="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
        </div>
        <div class="flex items-center space-x-2">
          <div class="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-10 animate-pulse"></div>
        </div>
      </div>
      
      <!-- Format Description Skeleton -->
      <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-72 animate-pulse"></div>
    </div>

    <!-- Text Input Area Skeleton -->
    <div class="space-y-2">
      <!-- Header with Label and Buttons -->
      <div class="flex items-center justify-between">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
        <div class="flex items-center space-x-2">
          <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
          <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      <!-- Large Textarea Skeleton -->
      <div class="min-h-[200px] w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-md p-3 relative overflow-hidden">
        <!-- Simulated text lines -->
        <div class="space-y-2">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-36 animate-pulse"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-52 animate-pulse"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28 animate-pulse"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-44 animate-pulse"></div>
        </div>
        
        <!-- Shimmer overlay for textarea -->
        <div class="absolute inset-0 shimmer opacity-30"></div>
      </div>
    </div>

    <!-- Validation Feedback Skeleton -->
    <div class="space-y-2">
      <!-- Success/Error Indicator Skeleton -->
      <div class="flex items-center space-x-2">
        <div class="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse"></div>
      </div>
      
      <!-- Additional validation messages -->
      <div class="flex items-start space-x-2">
        <div class="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full mt-0.5 animate-pulse"></div>
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-80 animate-pulse"></div>
      </div>
    </div>

    <!-- Process Button Skeleton -->
    <div class="flex justify-end">
      <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-32 animate-pulse"></div>
    </div>

    <!-- Screen reader text -->
    <span class="sr-only">Loading text input interface...</span>
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

/* Shimmer effect for more sophisticated loading */
.shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(148, 163, 184, 0.4),
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
    rgba(148, 163, 184, 0.1),
    transparent
  );
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .space-y-4 > * {
    margin-top: 1rem;
  }
  
  /* Adjust button spacing on mobile */
  .flex.justify-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .flex.justify-between .flex {
    align-self: flex-end;
  }
}
</style>
