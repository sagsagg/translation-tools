<!-- cSpell:ignore reka -->
<script setup lang="ts">
import { TooltipProvider, type TooltipProviderProps } from 'reka-ui'

// Simple props with static defaults - no reactive computed needed
const props = withDefaults(defineProps<TooltipProviderProps>(), {
  delayDuration: 700,
  skipDelayDuration: 300,
})
</script>

<template>
  <TooltipProvider
    :delay-duration="props.delayDuration"
    :skip-delay-duration="props.skipDelayDuration"
    :disable-hoverable-content="props.disableHoverableContent"
  >
    <slot />
  </TooltipProvider>
</template>
